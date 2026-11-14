import {
  BuildingType,
  CampaignMission,
  PlacedBuilding,
  PlanetType,
  PlayerVitals,
  ResourceNode,
  SpaceWeatherEvent
} from '../types/survival';

export const SAVE_VERSION = 1;
const IDB_DB_NAME = 'outpost_survival_db';
const IDB_DB_VERSION = 1;
const IDB_STORE_NAME = 'saves';
const IDB_SAVE_KEY = 'active_save';
const LS_FALLBACK_KEY = 'outpost_survival_save_v1';

const VALID_PLANETS: ReadonlySet<PlanetType> = new Set(['moon', 'mars']);
const VALID_BUILDINGS: ReadonlySet<BuildingType> = new Set([
  'habitat',
  'oxygen_gen',
  'water_recycler',
  'solar_panel',
  'battery',
  'rad_shelter',
  'greenhouse',
  'research_lab',
  'comm_antenna'
]);
const VALID_RESOURCES: ReadonlySet<ResourceNode['type']> = new Set([
  'regolith',
  'ice',
  'silicon',
  'biosignature'
]);

export interface SaveGameV1 {
  version: typeof SAVE_VERSION;
  savedAt: string;
  savedAtMs: number;
  profile: {
    callsign: string;
    avatar: string;
  };
  planet: PlanetType;
  player: {
    x: number;
    y: number;
    z: number;
    rotation: number;
  };
  vitals: PlayerVitals;
  inventory: Record<string, number>;
  placedBuildings: PlacedBuilding[];
  resourceNodes: ResourceNode[];
  progression: {
    currentMissionIndex: number;
    activeMission: CampaignMission;
    completedMissionIds: number[];
    earnedBadges: string[];
    sciencePoints: number;
    greenhouseCropProgress: number;
    biosignaturesAnalyzed: number;
    triggeredBriefKeys: string[];
    tutorialDismissed: boolean;
  };
  simulation: {
    gridBatteryCharge: number;
    maxBatteryCapacity: number;
    weatherEvent: SpaceWeatherEvent;
    pendingStormDelaySec: number | null;
  };
}

export interface LoadSaveResult {
  save: SaveGameV1 | null;
  corrupted: boolean;
  source: 'indexeddb' | 'localstorage' | 'none';
}

export interface PersistSaveResult {
  ok: boolean;
  savedAt: string;
  backend: 'indexeddb' | 'localstorage' | 'failed';
}

function clamp(val: unknown, min: number, max: number, fallback: number): number {
  if (typeof val !== 'number' || !Number.isFinite(val)) return fallback;
  return Math.min(max, Math.max(min, val));
}

function sanitizeString(val: unknown, fallback: string, maxLen = 64): string {
  if (typeof val !== 'string') return fallback;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed.slice(0, maxLen) : fallback;
}

