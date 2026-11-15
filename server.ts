import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolvePort(): number {
  const portFlagIndex = process.argv.findIndex((arg) => arg === '--port' || arg === '-p');
  if (portFlagIndex !== -1 && process.argv[portFlagIndex + 1]) {
    const parsed = Number(process.argv[portFlagIndex + 1]);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  const portEq = process.argv.find((arg) => arg.startsWith('--port='));
  if (portEq) {
    const parsed = Number(portEq.split('=')[1]);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return Number(process.env.PORT || 3000);
}

const PORT = resolvePort();
const IS_PROD = process.env.NODE_ENV === 'production';

function getNasaApiKey(): string {
  return (process.env.NASA_API_KEY || '').trim();
}

interface CacheEntry<T> {
  value: T;
  fetchedAt: string;
  expiresAt: number;
}

// Primary TTL cache (stores ONLY valid live responses — never failed fallbacks)
const memoryCache = new Map<string, CacheEntry<unknown>>();
// Last-known-good verified telemetry cache used strictly as stale-while-error fallback
const lastGoodCache = new Map<string, { value: unknown; fetchedAt: string }>();

function getCached<T>(key: string, bypassCache = false): CacheEntry<T> | null {
  if (bypassCache) return null;
  const hit = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return hit;
}

function setCached<T>(key: string, value: T, ttlMs: number): CacheEntry<T> {
  const fetchedAt = new Date().toISOString();
  const entry: CacheEntry<T> = {
    value,
    fetchedAt,
    expiresAt: Date.now() + ttlMs
  };
  memoryCache.set(key, entry);
  lastGoodCache.set(key, { value, fetchedAt });
  return entry;
}

function getLastGood<T>(key: string): { value: T; fetchedAt: string } | null {
  const hit = lastGoodCache.get(key);
  if (!hit) return null;
  return { value: hit.value as T, fetchedAt: hit.fetchedAt };
}

function sanitizeErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : 'Upstream service unavailable';
  return raw.replace(/api_key=[^&\s]+/gi, 'api_key=REDACTED');
}

function isRetryableStatus(status?: number): boolean {
  if (!status) return true; // network/abort/timeout error
  return status === 408 || status === 429 || status >= 500;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options?: { timeoutMs?: number; maxAttempts?: number }
): Promise<globalThis.Response> {
  const timeoutMs = options?.timeoutMs ?? 6500;
  const maxAttempts = options?.maxAttempts ?? 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs)
      });
      if (!response.ok) {
        const err = new Error(`Upstream returned HTTP ${response.status}`) as Error & { status?: number };
        err.status = response.status;
        if (attempt < maxAttempts && isRetryableStatus(response.status)) {
          lastError = err;
          await sleep(300 + Math.floor(Math.random() * 150));
          continue;
        }
        throw err;
      }
      return response;
    } catch (err) {
      lastError = err;
      const status = (err as { status?: number } | null)?.status;
      if (attempt < maxAttempts && isRetryableStatus(status)) {
        await sleep(300 + Math.floor(Math.random() * 150));
        continue;
      }
      throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Upstream request failed');
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 6500): Promise<{ status: number; data: T }> {
  const response = await fetchWithRetry(
    url,
    {
      headers: {
        'User-Agent': 'OutpostSurvival-SpaceApps2026/1.0',
        Accept: 'application/json'
      }
    },
    { timeoutMs, maxAttempts: 2 }
  );

  const text = await response.text();
  try {
    return { status: response.status, data: JSON.parse(text) as T };
  } catch {
    throw new Error('Upstream returned invalid JSON');
  }
}

async function fetchTextWithTimeout(url: string, timeoutMs = 6500): Promise<string> {
  const response = await fetchWithRetry(
    url,
    {
      headers: { 'User-Agent': 'OutpostSurvival-SpaceApps2026/1.0' }
    },
    { timeoutMs, maxAttempts: 2 }
  );
  return response.text();
}

function isoDateDaysAgo(days: number): string {
  const d = new Date(Date.now() - days * 86400 * 1000);
  return d.toISOString().split('T')[0];
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed);
}

interface DonkiEventOut {
  id: string;
  eventType: 'cme' | 'solar_flare' | 'geomagnetic' | 'sep';
  title: string;
  timestamp: string;
  source: string;
  sourceUrl: string;
  summary: string;
  metrics: Record<string, string | number>;
  gameplayRelevance: string;
  status: 'live' | 'cached' | 'archive';
}

const CURATED_DONKI_FALLBACK: DonkiEventOut[] = [
  {
    id: 'DONKI-2024-X58-ARCHIVE',
    eventType: 'solar_flare',
    title: 'Extreme X5.8 Solar Flare (AR 3664 Reference Event)',
    timestamp: '2024-05-10T17:44:00Z',
    source: 'NASA DONKI / NOAA GOES-16 XRS (Verified Benchmark Archive)',
    sourceUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/30613/1',
    summary:
      'Verified May 2024 X5.8 solar flare observed by GOES-16 from Active Region 3664 during the historic G5 space-weather storm sequence.',
    metrics: {
      'Flare Class': 'X5.8',
      'Active Region': 'AR 3664',
      'Instrument': 'GOES-16 EXIS / XRS',
      'Data Context': 'Heliophysics X-ray Flux (Not Astronaut Dose)'
    },
    gameplayRelevance:
      'Informs Solar Flare storm warnings: astronauts outside shielded habitats face elevated solar proton risk during eruptive X-class flare/CME windows.',
    status: 'archive'
  },
  {
    id: 'DONKI-2024-CME-ARCHIVE',
    eventType: 'cme',
    title: 'Fast Halo Coronal Mass Ejection (CME)',
    timestamp: '2024-05-11T02:08:00Z',
    source: 'NASA DONKI / SOHO LASCO Coronagraph (Verified Benchmark Archive)',
    sourceUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/',
    summary:
      'Magnetized plasma eruption tracked leaving the Sun in SOHO LASCO C2/C3 coronagraph imagery, illustrating the lead time between solar eruption and interplanetary shock arrival.',
    metrics: {
      'Event Type': 'Full Halo CME',
      'Observatory': 'SOHO LASCO C2/C3',
      'Detection Window': 'Coronagraph Tracking',
      'Data Context': 'Solar Wind Shock Forecast'
    },
    gameplayRelevance:
      'Demonstrates why deep-space crews watch DONKI CME alerts for hours of advance shelter preparation.',
    status: 'archive'
  }
];

