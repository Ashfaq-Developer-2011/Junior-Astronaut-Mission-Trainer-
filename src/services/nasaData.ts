import { NasaObservation } from '../types/game';
import { RADLAB_VERIFIED_BASELINES, RadLabBaseline } from '../data/radlabBaselines';
import { CSA_FOOD_PRODUCTION_RESOURCES, CsaFoodResource } from '../data/csaFoodData';
import { MARS_TREK_SITES, MarsTrekSite } from '../data/marsTrekSites';

export type ScienceFeedStatus = 'live' | 'cached' | 'curated' | 'archive' | 'error';
export type RetryableFeed = 'donki' | 'osdr' | 'radlab' | 'marsTrek';

export interface FeedTelemetry {
  status: ScienceFeedStatus;
  lastUpdatedAt: string | null;
  source: string;
  error?: string;
}

export interface Phase2ScienceBundle {
  observations: NasaObservation[];
  radlabBaselines: RadLabBaseline[];
  csaFoodResources: CsaFoodResource[];
  marsTrekSites: MarsTrekSite[];
  donkiStatus: ScienceFeedStatus;
  osdrStatus: ScienceFeedStatus;
  radlabStatus: ScienceFeedStatus;
  marsTrekStatus: ScienceFeedStatus;
  csaStatus: 'curated';
  feeds: {
    donki: FeedTelemetry;
    osdr: FeedTelemetry;
    radlab: FeedTelemetry;
    marsTrek: FeedTelemetry;
    csa: FeedTelemetry;
  };
  isLive: boolean;
  lastSyncedAt: string;
  warnings: string[];
}