export function validateAndSanitizeSave(raw: unknown): { save: SaveGameV1 | null; corrupted: boolean } {
  if (!raw || typeof raw !== 'object') {
    return { save: null, corrupted: Boolean(raw) };
  }

  const data = raw as Record<string, unknown>;
  if (data.version !== SAVE_VERSION) {
    return { save: null, corrupted: true };
  }

  if (typeof data.planet !== 'string' || !VALID_PLANETS.has(data.planet as PlanetType)) {
    return { save: null, corrupted: true };
  }

  const profileRaw = (data.profile || {}) as Record<string, unknown>;
  const playerRaw = (data.player || {}) as Record<string, unknown>;
  const vitalsRaw = (data.vitals || {}) as Record<string, unknown>;
  const progRaw = (data.progression || {}) as Record<string, unknown>;
  const simRaw = (data.simulation || {}) as Record<string, unknown>;

  if (!progRaw.activeMission || typeof progRaw.activeMission !== 'object') {
    return { save: null, corrupted: true };
  }

  const activeMissionRaw = progRaw.activeMission as Record<string, unknown>;
  if (
    typeof activeMissionRaw.id !== 'number' ||
    typeof activeMissionRaw.code !== 'string' ||
    !Array.isArray(activeMissionRaw.objectives)
  ) {
    return { save: null, corrupted: true };
  }

  // Validate and clamp inventory
  const cleanInventory: Record<string, number> = {};
  if (data.inventory && typeof data.inventory === 'object') {
    for (const [key, val] of Object.entries(data.inventory as Record<string, unknown>)) {
      if (typeof key === 'string' && key.length > 0 && typeof val === 'number' && Number.isFinite(val)) {
        cleanInventory[key] = Math.max(0, Math.min(99999, Math.floor(val)));
      }
    }
  }

  // Validate placed buildings
  const cleanBuildings: PlacedBuilding[] = [];
  if (Array.isArray(data.placedBuildings)) {
    for (const item of data.placedBuildings) {
      if (!item || typeof item !== 'object') continue;
      const b = item as Record<string, unknown>;
      if (typeof b.type !== 'string' || !VALID_BUILDINGS.has(b.type as BuildingType)) continue;
      cleanBuildings.push({
        id: sanitizeString(b.id, `bld_${cleanBuildings.length}`, 80),
        type: b.type as BuildingType,
        x: clamp(b.x, -145, 145, 0),
        z: clamp(b.z, -145, 145, 0),
        rotation: clamp(b.rotation, -Math.PI * 4, Math.PI * 4, 0),
        isOnline: typeof b.isOnline === 'boolean' ? b.isOnline : true,
        health: clamp(b.health, 0, 100, 100)
      });
    }
  }

  // Validate resource nodes
  const cleanNodes: ResourceNode[] = [];
  if (Array.isArray(data.resourceNodes)) {
    for (const item of data.resourceNodes) {
      if (!item || typeof item !== 'object') continue;
      const n = item as Record<string, unknown>;
      if (typeof n.type !== 'string' || !VALID_RESOURCES.has(n.type as ResourceNode['type'])) continue;
      const remaining = clamp(n.amountRemaining, 0, 100, 0);
      if (remaining <= 0) continue;
      cleanNodes.push({
        id: sanitizeString(n.id, `node_${cleanNodes.length}`, 64),
        type: n.type as ResourceNode['type'],
        name: sanitizeString(n.name, 'Mineral Deposit', 100),
        x: clamp(n.x, -145, 145, 20),
        z: clamp(n.z, -145, 145, 20),
        amountRemaining: Math.floor(remaining)
      });
    }
  }

  // Validate weather event
  const weatherRaw = (simRaw.weatherEvent || {}) as Record<string, unknown>;
  const cleanWeather: SpaceWeatherEvent = {
    isActive: Boolean(weatherRaw.isActive),
    type: weatherRaw.type === 'dust_storm' ? 'dust_storm' : 'solar_storm',
    severity: weatherRaw.severity === 'moderate' ? 'moderate' : 'extreme',
    radiationRate: clamp(weatherRaw.radiationRate, 0, 20, 0),
    timeRemainingSec: clamp(weatherRaw.timeRemainingSec, 0, 180, 0),
    nasaWarning: sanitizeString(weatherRaw.nasaWarning, '', 220),
    donkiEventId: typeof weatherRaw.donkiEventId === 'string' ? weatherRaw.donkiEventId.slice(0, 64) : undefined,
    dataOrigin:
      weatherRaw.dataOrigin === 'live' || weatherRaw.dataOrigin === 'cached'
        ? weatherRaw.dataOrigin
        : 'curated'
  };

  const cleanObjectives = (activeMissionRaw.objectives as unknown[]).map((o, idx) => {
    const obj = (o && typeof o === 'object' ? o : {}) as Record<string, unknown>;
    const target = typeof obj.target === 'number' && Number.isFinite(obj.target) ? Math.max(1, obj.target) : undefined;
    const current =
      typeof obj.current === 'number' && Number.isFinite(obj.current)
        ? Math.max(0, Math.min(target ?? 99999, obj.current))
        : undefined;
    return {
      id: sanitizeString(obj.id, `obj_${idx}`, 48),
      text: sanitizeString(obj.text, 'Mission Objective', 220),
      isCompleted: Boolean(obj.isCompleted),
      ...(current !== undefined ? { current } : {}),
      ...(target !== undefined ? { target } : {})
    };
  });

  const savedAtMs =
    typeof data.savedAtMs === 'number' && Number.isFinite(data.savedAtMs)
      ? data.savedAtMs
      : Date.now();
  const savedAt =
    typeof data.savedAt === 'string' && !Number.isNaN(Date.parse(data.savedAt))
      ? data.savedAt
      : new Date(savedAtMs).toISOString();

  const sanitized: SaveGameV1 = {
    version: SAVE_VERSION,
    savedAt,
    savedAtMs,
    profile: {
      callsign: sanitizeString(profileRaw.callsign, 'Eagle-1', 16),
      avatar: sanitizeString(profileRaw.avatar, '👩‍🚀', 8)
    },
    planet: data.planet as PlanetType,
    player: {
      x: clamp(playerRaw.x, -145, 145, 0),
      y: clamp(playerRaw.y, -20, 60, 0),
      z: clamp(playerRaw.z, -145, 145, 0),
      rotation: clamp(playerRaw.rotation, -Math.PI * 4, Math.PI * 4, 0)
    },
    vitals: {
      health: clamp(vitalsRaw.health, 1, 100, 100),
      oxygen: clamp(vitalsRaw.oxygen, 0, 100, 100),
      energy: clamp(vitalsRaw.energy, 0, 100, 100),
      water: clamp(vitalsRaw.water, 0, 100, 90),
      food: clamp(vitalsRaw.food, 0, 100, 85),
      radiationDose: clamp(vitalsRaw.radiationDose, 0, 100000, 0),
      isInsideShelter: Boolean(vitalsRaw.isInsideShelter)
    },
    inventory: cleanInventory,
    placedBuildings: cleanBuildings,
    resourceNodes: cleanNodes,
    progression: {
      currentMissionIndex: Math.round(clamp(progRaw.currentMissionIndex, 0, 3, 0)),
      activeMission: {
        id: Math.round(clamp(activeMissionRaw.id, 1, 4, 1)),
        code: sanitizeString(activeMissionRaw.code, 'M-01', 16),
        title: sanitizeString(activeMissionRaw.title, 'Mission 1: First Landing', 120),
        subtitle: sanitizeString(activeMissionRaw.subtitle, '', 140),
        briefing: sanitizeString(activeMissionRaw.briefing, '', 600),
        learningGoal: sanitizeString(activeMissionRaw.learningGoal, '', 300),
        badgeTitle: sanitizeString(activeMissionRaw.badgeTitle, 'Explorer', 100),
        badgeId: sanitizeString(activeMissionRaw.badgeId, 'badge_m1_pioneer', 64),
        objectives: cleanObjectives
      },
      completedMissionIds: Array.isArray(progRaw.completedMissionIds)
        ? progRaw.completedMissionIds.filter((x): x is number => typeof x === 'number' && x >= 1 && x <= 4)
        : [],
      earnedBadges: Array.isArray(progRaw.earnedBadges)
        ? progRaw.earnedBadges.filter((x): x is string => typeof x === 'string')
        : [],
      sciencePoints: Math.round(clamp(progRaw.sciencePoints, 0, 1000000, 0)),
      greenhouseCropProgress: clamp(progRaw.greenhouseCropProgress, 0, 100, 0),
      biosignaturesAnalyzed: Math.round(clamp(progRaw.biosignaturesAnalyzed, 0, 1000, 0)),
      triggeredBriefKeys: Array.isArray(progRaw.triggeredBriefKeys)
        ? progRaw.triggeredBriefKeys.filter((x): x is string => typeof x === 'string').slice(0, 64)
        : [],
      tutorialDismissed: Boolean(progRaw.tutorialDismissed)
    },
    simulation: {
      gridBatteryCharge: clamp(simRaw.gridBatteryCharge, 0, 5000, 100),
      maxBatteryCapacity: clamp(simRaw.maxBatteryCapacity, 100, 5000, 100),
      weatherEvent: cleanWeather,
      pendingStormDelaySec:
        typeof simRaw.pendingStormDelaySec === 'number' && Number.isFinite(simRaw.pendingStormDelaySec)
          ? clamp(simRaw.pendingStormDelaySec, 0, 60, 0)
          : null
    }
  };

  return { save: sanitized, corrupted: false };
}

function openSaveDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(IDB_DB_NAME, IDB_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB open failed'));
  });
}

async function writeToIndexedDb(save: SaveGameV1): Promise<boolean> {
  let db: IDBDatabase | null = null;
  try {
    db = await openSaveDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db!.transaction(IDB_STORE_NAME, 'readwrite');
      const store = tx.objectStore(IDB_STORE_NAME);
      store.put(save, IDB_SAVE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('IndexedDB write failed'));
      tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
    });
    return true;
  } catch {
    return false;
  } finally {
    db?.close();
  }
}

async function readFromIndexedDb(): Promise<unknown | null> {
  let db: IDBDatabase | null = null;
  try {
    db = await openSaveDatabase();
    return await new Promise<unknown | null>((resolve, reject) => {
      const tx = db!.transaction(IDB_STORE_NAME, 'readonly');
      const store = tx.objectStore(IDB_STORE_NAME);
      const req = store.get(IDB_SAVE_KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error || new Error('IndexedDB read failed'));
    });
  } catch {
    return null;
  } finally {
    db?.close();
  }
}

async function deleteFromIndexedDb(): Promise<void> {
  let db: IDBDatabase | null = null;
  try {
    db = await openSaveDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db!.transaction(IDB_STORE_NAME, 'readwrite');
      const store = tx.objectStore(IDB_STORE_NAME);
      store.delete(IDB_SAVE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('IndexedDB delete failed'));
    });
  } catch {
    // Ignore IDB delete error cleanly
  } finally {
    db?.close();
  }
}