function normalizeDonkiCme(raw: unknown): DonkiEventOut | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.activityID === 'string' ? item.activityID : '';
  if (!id) return null;
  const startTime = typeof item.startTime === 'string' ? item.startTime : new Date().toISOString();
  const instruments = Array.isArray(item.instruments)
    ? item.instruments
        .map((ins) => (ins && typeof ins === 'object' ? String((ins as Record<string, unknown>).displayName || '') : ''))
        .filter(Boolean)
    : [];
  const analyses = Array.isArray(item.cmeAnalyses) ? item.cmeAnalyses : [];
  const primaryAnalysis =
    analyses.find((a) => a && typeof a === 'object' && (a as Record<string, unknown>).isMostAccurate) || analyses[0];
  const speed =
    primaryAnalysis && typeof primaryAnalysis === 'object' && typeof (primaryAnalysis as Record<string, unknown>).speed === 'number'
      ? `${(primaryAnalysis as Record<string, unknown>).speed} km/s`
      : 'Tracked in Coronagraph';
  const note =
    typeof item.note === 'string' && item.note.trim()
      ? item.note.trim().slice(0, 260)
      : 'Coronal Mass Ejection detected by NASA/NOAA heliophysics observatories.';

  return {
    id,
    eventType: 'cme',
    title: `Coronal Mass Ejection (${id.slice(0, 10)})`,
    timestamp: startTime,
    source: 'NASA CCMC / DONKI Live Space Weather Service',
    sourceUrl: typeof item.link === 'string' ? item.link : 'https://ccmc.gsfc.nasa.gov/DONKI/',
    summary: note,
    metrics: {
      'Event ID': id,
      'Observed Start': startTime,
      'Measured Speed': speed,
      'Observatory': instruments[0] || 'SOHO / GOES CCOR'
    },
    gameplayRelevance:
      'Tracks solar plasma eruptions propagating across the inner solar system; does NOT measure personal astronaut absorbed radiation dose.',
    status: 'live'
  };
}

function normalizeDonkiFlr(raw: unknown): DonkiEventOut | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.flrID === 'string' ? item.flrID : '';
  if (!id) return null;
  const classType = typeof item.classType === 'string' ? item.classType : 'Solar Flare';
  const peakTime =
    (typeof item.peakTime === 'string' && item.peakTime) ||
    (typeof item.beginTime === 'string' && item.beginTime) ||
    new Date().toISOString();
  const instruments = Array.isArray(item.instruments)
    ? item.instruments
        .map((ins) => (ins && typeof ins === 'object' ? String((ins as Record<string, unknown>).displayName || '') : ''))
        .filter(Boolean)
    : [];
  const location = typeof item.sourceLocation === 'string' && item.sourceLocation ? item.sourceLocation : 'Solar Disk';

  return {
    id,
    eventType: 'solar_flare',
    title: `${classType} Solar Flare`,
    timestamp: peakTime,
    source: 'NASA CCMC / DONKI Heliophysics Service',
    sourceUrl: typeof item.link === 'string' ? item.link : 'https://ccmc.gsfc.nasa.gov/DONKI/',
    summary:
      typeof item.note === 'string' && item.note.trim()
        ? item.note.trim().slice(0, 260)
        : `Solar X-ray flare (${classType}) recorded near ${location}.`,
    metrics: {
      'Flare Class': classType,
      'Peak Time (UTC)': peakTime,
      'Solar Region': location,
      'Instrument': instruments[0] || 'GOES EXIS'
    },
    gameplayRelevance:
      classType.startsWith('X') || classType.startsWith('M')
        ? 'Elevated solar flare activity detected; watch for associated energetic particles and shelter alerts.'
        : 'Routine solar X-ray brightening logged by heliophysics sensors (not an astronaut radiation dose value).',
    status: 'live'
  };
}

function normalizeDonkiGst(raw: unknown): DonkiEventOut | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.gstID === 'string' ? item.gstID : '';
  if (!id) return null;
  const startTime = typeof item.startTime === 'string' ? item.startTime : new Date().toISOString();
  const kpList = Array.isArray(item.allKpIndex) ? item.allKpIndex : [];
  const maxKp = kpList.reduce((acc: number, entry) => {
    const val = entry && typeof entry === 'object' ? Number((entry as Record<string, unknown>).kpIndex || 0) : 0;
    return val > acc ? val : acc;
  }, 0);

  return {
    id,
    eventType: 'geomagnetic',
    title: `Geomagnetic Storm (Kp ${maxKp || 'Observed'})`,
    timestamp: startTime,
    source: 'NASA CCMC / DONKI Live Space Weather Service',
    sourceUrl: typeof item.link === 'string' ? item.link : 'https://ccmc.gsfc.nasa.gov/DONKI/',
    summary: `Geomagnetic disturbance recorded in Earth’s magnetosphere (${id}). Relevant to LEO/ISS missions; the Moon and Mars lack Earth-scale global dipole magnetospheres.`,
    metrics: {
      'Peak Kp Index': maxKp || 'N/A',
      'Start (UTC)': startTime,
      'Context': 'Earth Magnetosphere Only'
    },
    gameplayRelevance:
      'Illustrates solar wind coupling with planetary magnetic fields compared to unshielded lunar environments.',
    status: 'live'
  };
}