// Verified fallback / curated benchmark observations using real confirmed NASA & CSA records
export const VERIFIED_NASA_ARCHIVE: NasaObservation[] = [
  {
    id: 'DONKI-FLR-2024-X58',
    title: 'Extreme X5.8 Solar Flare (AR 3664 Reference Event)',
    type: 'solar_flare',
    timestamp: '2024-05-10T17:44:00Z',
    source: 'NASA DONKI / NOAA GOES-16 Space Weather Archive',
    sourceUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/30613/1',
    status: 'archived_verified',
    dataOrigin: 'archive',
    measurementContext: 'Heliophysics X-Ray Flux Observation (Not Astronaut Dose)',
    caveat: 'DONKI tracks solar flare/CME events; it does not directly measure an astronaut’s absorbed radiation dose.',
    summary:
      'An X5.8-class solar flare erupted from Active Region 3664 during the May 2024 solar storm period, illuminating space-weather alert procedures.',
    metrics: {
      'Flare Class': 'X5.8 (GOES-16)',
      'Solar Region': 'Active Region 3664',
      'Event Type': 'Solar X-Ray Flare',
      'Data Status': 'Verified Archive'
    },
    gameplayRelevance:
      'Informs Mission 03 radiation shelter drills: EVA crews require storm-shelter shielding during major flare/SEP windows.'
  },
  {
    id: 'OSD-120',
    title: 'Spaceflight Transcriptome Adaptation in Arabidopsis (OSD-120)',
    type: 'biology_osdr',
    timestamp: '2017-01-01T00:00:00Z',
    source: 'NASA Open Science Data Repository (OSDR)',
    sourceUrl: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-120',
    status: 'archived_verified',
    dataOrigin: 'archive',
    measurementContext: 'ISS Spaceflight Plant Molecular Biology (GeneLab / OSDR)',
    summary:
      'Genetic dissection of the Arabidopsis spaceflight transcriptome on the International Space Station, distinguishing physiological adaptation pathways from non-essential gene responses.',
    metrics: {
      'Study Accession': 'OSD-120',
      'Organism': 'Arabidopsis thaliana',
      'Experimental Factors': 'Ecotype, Spaceflight, Treatment',
      'Assays': 'Transcription Profiling, Image Analysis'
    },
    gameplayRelevance:
      'Supports Mission 04 habitat greenhouse design: plant genetics and stress regulation matter when cultivating crops off-Earth.'
  },
  {
    id: 'OSD-520',
    title: 'Multi-Generation Ionizing Radiation & Plant DNA Methylation (OSD-520)',
    type: 'biology_osdr',
    timestamp: '2022-01-01T00:00:00Z',
    source: 'NASA Open Science Data Repository (OSDR)',
    sourceUrl: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-520',
    status: 'archived_verified',
    dataOrigin: 'archive',
    measurementContext: 'Controlled Ionizing Radiation Plant Study (OSDR)',
    summary:
      'Evaluates changes in DNA methylation across multiple generations of Arabidopsis thaliana plants exposed to ionizing radiation.',
    metrics: {
      'Study Accession': 'OSD-520',
      'Organism': 'Arabidopsis thaliana',
      'Experimental Factors': 'Generation, Ionizing Radiation',
      'Assay': 'DNA Methylation Profiling'
    },
    gameplayRelevance:
      'Shows why long-duration outpost greenhouses need radiation shielding to protect multi-generation seed viability.'
  },
  {
    id: 'OSD-46',
    title: 'Gamma & HZE Radiation Response in Seedlings (OSD-46)',
    type: 'biology_osdr',
    timestamp: '2015-01-01T00:00:00Z',
    source: 'NASA Open Science Data Repository (OSDR)',
    sourceUrl: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-46',
    status: 'archived_verified',
    dataOrigin: 'archive',
    measurementContext: 'Ground-Based Radiation & HZE Ion Exposure Study (OSDR)',
    summary:
      'Investigates transcriptional DNA-repair and cell-cycle responses of Arabidopsis seedlings exposed to gamma and high-Z/high-energy (HZE) radiation.',
    metrics: {
      'Study Accession': 'OSD-46',
      'Organism': 'Arabidopsis thaliana',
      'Factors': 'Ionizing Radiation, Exposure Duration, Absorbed Dose',
      'Assay': 'Transcription Profiling'
    },
    gameplayRelevance:
      'Highlights how energetic cosmic ions stress plant cellular repair pathways in space environments.'
  },
  {
    id: 'NASA-ARTEMIS-LRO-DIV',
    title: 'Artemis Lunar South Pole Thermal & Volatile Environment',
    type: 'lunar_artemis',
    timestamp: '2024-02-15T12:00:00Z',
    source: 'NASA Lunar Reconnaissance Orbiter (LRO) / Artemis Science',
    sourceUrl: 'https://www.nasa.gov/mission/artemis/',
    status: 'archived_verified',
    dataOrigin: 'curated',
    measurementContext: 'Lunar South Pole Remote Sensing Context',
    summary:
      'LRO Diviner radiometer and radar observations reveal Permanently Shadowed Regions (PSRs) near lunar South Pole crater rims cold enough to preserve water ice deposits.',
    metrics: {
      'Target Region': 'Lunar South Pole Crater Rims',
      'PSR Cold Traps': 'Extreme Cryogenic Shadows (< 110 K)',
      'Mission Context': 'Artemis Surface Exploration',
      'Resource Focus': 'Polar Water Ice & Solar Ridges'
    },
    gameplayRelevance:
      'Grounds Mission 01 lunar exploration: harvesting crater ice for oxygen/water while siting solar arrays on illuminated ridges.'
  }
];

function radLabToObservation(item: RadLabBaseline, overrideOrigin?: NasaObservation['dataOrigin']): NasaObservation {
  const origin = overrideOrigin ?? (item.dataOrigin === 'live' ? 'live' : 'cached');
  return {
    id: item.id,
    title: `${item.celestialBody}: ${item.spacecraft} (${item.instrument}) Radiation Baseline`,
    type: 'radlab',
    timestamp: item.sampleWindowUtc,
    source: item.sourceName,
    sourceUrl: item.sourceUrl,
    status: origin === 'live' ? 'live' : 'archived_verified',
    dataOrigin: origin,
    unit: item.unit,
    measurementContext: item.contextLabel,
    caveat: item.scientificCaveat,
    summary: item.description,
    metrics: {
      'Mean Dose Rate': `${item.meanDoseRate.toFixed(2)} ${item.unit}`,
      'Observed Range': `${item.minDoseRate.toFixed(2)} – ${item.maxDoseRate.toFixed(2)} ${item.unit}`,
      'Samples (Window)': `${item.sampleCount} readings`,
      'Context': item.measurementContext === 'mars_surface' ? 'Planetary Surface' : 'Orbital Only'
    },
    gameplayRelevance: item.gameplayRelevance
  };
}

