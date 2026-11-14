export interface MarsTrekSite {
  id: string;
  name: string;
  targetBody: 'Mars';
  layerId: string;
  instrument: string;
  resolution: string;
  centerCoords: { lat: number; lon: number; label: string };
  boundingBox?: { minLon: number; minLat: number; maxLon: number; maxLat: number };
  sampleTile: { layerKey: 'jezero_ctx' | 'viking_global'; z: number; row: number; col: number; format: 'png' | 'jpg' };
  wmtsCapabilitiesUrl: string;
  sourceName: string;
  sourceUrl: string;
  description: string;
  scientificCaveat: string;
  gameplayRelevance: string;
  dataOrigin: 'curated' | 'live';
}

export const MARS_TREK_SITES: MarsTrekSite[] = [
  {
    id: 'MARSTREK-JEZERO-CTX',
    name: 'Jezero Crater Landing Basin (MRO CTX 6m Mosaic)',
    targetBody: 'Mars',
    layerId: 'JEZ_ctx_B_soc_008_orthoMosaic_6m_Eqc_latTs0_lon0',
    instrument: 'Mars Reconnaissance Orbiter — Context Camera (CTX)',
    resolution: '6 meters / pixel (Equirectangular)',
    centerCoords: { lat: 18.466, lon: 77.43, label: '18.47° N, 77.43° E (Jezero Crater)' },
    boundingBox: { minLon: 77.1605, minLat: 18.211, maxLon: 77.6992, maxLat: 18.7212 },
    sampleTile: { layerKey: 'jezero_ctx', z: 6, row: 25, col: 91, format: 'png' },
    wmtsCapabilitiesUrl:
      'https://trek.nasa.gov/tiles/Mars/EQ/JEZ_ctx_B_soc_008_orthoMosaic_6m_Eqc_latTs0_lon0/1.0.0/WMTSCapabilities.xml',
    sourceName: 'NASA Solar System Treks — Mars Trek WMTS',
    sourceUrl: 'https://trek.nasa.gov/mars/',
    description:
      'Controlled orbital photomosaic of Jezero Crater — an ancient Martian lake-delta basin explored by the Perseverance rover for preserved mineral biosignatures.',
    scientificCaveat:
      'MARS TERRAIN ONLY: This orbital mosaic maps Jezero Crater on Mars and must never be presented as lunar terrain.',
    gameplayRelevance:
      'Provides the real-world landing region shown in Mars Outpost missions where cadets inspect biosignature anomalies.',
    dataOrigin: 'curated'
  },
  {
    id: 'MARSTREK-JEZERO-HIRISE',
    name: 'Jezero Crater High-Resolution Traverse Mosaic (HiRISE 25cm)',
    targetBody: 'Mars',
    layerId: 'JEZ_hirise_soc_006_orthoMosaic_25cm_Eqc_latTs0_lon0_first_dd',
    instrument: 'Mars Reconnaissance Orbiter — HiRISE Camera',
    resolution: '25 centimeters / pixel (Equirectangular)',
    centerCoords: { lat: 18.38, lon: 77.58, label: '18.38° N, 77.58° E (Perseverance Landing Site)' },
    sampleTile: { layerKey: 'jezero_ctx', z: 8, row: 102, col: 365, format: 'png' },
    wmtsCapabilitiesUrl:
      'https://trek.nasa.gov/tiles/Mars/EQ/JEZ_hirise_soc_006_orthoMosaic_25cm_Eqc_latTs0_lon0_first_dd/1.0.0/WMTSCapabilities.xml',
    sourceName: 'NASA Solar System Treks — Mars Trek WMTS',
    sourceUrl: 'https://trek.nasa.gov/mars/',
    description:
      'Sub-meter orbital orthomosaic resolving boulders, sand ripples, and delta scarps across the Jezero Crater floor.',
    scientificCaveat:
      'MARS TERRAIN ONLY: High-resolution Mars orbital imagery for Mars landing-site analysis; not applicable to lunar bases.',
    gameplayRelevance:
      'Shows why engineers scout flat hazard-free zones before deploying pressurized Habitat Demonstration Units.',
    dataOrigin: 'curated'
  },
  {
    id: 'MARSTREK-VIKING-GLOBAL',
    name: 'Global Mars Color Mosaic (Viking Orbiter MDIM 2.1)',
    targetBody: 'Mars',
    layerId: 'Mars_Viking_MDIM21_ClrMosaic_global_232m',
    instrument: 'Viking Orbiter VIS Imaging',
    resolution: '232 meters / pixel (Global Equirectangular)',
    centerCoords: { lat: 18.47, lon: 77.43, label: 'Syrtis Major / Jezero Hemisphere' },
    sampleTile: { layerKey: 'viking_global', z: 2, row: 1, col: 5, format: 'jpg' },
    wmtsCapabilitiesUrl:
      'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/WMTSCapabilities.xml',
    sourceName: 'NASA Solar System Treks — Mars Trek WMTS',
    sourceUrl: 'https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars',
    description:
      'Global colorized visible mosaic spanning the entire Martian globe (zoom levels 0–5), contrasting bright dust plains with dark basaltic regions like Syrtis Major.',
    scientificCaveat:
      'MARS GLOBAL BASEMAP ONLY: 232 m/px regional albedo reference for Mars.',
    gameplayRelevance:
      'Grounds Mars planetary surface albedo, dust distribution, and solar power planning across global latitudes.',
    dataOrigin: 'curated'
  }
];