function normalizeDonkiSep(raw: unknown): DonkiEventOut | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.sepID === 'string' ? item.sepID : '';
  if (!id) return null;
  const eventTime = typeof item.eventTime === 'string' ? item.eventTime : new Date().toISOString();
  const instruments = Array.isArray(item.instruments)
    ? item.instruments
        .map((ins) => (ins && typeof ins === 'object' ? String((ins as Record<string, unknown>).displayName || '') : ''))
        .filter(Boolean)
    : [];

  return {
    id,
    eventType: 'sep',
    title: 'Solar Energetic Particle (SEP) Event',
    timestamp: eventTime,
    source: 'NASA CCMC / DONKI Live Space Weather Service',
    sourceUrl: typeof item.link === 'string' ? item.link : 'https://ccmc.gsfc.nasa.gov/DONKI/',
    summary: 'High-energy solar protons accelerated into interplanetary space following solar eruptive activity.',
    metrics: {
      'SEP ID': id,
      'Event Time (UTC)': eventTime,
      'Instrument': instruments[0] || 'GOES / SOHO Particle Sensor'
    },
    gameplayRelevance:
      'SEP events are the primary radiation hazard requiring pressurized regolith/water storm shelters on Moon & Mars.',
    status: 'live'
  };
}

async function fetchDonkiEndpoint(
  endpoint: 'CME' | 'FLR' | 'GST' | 'SEP',
  startDate: string,
  endDate: string,
  apiKey: string
): Promise<{ data: unknown[]; hostUsed: string }> {
  const ccmcUrl = `https://ccmc.gsfc.nasa.gov/DONKI/WS/get/${endpoint}?startDate=${startDate}&endDate=${endDate}`;

  if (apiKey) {
    const gatewayUrl = `https://api.nasa.gov/DONKI/${endpoint}?startDate=${startDate}&endDate=${endDate}&api_key=${encodeURIComponent(apiKey)}`;
    try {
      const { data } = await fetchJsonWithTimeout<unknown[]>(gatewayUrl, 6500);
      if (Array.isArray(data)) {
        return { data, hostUsed: 'api.nasa.gov' };
      }
    } catch {
      // api.nasa.gov gateway intermittently returns 404/429 (e.g. /DONKI/FLR); fall through to official NASA CCMC host
    }
  }

  const { data } = await fetchJsonWithTimeout<unknown[]>(ccmcUrl, 6500);
  if (!Array.isArray(data)) {
    throw new Error(`DONKI ${endpoint} returned non-array payload`);
  }
  return { data, hostUsed: 'ccmc.gsfc.nasa.gov' };
}

interface NormalizedOsdrStudy {
  accession: string;
  numericId: string;
  title: string;
  description: string;
  factors: string[];
  assayTypes: string[];
  sourceName: string;
  sourceUrl: string;
  retrievedAt: string;
  status: 'live' | 'cached';
}

const RADLAB_FALLBACK_ITEMS = [
  {
    id: 'RADLAB-MSL-SURFACE',
    sourceName: 'NASA OSDR RadLab — Curiosity MSL RAD',
    sourceUrl: 'https://visualization.osdr.nasa.gov/radlab/',
    celestialBody: 'Mars',
    spacecraft: 'Curiosity',
    instrument: 'RAD',
    instrumentId: 'MSL-RAD-Surface',
    measurementContext: 'mars_surface',
    contextLabel: 'Mars Surface (Gale Crater)',
    unit: 'μGy/hour',
    sampleWindowUtc: '2020-01-01T00:00Z to 2020-01-02T00:00Z',
    sampleCount: 81,
    minDoseRate: 8.2423,
    meanDoseRate: 9.2775,
    maxDoseRate: 11.5985,
    scientificCaveat: 'Measured on Mars surface at Gale Crater; reflects ~50% sky blocking + thin CO₂ atmosphere.'
  },
  {
    id: 'RADLAB-LRO-MOON-ORBIT',
    sourceName: 'NASA OSDR RadLab — LRO CRaTER',
    sourceUrl: 'https://visualization.osdr.nasa.gov/radlab/',
    celestialBody: 'Moon',
    spacecraft: 'LRO',
    instrument: 'CRaTER',
    instrumentId: 'CRaTER-D1D2',
    measurementContext: 'lunar_orbit',
    contextLabel: 'Lunar Orbit (~50 km Altitude — NOT Surface)',
    unit: 'μGy/hour',
    sampleWindowUtc: '2020-01-01T00:00Z to 2020-01-02T00:00Z',
    sampleCount: 24,
    minDoseRate: 12.4417,
    meanDoseRate: 13.2146,
    maxDoseRate: 14.0921,
    scientificCaveat: 'Lunar orbital dosimetry only; NOT a direct Moon surface measurement.'
  },
  {
    id: 'RADLAB-TGO-MARS-ORBIT',
    sourceName: 'NASA OSDR RadLab — ExoMars TGO Liulin-MO',
    sourceUrl: 'https://visualization.osdr.nasa.gov/radlab/',
    celestialBody: 'Mars',
    spacecraft: 'TGO',
    instrument: 'Liulin-MO',
    instrumentId: 'Liulin-MO-CD-Orbit',
    measurementContext: 'mars_orbit',
    contextLabel: 'Mars Orbit (NOT Surface)',
    unit: 'μGy/hour',
    sampleWindowUtc: '2020-01-01T00:00Z to 2020-01-02T00:00Z',
    sampleCount: 1371,
    minDoseRate: 10.24,
    meanDoseRate: 17.3107,
    maxDoseRate: 40.26,
    scientificCaveat: 'Martian orbital dosimetry; lacks Mars atmospheric and ground shielding.'
  },
  {
    id: 'RADLAB-ISS-LEO',
    sourceName: 'NASA OSDR RadLab — ISS DosTel2',
    sourceUrl: 'https://visualization.osdr.nasa.gov/radlab/',
    celestialBody: 'Earth',
    spacecraft: 'ISS',
    instrument: 'DosTel2',
    instrumentId: 'DosTel2',
    measurementContext: 'earth_leo_orbit',
    contextLabel: 'Earth Low Earth Orbit (ISS Interior — NOT Moon/Mars)',
    unit: 'μGy/hour',
    sampleWindowUtc: '2020-01-01T00:00Z to 2020-01-01T06:00Z',
    sampleCount: 250,
    minDoseRate: 1.3101,
    meanDoseRate: 44.7074,
    maxDoseRate: 411.5851,
    scientificCaveat:
      'ISS LEO interior shielded by Earth’s magnetosphere with brief South Atlantic Anomaly peaks; never treat as Moon/Mars surface.'
  }
];

