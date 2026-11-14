import { NasaObservation } from '../types/game';
import { RADLAB_VERIFIED_BASELINES, RadLabBaseline } from '../data/radlabBaselines';
import { CSA_FOOD_PRODUCTION_RESOURCES, CsaFoodResource } from '../data/csaFoodData';
import { MARS_TREK_SITES, MarsTrekSite } from '../data/marsTrekSites';

export type ScienceFeedStatus = 'live' | 'cached' | 'curated' | 'error';

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
    dataOrigin: 'curated',
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
    dataOrigin: 'curated',
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
    dataOrigin: 'curated',
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
    dataOrigin: 'curated',
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

function radLabToObservation(item: RadLabBaseline): NasaObservation {
  return {
    id: item.id,
    title: `${item.celestialBody}: ${item.spacecraft} (${item.instrument}) Radiation Baseline`,
    type: 'radlab',
    timestamp: item.sampleWindowUtc,
    source: item.sourceName,
    sourceUrl: item.sourceUrl,
    status: item.dataOrigin === 'live' ? 'live' : 'archived_verified',
    dataOrigin: item.dataOrigin,
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

function marsTrekToObservation(site: MarsTrekSite): NasaObservation {
  return {
    id: site.id,
    title: site.name,
    type: 'mars_trek',
    timestamp: new Date().toISOString(),
    source: site.sourceName,
    sourceUrl: site.sourceUrl,
    status: site.dataOrigin === 'live' ? 'live' : 'archived_verified',
    dataOrigin: site.dataOrigin,
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

async function fetchJsonLocal<T>(path: string, timeoutMs = 9000): Promise<T> {
  const res = await fetch(path, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

interface DonkiProxyResponse {
  status?: 'live' | 'curated_fallback';
  fromCache?: boolean;
  warnings?: string[];
  events?: Array<{
    id: string;
    eventType: 'cme' | 'solar_flare' | 'geomagnetic' | 'sep';
    title: string;
    timestamp: string;
    source: string;
    sourceUrl: string;
    summary: string;
    metrics: Record<string, string | number>;
    gameplayRelevance: string;
    status: 'live' | 'cached' | 'curated_fallback';
  }>;
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
  status: 'live' | 'cached';
}

interface RadLabProxyResponse {
  status?: 'live' | 'cached';
  fromCache?: boolean;
  warnings?: string[];
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
    dataOrigin?: 'live' | 'cached';
  }>;
}

interface MarsTrekProxyResponse {
  wmtsVerified?: boolean;
  fromCache?: boolean;
  sites?: Array<{
    id: string;
    wmtsCapabilitiesUrl: string;
    previewTileUrl: string;
  }>;
}

export async function fetchPhase2ScienceBundle(options?: { liveRadLab?: boolean }): Promise<Phase2ScienceBundle> {
  const warnings: string[] = [];

  const [donkiRes, osdr120Res, osdr520Res, osdr46Res, radlabRes, marsRes] = await Promise.allSettled([
    fetchJsonLocal<DonkiProxyResponse>('/api/nasa/donki?type=all&days=30'),
    fetchJsonLocal<OsdrProxyResponse>('/api/nasa/osdr/study/120'),
    fetchJsonLocal<OsdrProxyResponse>('/api/nasa/osdr/study/520'),
    fetchJsonLocal<OsdrProxyResponse>('/api/nasa/osdr/study/46'),
    fetchJsonLocal<RadLabProxyResponse>(`/api/nasa/radlab/baselines?live=${options?.liveRadLab ? 'true' : 'false'}`),
    fetchJsonLocal<MarsTrekProxyResponse>('/api/nasa/mars/terrain?site=all')
  ]);

  // 1. DONKI Space Weather
  let donkiStatus: ScienceFeedStatus = 'curated';
  let donkiObservations: NasaObservation[] = [VERIFIED_NASA_ARCHIVE[0]];
  if (donkiRes.status === 'fulfilled' && Array.isArray(donkiRes.value.events) && donkiRes.value.events.length > 0) {
    donkiStatus = donkiRes.value.status === 'live' ? (donkiRes.value.fromCache ? 'cached' : 'live') : 'curated';
    if (Array.isArray(donkiRes.value.warnings) && donkiRes.value.warnings.length > 0) {
      warnings.push(...donkiRes.value.warnings);
    }
    donkiObservations = donkiRes.value.events.slice(0, 6).map((ev) => ({
      id: ev.id,
      title: ev.title,
      type: ev.eventType,
      timestamp: ev.timestamp,
      source: ev.source,
      sourceUrl: ev.sourceUrl,
      status: ev.status === 'live' ? 'live' : 'archived_verified',
      dataOrigin: ev.status === 'live' ? (donkiRes.value.fromCache ? 'cached' : 'live') : 'curated',
      measurementContext: 'Heliophysics Space-Weather Observation (Not Astronaut Dose)',
      caveat: 'DONKI tracks solar flares, CMEs, SEPs, and geomagnetic storms; it does not report personal radiation doses.',
      summary: ev.summary,
      metrics: ev.metrics,
      gameplayRelevance: ev.gameplayRelevance
    }));
  } else {
    donkiStatus = 'error';
    warnings.push('NASA DONKI live proxy unavailable; showing verified archive event.');
  }

  // 2. OSDR Biology Studies
  const osdrFallbackMap = new Map<string, NasaObservation>();
  for (const obs of VERIFIED_NASA_ARCHIVE.filter((o) => o.type === 'biology_osdr')) {
    osdrFallbackMap.set(obs.id, obs);
  }

  const osdrResults = [osdr120Res, osdr520Res, osdr46Res];
  let osdrLiveCount = 0;
  let osdrCachedCount = 0;
  const osdrObservations: NasaObservation[] = [];
  const studyIds = ['OSD-120', 'OSD-520', 'OSD-46'];

  osdrResults.forEach((result, idx) => {
    const fallback = osdrFallbackMap.get(studyIds[idx]);
    if (result.status === 'fulfilled' && result.value?.accession) {
      const s = result.value;
      if (s.status === 'live') osdrLiveCount++;
      else osdrCachedCount++;
      osdrObservations.push({
        id: s.accession,
        title: `${s.title} (${s.accession})`,
        type: 'biology_osdr',
        timestamp: s.retrievedAt,
        source: s.sourceName,
        sourceUrl: s.sourceUrl,
        status: s.status === 'live' ? 'live' : 'archived_verified',
        dataOrigin: s.status,
        measurementContext: 'Verified NASA OSDR Study Metadata (via Backend Proxy)',
        summary: s.description || fallback?.summary || 'Verified NASA OSDR biological research record.',
        metrics: {
          'Study Accession': s.accession,
          'Experimental Factors': s.factors.slice(0, 3).join(', ') || 'Spaceflight / Radiation',
          'Assay Types': s.assayTypes.slice(0, 2).join(', ') || 'Omics / Phenotyping',
          'Feed Status': s.status === 'live' ? 'Live OSDR API' : 'Cached OSDR API'
        },
        gameplayRelevance:
          fallback?.gameplayRelevance ||
          'Supports Outpost Greenhouse biology and crew radiation protection principles.'
      });
    } else if (fallback) {
      osdrObservations.push(fallback);
    }
  });

  const osdrStatus: ScienceFeedStatus =
    osdrLiveCount > 0 ? 'live' : osdrCachedCount > 0 ? 'cached' : 'error';
  if (osdrStatus === 'error') {
    warnings.push('NASA OSDR metadata API unreachable; showing curated OSDR study summaries.');
  }

  // 3. RadLab Radiation Baselines
  let radlabStatus: ScienceFeedStatus = 'cached';
  let radlabBaselines: RadLabBaseline[] = RADLAB_VERIFIED_BASELINES.map((b) => ({ ...b }));
  if (radlabRes.status === 'fulfilled' && Array.isArray(radlabRes.value.baselines)) {
    const apiItems = radlabRes.value.baselines;
    radlabBaselines = RADLAB_VERIFIED_BASELINES.map((localItem) => {
      const remote = apiItems.find((r) => r.id === localItem.id);
      if (!remote) return localItem;
      return {
        ...localItem,
        sampleCount: remote.sampleCount,
        minDoseRate: remote.minDoseRate,
        meanDoseRate: remote.meanDoseRate,
        maxDoseRate: remote.maxDoseRate,
        dataOrigin: remote.dataOrigin === 'live' ? 'live' : 'cached'
      };
    });
    radlabStatus = radlabRes.value.status === 'live' ? 'live' : 'cached';
    if (Array.isArray(radlabRes.value.warnings) && radlabRes.value.warnings.length > 0) {
      warnings.push(...radlabRes.value.warnings);
    }
  } else {
    radlabStatus = 'error';
    warnings.push('RadLab baseline proxy unreachable; showing verified cached dosimetry baselines.');
  }

  // 4. Mars Trek WMTS
  let marsTrekStatus: ScienceFeedStatus = 'curated';
  const marsTrekSites: MarsTrekSite[] = MARS_TREK_SITES.map((s) => ({ ...s }));
  if (marsRes.status === 'fulfilled') {
    marsTrekStatus = marsRes.value.wmtsVerified ? (marsRes.value.fromCache ? 'cached' : 'live') : 'curated';
    if (marsRes.value.wmtsVerified) {
      marsTrekSites.forEach((site) => {
        site.dataOrigin = 'live';
      });
    }
  } else {
    marsTrekStatus = 'error';
    warnings.push('Mars Trek WMTS check failed; showing curated Mars Trek site metadata.');
  }

  // Combine unified observations for drawer rendering
  const artemisRef = VERIFIED_NASA_ARCHIVE.find((o) => o.id === 'NASA-ARTEMIS-LRO-DIV');
  const observations: NasaObservation[] = [
    ...donkiObservations,
    ...radlabBaselines.map(radLabToObservation),
    ...osdrObservations,
    ...marsTrekSites.map(marsTrekToObservation),
    ...CSA_FOOD_PRODUCTION_RESOURCES.map(csaToObservation),
    ...(artemisRef ? [artemisRef] : [])
  ];

  const isLive = donkiStatus === 'live' || osdrStatus === 'live' || radlabStatus === 'live' || marsTrekStatus === 'live';

  return {
    observations,
    radlabBaselines,
    csaFoodResources: CSA_FOOD_PRODUCTION_RESOURCES,
    marsTrekSites,
    donkiStatus,
    osdrStatus,
    radlabStatus,
    marsTrekStatus,
    csaStatus: 'curated',
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
