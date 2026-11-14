export type RadLabMeasurementContext = 'earth_leo_orbit' | 'lunar_orbit' | 'mars_orbit' | 'mars_surface';

export interface RadLabBaseline {
  id: string;
  sourceName: string;
  sourceUrl: string;
  apiEndpoint: string;
  celestialBody: 'Earth' | 'Moon' | 'Mars';
  spacecraft: string;
  instrument: string;
  instrumentId: string;
  measurementContext: RadLabMeasurementContext;
  contextLabel: string;
  unit: 'μGy/hour';
  sampleWindowUtc: string;
  sampleCount: number;
  minDoseRate: number;
  meanDoseRate: number;
  maxDoseRate: number;
  description: string;
  scientificCaveat: string;
  gameplayRelevance: string;
  dataOrigin: 'cached' | 'live';
}

export const RADLAB_VERIFIED_BASELINES: RadLabBaseline[] = [
  {
    id: 'RADLAB-MSL-SURFACE',
    sourceName: 'NASA OSDR RadLab — Mars Science Laboratory (Curiosity RAD)',
    sourceUrl: 'https://visualization.osdr.nasa.gov/radlab/',
    apiEndpoint: 'https://visualization.osdr.nasa.gov/radlab/api/',
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
    description:
      'In-situ absorbed radiation dose rate measured on the Martian surface by Curiosity’s Radiation Assessment Detector (RAD). Planetary mass blocks roughly half of the sky and the thin CO₂ atmosphere provides partial attenuation compared to free space.',
    scientificCaveat:
      'Gale Crater quiet-Sun surface baseline during 2020-01-01 UTC. Solar Energetic Particle (SEP) storms can temporarily push surface dose rates dramatically higher.',
    gameplayRelevance:
      'Supports Mars Outpost radiation briefing: demonstrates why Mars surface background dose is lower than Mars orbit, yet still requires habitat shielding during solar events.',
    dataOrigin: 'cached'
  },
  {
    id: 'RADLAB-LRO-MOON-ORBIT',
    sourceName: 'NASA OSDR RadLab — Lunar Reconnaissance Orbiter (CRaTER)',
    sourceUrl: 'https://visualization.osdr.nasa.gov/radlab/',
    apiEndpoint: 'https://visualization.osdr.nasa.gov/radlab/api/',
    celestialBody: 'Moon',
    spacecraft: 'LRO',
    instrument: 'CRaTER',
    instrumentId: 'CRaTER-D1D2',
    measurementContext: 'lunar_orbit',
    contextLabel: 'Lunar Orbit (~50 km Altitude — NOT Lunar Surface)',
    unit: 'μGy/hour',
    sampleWindowUtc: '2020-01-01T00:00Z to 2020-01-02T00:00Z',
    sampleCount: 24,
    minDoseRate: 12.4417,
    meanDoseRate: 13.2146,
    maxDoseRate: 14.0921,
    description:
      'Galactic cosmic ray absorbed dose rate measured in lunar orbit by LRO’s Cosmic Ray Telescope for the Effects of Radiation (CRaTER) D1-D2 tissue-equivalent plastic detector.',
    scientificCaveat:
      'ORBITAL MEASUREMENT ONLY: CRaTER orbits the Moon rather than resting on the lunar regolith. Do not treat this orbital rate as a direct lunar surface dose without accounting for local topography and regolith backscatter.',
    gameplayRelevance:
      'Illustrates the deep-space radiation environment around the Moon, where there is no global dipole magnetic field or atmosphere to deflect cosmic rays.',
    dataOrigin: 'cached'
  },
  {
    id: 'RADLAB-TGO-MARS-ORBIT',
    sourceName: 'NASA OSDR RadLab — ExoMars Trace Gas Orbiter (Liulin-MO)',
    sourceUrl: 'https://visualization.osdr.nasa.gov/radlab/',
    apiEndpoint: 'https://visualization.osdr.nasa.gov/radlab/api/',
    celestialBody: 'Mars',
    spacecraft: 'TGO',
    instrument: 'Liulin-MO',
    instrumentId: 'Liulin-MO-CD-Orbit',
    measurementContext: 'mars_orbit',
    contextLabel: 'Mars Orbit (Transit / Orbital Exposure — NOT Surface)',
    unit: 'μGy/hour',
    sampleWindowUtc: '2020-01-01T00:00Z to 2020-01-02T00:00Z',
    sampleCount: 1371,
    minDoseRate: 10.24,
    meanDoseRate: 17.3107,
    maxDoseRate: 40.26,
    description:
      'Absorbed dose rate in Martian orbit recorded by the Liulin-MO dosimeter (CD detector) aboard ExoMars Trace Gas Orbiter.',
    scientificCaveat:
      'ORBITAL MEASUREMENT ONLY: Orbital dose rates (~17.3 μGy/hr mean) exceed Gale Crater surface rates (~9.3 μGy/hr mean) because orbital spacecraft lack Martian atmospheric column and 2π ground shielding.',
    gameplayRelevance:
      'Helps cadets compare orbital transit exposure vs landed surface shelter conditions.',
    dataOrigin: 'cached'
  },
  {
    id: 'RADLAB-ISS-LEO',
    sourceName: 'NASA OSDR RadLab — International Space Station (DosTel2)',
    sourceUrl: 'https://visualization.osdr.nasa.gov/radlab/',
    apiEndpoint: 'https://visualization.osdr.nasa.gov/radlab/api/',
    celestialBody: 'Earth',
    spacecraft: 'ISS',
    instrument: 'DosTel2',
    instrumentId: 'DosTel2',
    measurementContext: 'earth_leo_orbit',
    contextLabel: 'Earth Low Earth Orbit (~400 km ISS Interior — NOT Moon/Mars)',
    unit: 'μGy/hour',
    sampleWindowUtc: '2020-01-01T00:00Z to 2020-01-01T06:00Z',
    sampleCount: 250,
    minDoseRate: 1.3101,
    meanDoseRate: 44.7074,
    maxDoseRate: 411.5851,
    description:
      'Silicon telescope dosimetry inside the International Space Station. Dose rate remains low (~1–2 μGy/hr) across shielded mid-latitudes and spikes sharply up to hundreds of μGy/hr during brief South Atlantic Anomaly trapped-proton belt passes.',
    scientificCaveat:
      'EARTH LEO ONLY: Protected by Earth’s geomagnetic field and ISS hull mass, yet traverses trapped Van Allen belts (SAA peaks). Never equate ISS LEO dosimetry with Moon or Mars surface radiation.',
    gameplayRelevance:
      'Demonstrates why radiation varies dramatically with shielding mass, orbital altitude, and planetary magnetic protection.',
    dataOrigin: 'cached'
  }
];