function marsTrekToObservation(
  site: MarsTrekSite,
  overrideOrigin?: NasaObservation['dataOrigin'],
  fetchedAt?: string
): NasaObservation {
  const origin = overrideOrigin ?? (site.dataOrigin === 'live' ? 'live' : 'archive');
  return {
    id: site.id,
    title: site.name,
    type: 'mars_trek',
    timestamp: fetchedAt || '2026-01-01T00:00:00Z',
    source: site.sourceName,
    sourceUrl: site.sourceUrl,
    status: origin === 'live' ? 'live' : 'archived_verified',
    dataOrigin: origin,
    measurementContext: 'Mars Orbital Mosaic (Mars Only — Never Lunar Terrain)',
    caveat: site.scientificCaveat,
    previewImageUrl: `/api/nasa/mars/tile?layer=${site.sampleTile.layerKey}&z=${site.sampleTile.z}&row=${site.sampleTile.row}&col=${site.sampleTile.col}`,
    summary: site.description,
    metrics: {
      'Target Planet': 'Mars',
      'WMTS Layer': site.layerId.slice(0, 28) + '...',
      'Resolution': site.resolution,
      'Coordinates': site.centerCoords.label
    },
    gameplayRelevance: site.gameplayRelevance
  };
}

function csaToObservation(item: CsaFoodResource): NasaObservation {
  return {
    id: item.id,
    title: item.title,
    type: 'csa_food',
    timestamp: '2026-01-01T00:00:00Z',
    source: `${item.sourceName} — ${item.program}`,
    sourceUrl: item.sourceUrl,
    status: 'archived_verified',
    dataOrigin: 'curated',
    measurementContext: item.measurementContext,
    caveat: item.limitations,
    summary: item.description,
    metrics: {
      'Agency': 'Canadian Space Agency (CSA)',
      'Program': item.program,
      'Data Nature': 'Educational / Research Context',
      'Crop Yield Rates': 'Simulated in Game (Not API)'
    },
    gameplayRelevance: item.gameplayRelevance
  };
}

interface HttpPayloadError extends Error {
  status?: number;
  body?: unknown;
}

async function fetchJsonLocal<T>(path: string, timeoutMs = 16000): Promise<T> {
  const res = await fetch(path, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(timeoutMs)
  });

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    const serverMsg =
      parsed && typeof parsed === 'object' && typeof (parsed as Record<string, unknown>).error === 'string'
        ? String((parsed as Record<string, unknown>).error)
        : `HTTP ${res.status}`;
    const err = new Error(serverMsg) as HttpPayloadError;
    err.status = res.status;
    err.body = parsed;
    throw err;
  }

  if (parsed === null) {
    throw new Error('Invalid JSON response from proxy');
  }
  return parsed as T;
}

interface DonkiProxyResponse {
  source?: string;
  status?: 'live' | 'cached' | 'error';
  fromCache?: boolean;
  stale?: boolean;
  emptyWindow?: boolean;
  fetchedAt?: string;
  window?: { startDate: string; endDate: string; days: number };
  warnings?: string[];
  error?: string;
  archiveFallback?: DonkiProxyEvent[];
  events?: DonkiProxyEvent[];
}