interface RadLabApiJson {
  columns?: string[];
  data?: Array<Array<string | number | null>>;
}

async function queryRadLabWindow(
  queryExpr: string,
  filterInstrumentId?: string
): Promise<{ count: number; min: number; mean: number; max: number } | null> {
  const url =
    `https://visualization.osdr.nasa.gov/radlab/api/?query=${encodeURIComponent(queryExpr)}` +
    '&fields+=timestamp,absorbed_dose_rate,instrument,instrument_id,spacecraft,celestial_body&format=json';
  const { data } = await fetchJsonWithTimeout<RadLabApiJson>(url, 7500);
  if (!data || !Array.isArray(data.columns) || !Array.isArray(data.data)) return null;
  const idxRate = data.columns.indexOf('absorbed_dose_rate');
  const idxInstId = data.columns.indexOf('instrument_id');
  if (idxRate === -1) return null;

  const values: number[] = [];
  for (const row of data.data) {
    if (filterInstrumentId && idxInstId !== -1 && String(row[idxInstId] || '') !== filterInstrumentId) {
      continue;
    }
    const v = Number(row[idxRate]);
    if (Number.isFinite(v)) values.push(v);
  }
  if (values.length === 0) return null;

  let min = values[0];
  let max = values[0];
  let sum = 0;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }
  return {
    count: values.length,
    min: Number(min.toFixed(4)),
    mean: Number((sum / values.length).toFixed(4)),
    max: Number(max.toFixed(4))
  };
}

interface MarsTrekLayerSpec {
  id: string;
  siteId: string;
  group: 'jezero' | 'global';
  layerId: string;
  capabilitiesUrl: string;
  pathTemplate: string;
  contentType: string;
  maxZ: number;
}

const MARS_TREK_ALLOWLIST: Record<string, MarsTrekLayerSpec> = {
  jezero_ctx: {
    id: 'jezero_ctx',
    siteId: 'MARSTREK-JEZERO-CTX',
    group: 'jezero',
    layerId: 'JEZ_ctx_B_soc_008_orthoMosaic_6m_Eqc_latTs0_lon0',
    capabilitiesUrl:
      'https://trek.nasa.gov/tiles/Mars/EQ/JEZ_ctx_B_soc_008_orthoMosaic_6m_Eqc_latTs0_lon0/1.0.0/WMTSCapabilities.xml',
    pathTemplate:
      'https://trek.nasa.gov/tiles/Mars/EQ/JEZ_ctx_B_soc_008_orthoMosaic_6m_Eqc_latTs0_lon0/1.0.0//default/default028mm/{z}/{row}/{col}.png',
    contentType: 'image/png',
    maxZ: 12
  },
  jezero_hirise: {
    id: 'jezero_hirise',
    siteId: 'MARSTREK-JEZERO-HIRISE',
    group: 'jezero',
    layerId: 'JEZ_hirise_soc_006_orthoMosaic_25cm_Eqc_latTs0_lon0_first_dd',
    capabilitiesUrl:
      'https://trek.nasa.gov/tiles/Mars/EQ/JEZ_hirise_soc_006_orthoMosaic_25cm_Eqc_latTs0_lon0_first_dd/1.0.0/WMTSCapabilities.xml',
    pathTemplate:
      'https://trek.nasa.gov/tiles/Mars/EQ/JEZ_hirise_soc_006_orthoMosaic_25cm_Eqc_latTs0_lon0_first_dd/1.0.0//default/default028mm/{z}/{row}/{col}.png',
    contentType: 'image/png',
    maxZ: 17
  },
  viking_global: {
    id: 'viking_global',
    siteId: 'MARSTREK-VIKING-GLOBAL',
    group: 'global',
    layerId: 'Mars_Viking_MDIM21_ClrMosaic_global_232m',
    capabilitiesUrl:
      'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/WMTSCapabilities.xml',
    pathTemplate:
      'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0//default/default028mm/{z}/{row}/{col}.jpg',
    contentType: 'image/jpeg',
    maxZ: 6
  }
};