/**
 * Synchronous fallback mirror used alongside IndexedDB for instant pagehide / abrupt-refresh survival.
 */
export function writeSyncRecoveryMirror(save: SaveGameV1): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}

function readSyncRecoveryMirror(): { raw: unknown | null; parseError: boolean } {
  try {
    if (typeof localStorage === 'undefined') return { raw: null, parseError: false };
    const text = localStorage.getItem(LS_FALLBACK_KEY);
    if (!text) return { raw: null, parseError: false };
    return { raw: JSON.parse(text), parseError: false };
  } catch {
    return { raw: null, parseError: true };
  }
}

export async function saveGameToStorage(save: SaveGameV1): Promise<PersistSaveResult> {
  const mirrorOk = writeSyncRecoveryMirror(save);
  const idbOk = await writeToIndexedDb(save);

  if (idbOk) {
    return { ok: true, savedAt: save.savedAt, backend: 'indexeddb' };
  }
  if (mirrorOk) {
    return { ok: true, savedAt: save.savedAt, backend: 'localstorage' };
  }
  return { ok: false, savedAt: save.savedAt, backend: 'failed' };
}

export async function loadSavedGame(): Promise<LoadSaveResult> {
  const idbRaw = await readFromIndexedDb();
  const idbValidated = validateAndSanitizeSave(idbRaw);

  const lsRead = readSyncRecoveryMirror();
  const lsValidated = validateAndSanitizeSave(lsRead.raw);

  // Pick whichever valid record is newest (covers fast browser refresh before async IDB finishes)
  if (idbValidated.save && lsValidated.save) {
    if (lsValidated.save.savedAtMs > idbValidated.save.savedAtMs) {
      return { save: lsValidated.save, corrupted: false, source: 'localstorage' };
    }
    return { save: idbValidated.save, corrupted: false, source: 'indexeddb' };
  }

  if (idbValidated.save) {
    return { save: idbValidated.save, corrupted: false, source: 'indexeddb' };
  }

  if (lsValidated.save) {
    return { save: lsValidated.save, corrupted: false, source: 'localstorage' };
  }

  const corrupted = Boolean(idbValidated.corrupted || lsValidated.corrupted || lsRead.parseError);
  return { save: null, corrupted, source: 'none' };
}

export async function clearSavedGame(): Promise<void> {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LS_FALLBACK_KEY);
    }
  } catch {
    // Ignore storage removal errors
  }
  await deleteFromIndexedDb();
}

export function formatSaveTimestamp(iso: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return 'Unknown';
  try {
    return new Date(ms).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return new Date(ms).toUTCString();
  }
}