interface DonkiProxyEvent {
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

interface OsdrProxyResponse {
  accession: string;
  title: string;
  description: string;
  factors: string[];
  assayTypes: string[];
  sourceName: string;
  sourceUrl: string;
  retrievedAt: string;
  fromCache?: boolean;
  warning?: string;
  status: 'live' | 'cached';
}

interface RadLabProxyResponse {
  source?: string;
  status?: 'live' | 'cached' | 'error';
  fromCache?: boolean;
  stale?: boolean;
  fetchedAt?: string;
  warnings?: string[];
  error?: string;
  baselines?: Array<{
    id: string;
    sourceName: string;
    sourceUrl: string;
    celestialBody: 'Earth' | 'Moon' | 'Mars';
    spacecraft: string;
    instrument: string;
    instrumentId: string;
    measurementContext: 'earth_leo_orbit' | 'lunar_orbit' | 'mars_orbit' | 'mars_surface';
    contextLabel: string;
    unit: 'μGy/hour';
    sampleWindowUtc: string;
    sampleCount: number;
    minDoseRate: number;
    meanDoseRate: number;
    maxDoseRate: number;
    scientificCaveat: string;
    dataOrigin?: 'live' | 'cached' | 'archive';
  }>;
}

interface MarsTrekProxyResponse {
  source?: string;
  status?: 'live' | 'cached' | 'error';
  wmtsVerified?: boolean;
  verifiedLayers?: Record<string, boolean>;
  fromCache?: boolean;
  stale?: boolean;
  fetchedAt?: string;
  warnings?: string[];
  error?: string;
  sites?: Array<{
    id: string;
    wmtsCapabilitiesUrl: string;
    previewTileUrl: string;
    wmtsVerified?: boolean;
  }>;
}

function resolveDonkiSection(
  donkiRes: PromiseSettledResult<DonkiProxyResponse>
): { status: ScienceFeedStatus; observations: NasaObservation[]; telemetry: FeedTelemetry; warnings: string[] } {
  const warnings: string[] = [];

  if (donkiRes.status === 'fulfilled') {
    const payload = donkiRes.value;
    if (Array.isArray(payload.warnings) && payload.warnings.length > 0) {
      warnings.push(...payload.warnings);
    }

    const feedStatus: ScienceFeedStatus =
      payload.status === 'cached' || payload.fromCache ? 'cached' : 'live';

    if (Array.isArray(payload.events) && payload.events.length > 0) {
      const obs: NasaObservation[] = payload.events.slice(0, 6).map((ev) => ({
        id: ev.id,
        title: ev.title,
        type: ev.eventType,
        timestamp: ev.timestamp,
        source: ev.source,
        sourceUrl: ev.sourceUrl,
        status: feedStatus === 'live' ? 'live' : 'archived_verified',
        dataOrigin: feedStatus === 'live' ? 'live' : 'cached',
        measurementContext: 'Heliophysics Space-Weather Observation (Not Astronaut Dose)',
        caveat: 'DONKI tracks solar flares, CMEs, SEPs, and geomagnetic storms; it does not report personal radiation doses.',
        summary: ev.summary,
        metrics: ev.metrics,
        gameplayRelevance: ev.gameplayRelevance
      }));
      return {
        status: feedStatus,
        observations: obs,
        telemetry: {
          status: feedStatus,
          lastUpdatedAt: payload.fetchedAt || new Date().toISOString(),
          source: payload.source || 'NASA CCMC / DONKI Live Service',
          error: payload.warnings && payload.warnings.length > 0 ? payload.warnings[0] : undefined
        },
        warnings
      };
    }

    // Valid empty 30-day quiet solar window is genuinely LIVE (not an error!)
    const windowStr = payload.window ? `${payload.window.startDate} to ${payload.window.endDate}` : 'Last 30 days';
    const quietObs: NasaObservation = {
      id: 'DONKI-QUIET-WINDOW',
      title: 'Solar Activity Quiet Window (0 Eruptive Events Logged)',
      type: 'solar_flare',
      timestamp: payload.fetchedAt || new Date().toISOString(),
      source: payload.source || 'NASA CCMC / DONKI Live Service',
      sourceUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/',
      status: feedStatus === 'live' ? 'live' : 'archived_verified',
      dataOrigin: feedStatus === 'live' ? 'live' : 'cached',
      measurementContext: 'Live Heliophysics Query — Quiet Sun Window',
      caveat: 'Live DONKI query succeeded with zero reported CME/FLR/SEP/GST events in this window.',
      summary: `Live NASA CCMC DONKI query (${windowStr}) completed cleanly with no major flares, CMEs, SEPs, or geomagnetic storms logged in the window.`,
      metrics: {
        'Query Window': windowStr,
        'Events Logged': 0,
        'Feed Origin': feedStatus.toUpperCase()
      },
      gameplayRelevance: 'Calm space-weather windows give EVA crews ideal conditions for surface construction and ice harvesting.'
    };
    return {
      status: feedStatus,
      observations: [quietObs],
      telemetry: {
        status: feedStatus,
        lastUpdatedAt: payload.fetchedAt || new Date().toISOString(),
        source: payload.source || 'NASA CCMC / DONKI Live Service'
      },
      warnings
    };
  }

  // Request rejected (e.g. HTTP 502 with structured archiveFallback or network timeout)
  const errObj = donkiRes.reason as HttpPayloadError | undefined;
  const body = (errObj?.body || null) as DonkiProxyResponse | null;
  const errMsg = errObj?.message || 'NASA DONKI live proxy unreachable.';
  warnings.push(`DONKI: ${errMsg}`);

  if (body?.archiveFallback && body.archiveFallback.length > 0) {
    const archiveObs: NasaObservation[] = body.archiveFallback.map((ev) => ({
      id: ev.id,
      title: ev.title,
      type: ev.eventType,
      timestamp: ev.timestamp,
      source: ev.source,
      sourceUrl: ev.sourceUrl,
      status: 'archived_verified',
      dataOrigin: 'archive',
      measurementContext: 'Heliophysics Space-Weather Benchmark Archive (Fallback)',
      caveat: 'Showing verified historical DONKI record because live upstream was unreachable.',
      summary: ev.summary,
      metrics: ev.metrics,
      gameplayRelevance: ev.gameplayRelevance
    }));
    return {
      status: 'archive',
      observations: archiveObs,
      telemetry: {
        status: 'archive',
        lastUpdatedAt: null,
        source: 'NASA DONKI Benchmark Archive',
        error: errMsg
      },
      warnings
    };
  }

  return {
    status: 'archive',
    observations: [VERIFIED_NASA_ARCHIVE[0]],
    telemetry: {
      status: 'archive',
      lastUpdatedAt: null,
      source: 'Verified DONKI Archive',
      error: errMsg
    },
    warnings
  };
}

function resolveOsdrSection(
  results: Array<PromiseSettledResult<OsdrProxyResponse>>
): { status: ScienceFeedStatus; observations: NasaObservation[]; telemetry: FeedTelemetry; warnings: string[] } {
  const osdrFallbackMap = new Map<string, NasaObservation>();
  for (const obs of VERIFIED_NASA_ARCHIVE.filter((o) => o.type === 'biology_osdr')) {
    osdrFallbackMap.set(obs.id, obs);
  }

  const studyIds = ['OSD-120', 'OSD-520', 'OSD-46'];
  let osdrLiveCount = 0;
  let osdrCachedCount = 0;
  let latestTimestamp: string | null = null;
  const warnings: string[] = [];
  const observations: NasaObservation[] = [];

  results.forEach((result, idx) => {
    const id = studyIds[idx];
    const fallback = osdrFallbackMap.get(id);
    if (result.status === 'fulfilled' && result.value?.accession) {
      const s = result.value;
      const isCached = s.status === 'cached' || Boolean(s.fromCache);
      if (isCached) osdrCachedCount++;
      else osdrLiveCount++;
      if (s.warning) warnings.push(`${id}: ${s.warning}`);
      if (!latestTimestamp || s.retrievedAt > latestTimestamp) {
        latestTimestamp = s.retrievedAt;
      }

      observations.push({
        id: s.accession,
        title: `${s.title} (${s.accession})`,
        type: 'biology_osdr',
        timestamp: s.retrievedAt,
        source: s.sourceName,
        sourceUrl: s.sourceUrl,
        status: isCached ? 'archived_verified' : 'live',
        dataOrigin: isCached ? 'cached' : 'live',
        measurementContext: 'Verified NASA OSDR Study Metadata (via Backend Proxy)',
        summary: s.description || fallback?.summary || 'Verified NASA OSDR biological research record.',
        metrics: {
          'Study Accession': s.accession,
          'Experimental Factors': s.factors.slice(0, 3).join(', ') || 'Spaceflight / Radiation',
          'Assay Types': s.assayTypes.slice(0, 2).join(', ') || 'Omics / Phenotyping',
          'Feed Status': isCached ? 'Cached OSDR API' : 'Live OSDR API'
        },
        gameplayRelevance:
          fallback?.gameplayRelevance ||
          'Supports Outpost Greenhouse biology and crew radiation protection principles.'
      });
    } else {
      const reasonMsg = result.status === 'rejected' ? (result.reason as Error)?.message || 'Unreachable' : 'Invalid payload';
      warnings.push(`OSDR ${id}: ${reasonMsg}`);
      if (fallback) {
        observations.push({ ...fallback, dataOrigin: 'archive' });
      }
    }
  });

  const status: ScienceFeedStatus =
    osdrLiveCount > 0 ? 'live' : osdrCachedCount > 0 ? 'cached' : observations.length > 0 ? 'archive' : 'error';

  return {
    status,
    observations,
    telemetry: {
      status,
      lastUpdatedAt: latestTimestamp,
      source: status === 'live' || status === 'cached' ? 'NASA OSDR Metadata API' : 'NASA OSDR Verified Summaries',
      error: status === 'archive' || status === 'error' ? warnings[0] || 'NASA OSDR metadata API unreachable.' : undefined
    },
    warnings
  };
}

function resolveRadLabSection(
  radlabRes: PromiseSettledResult<RadLabProxyResponse>
): { status: ScienceFeedStatus; baselines: RadLabBaseline[]; telemetry: FeedTelemetry; warnings: string[] } {
  const warnings: string[] = [];

  if (radlabRes.status === 'fulfilled' && Array.isArray(radlabRes.value.baselines)) {
    const payload = radlabRes.value;
    if (Array.isArray(payload.warnings) && payload.warnings.length > 0) {
      warnings.push(...payload.warnings);
    }

    const feedStatus: ScienceFeedStatus =
      payload.status === 'live' ? (payload.fromCache ? 'cached' : 'live') : 'cached';

    const baselines = RADLAB_VERIFIED_BASELINES.map((localItem) => {
      const remote = payload.baselines!.find((r) => r.id === localItem.id);
      if (!remote) return { ...localItem, dataOrigin: 'cached' as const };
      return {
        ...localItem,
        sampleCount: remote.sampleCount,
        minDoseRate: remote.minDoseRate,
        meanDoseRate: remote.meanDoseRate,
        maxDoseRate: remote.maxDoseRate,
        dataOrigin: (remote.dataOrigin === 'live' ? (payload.fromCache ? 'cached' : 'live') : 'cached') as 'live' | 'cached'
      };
    });

    return {
      status: feedStatus,
      baselines,
      telemetry: {
        status: feedStatus,
        lastUpdatedAt: payload.fetchedAt || new Date().toISOString(),
        source: payload.source || 'NASA OSDR RadLab Telemetry API',
        error: warnings[0]
      },
      warnings
    };
  }

  const errObj = radlabRes.status === 'rejected' ? (radlabRes.reason as HttpPayloadError | undefined) : undefined;
  const errMsg = errObj?.message || 'NASA RadLab baseline payload unavailable.';
  warnings.push(`RadLab: ${errMsg}`);

  const baselines = RADLAB_VERIFIED_BASELINES.map((b) => ({ ...b, dataOrigin: 'cached' as const }));
  return {
    status: 'archive',
    baselines,
    telemetry: {
      status: 'archive',
      lastUpdatedAt: null,
      source: 'Verified RadLab Dosimetry Archive',
      error: errMsg
    },
    warnings
  };
}

function resolveMarsTrekSection(
  marsRes: PromiseSettledResult<MarsTrekProxyResponse>
): { status: ScienceFeedStatus; sites: MarsTrekSite[]; fetchedAt?: string; telemetry: FeedTelemetry; warnings: string[] } {
  const warnings: string[] = [];

  if (marsRes.status === 'fulfilled') {
    const payload = marsRes.value;
    if (Array.isArray(payload.warnings) && payload.warnings.length > 0) {
      warnings.push(...payload.warnings);
    }

    const feedStatus: ScienceFeedStatus = payload.wmtsVerified
      ? payload.fromCache
        ? 'cached'
        : 'live'
      : 'archive';

    const layerMap = payload.verifiedLayers || {};
    const sites: MarsTrekSite[] = MARS_TREK_SITES.map((s) => {
      const verified = payload.wmtsVerified && (layerMap[s.sampleTile.layerKey] !== false);
      return {
        ...s,
        dataOrigin: verified ? 'live' : 'curated'
      };
    });

    return {
      status: feedStatus,
      sites,
      fetchedAt: payload.fetchedAt,
      telemetry: {
        status: feedStatus,
        lastUpdatedAt: payload.fetchedAt || new Date().toISOString(),
        source: payload.source || 'NASA Solar System Treks WMTS',
        error: warnings[0]
      },
      warnings
    };
  }

  const errObj = marsRes.reason as HttpPayloadError | undefined;
  const errMsg = errObj?.message || 'NASA Mars Trek WMTS check unreachable.';
  warnings.push(`Mars Trek: ${errMsg}`);

  return {
    status: 'archive',
    sites: MARS_TREK_SITES.map((s) => ({ ...s, dataOrigin: 'curated' as const })),
    telemetry: {
      status: 'archive',
      lastUpdatedAt: null,
      source: 'Mars Trek Verified Site Catalog',
      error: errMsg
    },
    warnings
  };
}

function buildUnifiedObservations(
  donkiObservations: NasaObservation[],
  radlabBaselines: RadLabBaseline[],
  radlabStatus: ScienceFeedStatus,
  osdrObservations: NasaObservation[],
  marsTrekSites: MarsTrekSite[],
  marsTrekStatus: ScienceFeedStatus,
  marsFetchedAt?: string
): NasaObservation[] {
  const artemisRef = VERIFIED_NASA_ARCHIVE.find((o) => o.id === 'NASA-ARTEMIS-LRO-DIV');
  const radOriginOverride: NasaObservation['dataOrigin'] | undefined =
    radlabStatus === 'archive' ? 'archive' : undefined;
  const marsOriginOverride: NasaObservation['dataOrigin'] | undefined =
    marsTrekStatus === 'cached' ? 'cached' : marsTrekStatus === 'archive' ? 'archive' : undefined;

  return [
    ...donkiObservations,
    ...radlabBaselines.map((b) => radLabToObservation(b, radOriginOverride)),
    ...osdrObservations,
    ...marsTrekSites.map((s) => marsTrekToObservation(s, marsOriginOverride, marsFetchedAt)),
    ...CSA_FOOD_PRODUCTION_RESOURCES.map(csaToObservation),
    ...(artemisRef ? [artemisRef] : [])
  ];
}

export async function fetchPhase2ScienceBundle(options?: {
  liveRadLab?: boolean;
  forceRefresh?: boolean;
}): Promise<Phase2ScienceBundle> {
  const liveRadLab = options?.liveRadLab ?? true;
  const refreshQs = options?.forceRefresh ? '&refresh=true' : '';
  const osdrRefreshQs = options?.forceRefresh ? '?refresh=true' : '';

  const [donkiRes, osdr120Res, osdr520Res, osdr46Res, radlabRes, marsRes] = await Promise.allSettled([
    fetchJsonLocal<DonkiProxyResponse>(`/api/nasa/donki?type=all&days=30${refreshQs}`),
    fetchJsonLocal<OsdrProxyResponse>(`/api/nasa/osdr/study/120${osdrRefreshQs}`),
    fetchJsonLocal<OsdrProxyResponse>(`/api/nasa/osdr/study/520${osdrRefreshQs}`),
    fetchJsonLocal<OsdrProxyResponse>(`/api/nasa/osdr/study/46${osdrRefreshQs}`),
    fetchJsonLocal<RadLabProxyResponse>(`/api/nasa/radlab/baselines?live=${liveRadLab ? 'true' : 'false'}${refreshQs}`),
    fetchJsonLocal<MarsTrekProxyResponse>(`/api/nasa/mars/terrain?site=all${refreshQs}`)
  ]);

  const donki = resolveDonkiSection(donkiRes);
  const osdr = resolveOsdrSection([osdr120Res, osdr520Res, osdr46Res]);
  const radlab = resolveRadLabSection(radlabRes);
  const mars = resolveMarsTrekSection(marsRes);

  const warnings = [...donki.warnings, ...osdr.warnings, ...radlab.warnings, ...mars.warnings];

  const observations = buildUnifiedObservations(
    donki.observations,
    radlab.baselines,
    radlab.status,
    osdr.observations,
    mars.sites,
    mars.status,
    mars.fetchedAt
  );

  const isLive =
    donki.status === 'live' ||
    osdr.status === 'live' ||
    radlab.status === 'live' ||
    mars.status === 'live';

  return {
    observations,
    radlabBaselines: radlab.baselines,
    csaFoodResources: CSA_FOOD_PRODUCTION_RESOURCES,
    marsTrekSites: mars.sites,
    donkiStatus: donki.status,
    osdrStatus: osdr.status,
    radlabStatus: radlab.status,
    marsTrekStatus: mars.status,
    csaStatus: 'curated',
    feeds: {
      donki: donki.telemetry,
      osdr: osdr.telemetry,
      radlab: radlab.telemetry,
      marsTrek: mars.telemetry,
      csa: {
        status: 'curated',
        lastUpdatedAt: null,
        source: 'Canadian Space Agency (Curated Educational Dataset)'
      }
    },
    isLive,
    lastSyncedAt: new Date().toISOString(),
    warnings
  };
}

export async function retrySingleScienceFeed(
  currentBundle: Phase2ScienceBundle,
  feed: RetryableFeed
): Promise<Phase2ScienceBundle> {
  const existingDonki = currentBundle.observations.filter(
    (o) => o.type === 'solar_flare' || o.type === 'cme' || o.type === 'sep' || o.type === 'geomagnetic'
  );
  const existingOsdr = currentBundle.observations.filter((o) => o.type === 'biology_osdr');

  let donki = {
    status: currentBundle.donkiStatus,
    observations: existingDonki,
    telemetry: currentBundle.feeds.donki,
    warnings: [] as string[]
  };
  let osdr = {
    status: currentBundle.osdrStatus,
    observations: existingOsdr,
    telemetry: currentBundle.feeds.osdr,
    warnings: [] as string[]
  };
  let radlab = {
    status: currentBundle.radlabStatus,
    baselines: currentBundle.radlabBaselines,
    telemetry: currentBundle.feeds.radlab,
    warnings: [] as string[]
  };
  let mars: {
    status: ScienceFeedStatus;
    sites: MarsTrekSite[];
    fetchedAt?: string;
    telemetry: FeedTelemetry;
    warnings: string[];
  } = {
    status: currentBundle.marsTrekStatus,
    sites: currentBundle.marsTrekSites,
    fetchedAt: currentBundle.feeds.marsTrek.lastUpdatedAt || undefined,
    telemetry: currentBundle.feeds.marsTrek,
    warnings: []
  };

  if (feed === 'donki') {
    const [res] = await Promise.allSettled([
      fetchJsonLocal<DonkiProxyResponse>('/api/nasa/donki?type=all&days=30&refresh=true')
    ]);
    donki = resolveDonkiSection(res);
  } else if (feed === 'osdr') {
    const results = await Promise.allSettled([
      fetchJsonLocal<OsdrProxyResponse>('/api/nasa/osdr/study/120?refresh=true'),
      fetchJsonLocal<OsdrProxyResponse>('/api/nasa/osdr/study/520?refresh=true'),
      fetchJsonLocal<OsdrProxyResponse>('/api/nasa/osdr/study/46?refresh=true')
    ]);
    osdr = resolveOsdrSection(results);
  } else if (feed === 'radlab') {
    const [res] = await Promise.allSettled([
      fetchJsonLocal<RadLabProxyResponse>('/api/nasa/radlab/baselines?live=true&refresh=true')
    ]);
    radlab = resolveRadLabSection(res);
  } else if (feed === 'marsTrek') {
    const [res] = await Promise.allSettled([
      fetchJsonLocal<MarsTrekProxyResponse>('/api/nasa/mars/terrain?site=all&refresh=true')
    ]);
    mars = resolveMarsTrekSection(res);
  }

  const warnings = [...donki.warnings, ...osdr.warnings, ...radlab.warnings, ...mars.warnings];
  const observations = buildUnifiedObservations(
    donki.observations,
    radlab.baselines,
    radlab.status,
    osdr.observations,
    mars.sites,
    mars.status,
    mars.fetchedAt
  );

  const isLive =
    donki.status === 'live' ||
    osdr.status === 'live' ||
    radlab.status === 'live' ||
    mars.status === 'live';

  return {
    observations,
    radlabBaselines: radlab.baselines,
    csaFoodResources: CSA_FOOD_PRODUCTION_RESOURCES,
    marsTrekSites: mars.sites,
    donkiStatus: donki.status,
    osdrStatus: osdr.status,
    radlabStatus: radlab.status,
    marsTrekStatus: mars.status,
    csaStatus: 'curated',
    feeds: {
      donki: donki.telemetry,
      osdr: osdr.telemetry,
      radlab: radlab.telemetry,
      marsTrek: mars.telemetry,
      csa: currentBundle.feeds.csa
    },
    isLive,
    lastSyncedAt: new Date().toISOString(),
    warnings
  };
}

// Backward-compatible wrapper used across callers
export async function fetchNasaSolarData(): Promise<{ observations: NasaObservation[]; isLive: boolean; error?: string }> {
  try {
    const bundle = await fetchPhase2ScienceBundle();
    return {
      observations: bundle.observations,
      isLive: bundle.isLive,
      error: bundle.warnings.length > 0 ? bundle.warnings.join(' | ') : undefined
    };
  } catch {
    return {
      observations: VERIFIED_NASA_ARCHIVE,
      isLive: false,
      error: 'Unable to connect to local NASA/CSA proxy service; displaying curated archive.'
    };
  }
}