function createApiRouter(): express.Router {
  const router = express.Router();

  router.get('/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      service: 'outpost-survival-nasa-proxy',
      hasNasaApiKey: Boolean(getNasaApiKey()),
      donkiMode: getNasaApiKey() ? 'api_gateway_with_ccmc_fallback' : 'ccmc_direct_unauthenticated',
      timestamp: new Date().toISOString()
    });
  });

  // 1. NASA DONKI Space Weather Proxy (supports NASA_API_KEY + official CCMC unauthenticated host)
  router.get('/nasa/donki', async (req: Request, res: Response) => {
    const rawType = typeof req.query.type === 'string' ? req.query.type.toLowerCase() : 'all';
    const allowedTypes = new Set(['all', 'cme', 'flr', 'gst', 'sep']);
    if (!allowedTypes.has(rawType)) {
      res.status(400).json({ error: 'Invalid type parameter. Allowed: all, cme, flr, gst, sep.' });
      return;
    }

    const rawDays = typeof req.query.days === 'string' ? Number(req.query.days) : 30;
    if (!Number.isInteger(rawDays) || rawDays < 1 || rawDays > 60) {
      res.status(400).json({ error: 'Invalid days parameter. Must be an integer between 1 and 60.' });
      return;
    }

    let startDate = isoDateDaysAgo(rawDays);
    let endDate = isoDateDaysAgo(0);

    if (typeof req.query.startDate === 'string' || typeof req.query.endDate === 'string') {
      const qStart = typeof req.query.startDate === 'string' ? req.query.startDate.trim() : startDate;
      const qEnd = typeof req.query.endDate === 'string' ? req.query.endDate.trim() : endDate;
      if (!isValidIsoDate(qStart) || !isValidIsoDate(qEnd)) {
        res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD for startDate/endDate.' });
        return;
      }
      if (qStart > qEnd) {
        res.status(400).json({ error: 'startDate cannot be after endDate.' });
        return;
      }
      const spanDays = Math.ceil((Date.parse(`${qEnd}T00:00:00Z`) - Date.parse(`${qStart}T00:00:00Z`)) / 86400000);
      if (spanDays > 60) {
        res.status(400).json({ error: 'Date span cannot exceed 60 days.' });
        return;
      }
      startDate = qStart;
      endDate = qEnd;
    }

    const bypassCache = req.query.refresh === 'true';
    const cacheKey = `donki:${rawType}:${startDate}:${endDate}`;
    const cached = getCached<Record<string, unknown>>(cacheKey, bypassCache);
    if (cached) {
      res.json({ ...cached.value, status: 'live', fromCache: true, fetchedAt: cached.fetchedAt });
      return;
    }

    const apiKey = getNasaApiKey();
    const events: DonkiEventOut[] = [];
    const warnings: string[] = [];
    const hostsUsed = new Set<string>();
    let succeededEndpoints = 0;

    const endpoints: Array<{ key: 'CME' | 'FLR' | 'GST' | 'SEP'; enabled: boolean }> = [
      { key: 'CME', enabled: rawType === 'all' || rawType === 'cme' },
      { key: 'FLR', enabled: rawType === 'all' || rawType === 'flr' },
      { key: 'GST', enabled: rawType === 'all' || rawType === 'gst' },
      { key: 'SEP', enabled: rawType === 'all' || rawType === 'sep' }
    ];

    await Promise.allSettled(
      endpoints
        .filter((e) => e.enabled)
        .map(async (ep) => {
          try {
            const { data, hostUsed } = await fetchDonkiEndpoint(ep.key, startDate, endDate, apiKey);
            hostsUsed.add(hostUsed);
            succeededEndpoints += 1;

            if (ep.key === 'CME') {
              for (const item of data.slice(-4).reverse()) {
                const norm = normalizeDonkiCme(item);
                if (norm) events.push(norm);
              }
            } else if (ep.key === 'FLR') {
              for (const item of data.slice(-4).reverse()) {
                const norm = normalizeDonkiFlr(item);
                if (norm) events.push(norm);
              }
            } else if (ep.key === 'GST') {
              for (const item of data.slice(-3).reverse()) {
                const norm = normalizeDonkiGst(item);
                if (norm) events.push(norm);
              }
            } else if (ep.key === 'SEP') {
              for (const item of data.slice(-3).reverse()) {
                const norm = normalizeDonkiSep(item);
                if (norm) events.push(norm);
              }
            }
          } catch (e) {
            warnings.push(`DONKI ${ep.key}: ${sanitizeErrorMessage(e)}`);
          }
        })
    );

    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (succeededEndpoints === 0) {
      const lastGood = getLastGood<Record<string, unknown>>(cacheKey);
      if (lastGood) {
        res.json({
          ...lastGood.value,
          status: 'cached',
          fromCache: true,
          stale: true,
          fetchedAt: lastGood.fetchedAt,
          warnings: [...warnings, 'Live DONKI upstream unavailable; serving previously verified cached telemetry.']
        });
        return;
      }

      res.status(502).json({
        error: 'Unable to reach NASA DONKI live space-weather endpoints.',
        source: 'NASA DONKI Space Weather Database',
        sourceUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/',
        status: 'error',
        fallbackStatus: 'archive',
        warnings,
        archiveFallback: CURATED_DONKI_FALLBACK,
        fetchedAt: new Date().toISOString()
      });
      return;
    }

    const payload = {
      source: 'NASA CCMC / DONKI Space Weather Database',
      sourceUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/',
      upstreamHosts: Array.from(hostsUsed),
      apiKeyConfigured: Boolean(apiKey),
      window: { startDate, endDate, days: rawDays },
      status: 'live' as const,
      emptyWindow: events.length === 0,
      disclaimer:
        'DONKI reports heliophysics space-weather events (flares, CMEs, SEPs, geomagnetic storms). It does not directly measure an astronaut’s absorbed radiation dose.',
      warnings,
      events
    };

    const entry = setCached(cacheKey, payload, 15 * 60 * 1000);
    res.json({ ...payload, fromCache: false, fetchedAt: entry.fetchedAt });
  });

  // 2. NASA OSDR Study Metadata Proxy
  router.get('/nasa/osdr/study/:id', async (req: Request, res: Response) => {
    const rawId = String(req.params.id || '').trim();
    const match = /^(?:OSD-)?(\d{1,6})$/i.exec(rawId);
    if (!match) {
      res.status(400).json({ error: 'Invalid OSDR study ID. Use a numeric ID like 120 or OSD-120.' });
      return;
    }

    const numericId = match[1];
    const accession = `OSD-${numericId}`;
    const bypassCache = req.query.refresh === 'true';
    const cacheKey = `osdr:${accession}`;
    const cached = getCached<NormalizedOsdrStudy>(cacheKey, bypassCache);
    if (cached) {
      res.json({ ...cached.value, status: 'cached', fromCache: true, retrievedAt: cached.fetchedAt });
      return;
    }

    try {
      const { data } = await fetchJsonWithTimeout<Record<string, unknown>>(
        `https://osdr.nasa.gov/osdr/data/osd/meta/${numericId}`,
        7500
      );

      const hits = Number(data?.hits || 0);
      if (!hits || !data?.study || typeof data.study !== 'object') {
        res.status(404).json({ error: `Study ${accession} was not found in NASA OSDR.` });
        return;
      }

      const studyWrap = (data.study as Record<string, unknown>)[accession] as Record<string, unknown> | undefined;
      const studyList = Array.isArray(studyWrap?.studies) ? studyWrap.studies : [];
      const primary = (studyList[0] || null) as Record<string, unknown> | null;
      const title = primary && typeof primary.title === 'string' ? primary.title.trim() : '';

      if (!title) {
        res.status(404).json({ error: `Study ${accession} returned incomplete metadata from NASA OSDR.` });
        return;
      }

      const rawDesc = typeof primary?.description === 'string' ? primary.description.replace(/\s+/g, ' ').trim() : '';
      const description = rawDesc.length > 420 ? `${rawDesc.slice(0, 417)}...` : rawDesc;

      const factors = Array.isArray(primary?.factors)
        ? primary.factors
            .map((f) => (f && typeof f === 'object' ? String((f as Record<string, unknown>).factorName || '') : ''))
            .filter(Boolean)
        : [];

      const assayTypes = Array.isArray(primary?.assays)
        ? primary.assays
            .map((a) => {
              const mt = a && typeof a === 'object' ? (a as Record<string, unknown>).measurementType : null;
              return mt && typeof mt === 'object' ? String((mt as Record<string, unknown>).annotationValue || '') : '';
            })
            .filter(Boolean)
        : [];

      const normalized: NormalizedOsdrStudy = {
        accession,
        numericId,
        title,
        description,
        factors: Array.from(new Set(factors)),
        assayTypes: Array.from(new Set(assayTypes)),
        sourceName: 'NASA Open Science Data Repository (OSDR)',
        sourceUrl: `https://osdr.nasa.gov/bio/repo/data/studies/${accession}`,
        retrievedAt: new Date().toISOString(),
        status: 'live'
      };

      setCached(cacheKey, normalized, 60 * 60 * 1000);
      res.json({ ...normalized, fromCache: false });
    } catch (e) {
      const lastGood = getLastGood<NormalizedOsdrStudy>(cacheKey);
      if (lastGood) {
        res.json({
          ...lastGood.value,
          status: 'cached',
          fromCache: true,
          stale: true,
          retrievedAt: lastGood.fetchedAt,
          warning: `Live OSDR request failed (${sanitizeErrorMessage(e)}); serving previously cached study metadata.`
        });
        return;
      }

      res.status(502).json({
        error: 'Unable to reach NASA OSDR metadata service right now.',
        details: sanitizeErrorMessage(e),
        status: 'error',
        fallbackStatus: 'archive'
      });
    }
  });

  // 3. NASA RadLab Baselines Proxy (queries all 4 contexts live when live !== 'false')
  router.get('/nasa/radlab/baselines', async (req: Request, res: Response) => {
    const rawContext = typeof req.query.context === 'string' ? req.query.context.toLowerCase() : 'all';
    const allowedContexts = new Set(['all', 'earth_leo_orbit', 'lunar_orbit', 'mars_orbit', 'mars_surface']);
    if (!allowedContexts.has(rawContext)) {
      res.status(400).json({
        error: 'Invalid context parameter. Allowed: all, earth_leo_orbit, lunar_orbit, mars_orbit, mars_surface.'
      });
      return;
    }

    const wantsLive = req.query.live !== 'false';
    const bypassCache = req.query.refresh === 'true';
    const cacheKey = `radlab:${rawContext}:${wantsLive ? 'live' : 'baseline'}`;
    const cached = getCached<Record<string, unknown>>(cacheKey, bypassCache);
    if (cached) {
      res.json({ ...cached.value, fromCache: true, fetchedAt: cached.fetchedAt });
      return;
    }

    const selected = RADLAB_FALLBACK_ITEMS.filter(
      (item) => rawContext === 'all' || item.measurementContext === rawContext
    ).map((item) => ({ ...item, dataOrigin: 'cached' as 'cached' | 'live' | 'archive' }));

    let liveCount = 0;
    const warnings: string[] = [];

    if (wantsLive) {
      const allLiveQueries: Array<{ id: string; context: string; query: string; filterInstrumentId?: string }> = [
        {
          id: 'RADLAB-MSL-SURFACE',
          context: 'mars_surface',
          query: '(celestial_body=Mars)AND(instrument=RAD)AND(timestamp>=2020-01-01)AND(timestamp<2020-01-02)'
        },
        {
          id: 'RADLAB-LRO-MOON-ORBIT',
          context: 'lunar_orbit',
          query: '(celestial_body=Moon)AND(timestamp>=2020-01-01)AND(timestamp<2020-01-02)'
        },
        {
          id: 'RADLAB-TGO-MARS-ORBIT',
          context: 'mars_orbit',
          query: '(celestial_body=Mars)AND(spacecraft=TGO)AND(timestamp>=2020-01-01)AND(timestamp<2020-01-02)',
          filterInstrumentId: 'Liulin-MO-CD-Orbit'
        },
        {
          id: 'RADLAB-ISS-LEO',
          context: 'earth_leo_orbit',
          query: '(celestial_body=Earth)AND(instrument=DosTel2)AND(timestamp>=2020-01-01)AND(timestamp<2020-01-01T06:00)'
        }
      ];

      const liveQueries = allLiveQueries.filter((q) => rawContext === 'all' || q.context === rawContext);

      await Promise.allSettled(
        liveQueries.map(async (qItem) => {
          const target = selected.find((s) => s.id === qItem.id);
          if (!target) return;
          try {
            const stats = await queryRadLabWindow(qItem.query, qItem.filterInstrumentId);
            if (!stats) {
              warnings.push(`${qItem.id}: RadLab query returned no numeric dose rows.`);
              return;
            }
            target.sampleCount = stats.count;
            target.minDoseRate = stats.min;
            target.meanDoseRate = stats.mean;
            target.maxDoseRate = stats.max;
            target.dataOrigin = 'live';
            liveCount += 1;
          } catch (e) {
            warnings.push(`${qItem.id}: ${sanitizeErrorMessage(e)}`);
          }
        })
      );

      if (liveCount === 0) {
        const lastGood = getLastGood<Record<string, unknown>>(cacheKey);
        if (lastGood) {
          res.json({
            ...lastGood.value,
            status: 'cached',
            fromCache: true,
            stale: true,
            fetchedAt: lastGood.fetchedAt,
            warnings: [...warnings, 'Live RadLab queries unavailable; serving previously verified RadLab cache.']
          });
          return;
        }

        res.status(502).json({
          error: 'NASA RadLab live telemetry API failed for all requested datasets.',
          source: 'NASA OSDR RadLab',
          sourceUrl: 'https://visualization.osdr.nasa.gov/radlab/',
          unit: 'μGy/hour',
          status: 'error',
          fallbackStatus: 'archive',
          warnings,
          contextNotice:
            'Orbital measurements (ISS Earth LEO, LRO Lunar Orbit, ExoMars TGO Mars Orbit) are NOT equivalent to planetary surface measurements. No Moon surface dataset is currently available in RadLab.',
          baselines: selected.map((item) => ({ ...item, dataOrigin: 'archive' })),
          fetchedAt: new Date().toISOString()
        });
        return;
      }
    }

    const payload = {
      source: 'NASA OSDR RadLab',
      sourceUrl: 'https://visualization.osdr.nasa.gov/radlab/',
      unit: 'μGy/hour',
      status: wantsLive ? ('live' as const) : ('cached' as const),
      liveCount,
      totalDatasets: selected.length,
      contextNotice:
        'Orbital measurements (ISS Earth LEO, LRO Lunar Orbit, ExoMars TGO Mars Orbit) are NOT equivalent to planetary surface measurements. No Moon surface dataset is currently available in RadLab.',
      warnings,
      baselines: selected
    };

    const entry = setCached(cacheKey, payload, 30 * 60 * 1000);
    res.json({ ...payload, fromCache: false, fetchedAt: entry.fetchedAt });
  });

  // 4. NASA Mars Trek Terrain & WMTS Metadata Proxy
  router.get('/nasa/mars/terrain', async (req: Request, res: Response) => {
    const rawSite = typeof req.query.site === 'string' ? req.query.site.toLowerCase() : 'all';
    if (!['all', 'jezero', 'global'].includes(rawSite)) {
      res.status(400).json({ error: 'Invalid site parameter. Allowed: all, jezero, global.' });
      return;
    }

    const bypassCache = req.query.refresh === 'true';
    const cacheKey = `marstrek:${rawSite}`;
    const cached = getCached<Record<string, unknown>>(cacheKey, bypassCache);
    if (cached) {
      res.json({ ...cached.value, fromCache: true, fetchedAt: cached.fetchedAt });
      return;
    }

    const specsToVerify = Object.values(MARS_TREK_ALLOWLIST).filter(
      (spec) => rawSite === 'all' || spec.group === rawSite
    );

    const verifiedLayers: Record<string, boolean> = {};
    const warnings: string[] = [];
    let verifiedCount = 0;

    await Promise.allSettled(
      specsToVerify.map(async (spec) => {
        try {
          const xml = await fetchTextWithTimeout(spec.capabilitiesUrl, 7000);
          const ok = xml.includes('<Capabilities') && xml.includes(spec.layerId);
          verifiedLayers[spec.id] = ok;
          if (ok) {
            verifiedCount += 1;
          } else {
            warnings.push(`${spec.layerId}: WMTSCapabilities XML missing expected layer identifier.`);
          }
        } catch (e) {
          verifiedLayers[spec.id] = false;
          warnings.push(`${spec.id}: ${sanitizeErrorMessage(e)}`);
        }
      })
    );

    const sites = [
      {
        id: 'MARSTREK-JEZERO-CTX',
        name: 'Jezero Crater Landing Basin (MRO CTX 6m Mosaic)',
        targetBody: 'Mars',
        layerId: 'JEZ_ctx_B_soc_008_orthoMosaic_6m_Eqc_latTs0_lon0',
        resolution: '6 m/pixel',
        centerCoords: { lat: 18.466, lon: 77.43 },
        boundingBox: { minLon: 77.1605, minLat: 18.211, maxLon: 77.6992, maxLat: 18.7212 },
        previewTileUrl: '/api/nasa/mars/tile?layer=jezero_ctx&z=6&row=25&col=91',
        wmtsCapabilitiesUrl: MARS_TREK_ALLOWLIST.jezero_ctx.capabilitiesUrl,
        wmtsVerified: Boolean(verifiedLayers.jezero_ctx),
        scientificCaveat: 'Mars orbital imagery only — do not present as Moon terrain.'
      },
      {
        id: 'MARSTREK-JEZERO-HIRISE',
        name: 'Jezero Crater High-Resolution Traverse Mosaic (HiRISE 25cm)',
        targetBody: 'Mars',
        layerId: 'JEZ_hirise_soc_006_orthoMosaic_25cm_Eqc_latTs0_lon0_first_dd',
        resolution: '25 cm/pixel',
        centerCoords: { lat: 18.38, lon: 77.58 },
        boundingBox: { minLon: 77.2229, minLat: 18.3068, maxLon: 77.584, maxLat: 18.6693 },
        previewTileUrl: '/api/nasa/mars/tile?layer=jezero_hirise&z=8&row=101&col=366',
        wmtsCapabilitiesUrl: MARS_TREK_ALLOWLIST.jezero_hirise.capabilitiesUrl,
        wmtsVerified: Boolean(verifiedLayers.jezero_hirise),
        scientificCaveat: 'Mars orbital HiRISE mosaic only — never present as Moon terrain.'
      },
      {
        id: 'MARSTREK-VIKING-GLOBAL',
        name: 'Global Mars Color Mosaic (Viking MDIM 2.1)',
        targetBody: 'Mars',
        layerId: 'Mars_Viking_MDIM21_ClrMosaic_global_232m',
        resolution: '232 m/pixel',
        centerCoords: { lat: 18.47, lon: 77.43 },
        previewTileUrl: '/api/nasa/mars/tile?layer=viking_global&z=2&row=1&col=5',
        wmtsCapabilitiesUrl: MARS_TREK_ALLOWLIST.viking_global.capabilitiesUrl,
        wmtsVerified: Boolean(verifiedLayers.viking_global),
        scientificCaveat: 'Mars global color mosaic only.'
      }
    ].filter((s) => rawSite === 'all' || (rawSite === 'jezero' ? s.id.includes('JEZERO') : s.id.includes('VIKING')));

    if (verifiedCount === 0) {
      const lastGood = getLastGood<Record<string, unknown>>(cacheKey);
      if (lastGood) {
        res.json({
          ...lastGood.value,
          status: 'cached',
          fromCache: true,
          stale: true,
          fetchedAt: lastGood.fetchedAt,
          warnings: [...warnings, 'Live Mars Trek WMTS check failed; serving previously verified metadata.']
        });
        return;
      }

      res.status(502).json({
        error: 'Unable to verify NASA Mars Trek WMTS capabilities.',
        source: 'NASA Mars Trek WMTS',
        sourceUrl: 'https://trek.nasa.gov/mars/',
        targetBody: 'Mars',
        wmtsVerified: false,
        status: 'error',
        fallbackStatus: 'archive',
        warnings,
        disclaimer: 'Mars Trek serves Martian planetary imagery and elevation services only (never lunar terrain).',
        sites,
        fetchedAt: new Date().toISOString()
      });
      return;
    }

    const payload = {
      source: 'NASA Mars Trek WMTS',
      sourceUrl: 'https://trek.nasa.gov/mars/',
      targetBody: 'Mars',
      wmtsVerified: true,
      verifiedLayers,
      status: 'live' as const,
      warnings,
      disclaimer: 'Mars Trek serves Martian planetary imagery and elevation services only (never lunar terrain).',
      sites
    };

    const entry = setCached(cacheKey, payload, 60 * 60 * 1000);
    res.json({ ...payload, fromCache: false, fetchedAt: entry.fetchedAt });
  });

  // 5. Mars Trek Safe Allowlisted WMTS Tile Proxy
  router.get('/nasa/mars/tile', async (req: Request, res: Response) => {
    const layer = typeof req.query.layer === 'string' ? req.query.layer : '';
    const spec = MARS_TREK_ALLOWLIST[layer];
    if (!spec) {
      res.status(400).json({ error: 'Invalid layer parameter. Allowed: jezero_ctx, jezero_hirise, viking_global.' });
      return;
    }

    const z = Number(req.query.z);
    const row = Number(req.query.row);
    const col = Number(req.query.col);
    if (!Number.isInteger(z) || z < 0 || z > spec.maxZ || !Number.isInteger(row) || row < 0 || !Number.isInteger(col) || col < 0) {
      res.status(400).json({ error: 'Invalid tile coordinates.' });
      return;
    }

    const upstreamUrl = spec.pathTemplate
      .replace('{z}', String(z))
      .replace('{row}', String(row))
      .replace('{col}', String(col));

    try {
      const upstream = await fetchWithRetry(
        upstreamUrl,
        { headers: { 'User-Agent': 'OutpostSurvival-SpaceApps2026/1.0' } },
        { timeoutMs: 7500, maxAttempts: 2 }
      );
      const upstreamType = (upstream.headers.get('content-type') || '').toLowerCase();
      if (!upstreamType.startsWith('image/')) {
        res.status(502).json({ error: 'Upstream Mars Trek tile returned non-image response.' });
        return;
      }
      const buf = Buffer.from(await upstream.arrayBuffer());
      res.setHeader('Content-Type', upstreamType || spec.contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(buf);
    } catch (e) {
      const status = (e as { status?: number } | null)?.status;
      if (status === 404) {
        res.status(404).json({ error: 'Mars Trek tile not found for requested coordinates.' });
        return;
      }
      res.status(502).json({ error: 'Unable to fetch Mars Trek tile.', details: sanitizeErrorMessage(e) });
    }
  });

  // Ensure unmatched /api/* endpoints return JSON 404 rather than HTML SPA fallback
  router.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'API route not found.' });
  });

  return router;
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use('/api', createApiRouter());

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Oops! I'm an Astronaut server listening on http://localhost:${PORT} (mode=${IS_PROD ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', sanitizeErrorMessage(err));
  process.exit(1);
});
