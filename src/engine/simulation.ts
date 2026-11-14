import { DestinationType, PlayerProfile, ResourceDelta, ResourceState, MissionResult, Badge, Choice, Mission, RandomEvent, ActiveMissionState, MissionOutcomeStatus } from '../types/game';
import { BADGES_LIST } from '../data/missions';

// Deterministic Mulberry32 PRNG
export function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const INITIAL_RESOURCES: Record<DestinationType, ResourceState> = {
  moon: {
    lifeSupport: 75,
    power: 70,
    protection: 70,
    food: 80,
    science: 15
  },
  mars: {
    lifeSupport: 70,
    power: 65,
    protection: 65,
    food: 75,
    science: 20
  }
};

export function clampResource(val: number, min = 0, max = 100): number {
  if (isNaN(val) || val === undefined || val === null) return min;
  return Math.max(min, Math.min(max, Math.round(val)));
}

export function applyResourceDeltas(
  current: ResourceState,
  deltas: ResourceDelta,
  destination: DestinationType
): { next: ResourceState; warnings: string[]; isCritical: boolean; failedResource?: string } {
  // Destination specific ambient environmental load
  const destModifier = destination === 'mars' ? 0.95 : 1.0;

  const next: ResourceState = {
    lifeSupport: clampResource((current.lifeSupport || 0) + (deltas.lifeSupport || 0)),
    power: clampResource((current.power || 0) + Math.round((deltas.power || 0) * (deltas.power && deltas.power < 0 ? destModifier : 1.0))),
    protection: clampResource((current.protection || 0) + (deltas.protection || 0)),
    food: clampResource((current.food || 0) + (deltas.food || 0)),
    science: Math.max(0, Math.round((current.science || 0) + (deltas.science || 0)))
  };

  const warnings: string[] = [];
  let isCritical = false;
  let failedResource: string | undefined = undefined;

  if (next.lifeSupport <= 0) {
    failedResource = 'Life Support System Pressure Exhausted';
  } else if (next.power <= 0) {
    failedResource = 'Main Power Grid Blackout';
  } else if (next.protection <= 0) {
    failedResource = 'Radiation Shielding Total Breach';
  } else if (next.food <= 0) {
    failedResource = 'Critical Calorie Depletion & Crew Exhaustion';
  }

  if (next.lifeSupport <= 20) {
    warnings.push('CRITICAL: Oxygen/Water reserves dropping below safe 20% margin!');
    isCritical = true;
  }
  if (next.power <= 20) {
    warnings.push('CRITICAL: Battery power grid running on emergency capacitors!');
    isCritical = true;
  }
  if (next.protection <= 20) {
    warnings.push('WARNING: Hull shielding worn thin; radiation dosage accumulating!');
    isCritical = true;
  }
  if (next.food <= 20) {
    warnings.push('WARNING: Calorie rations low; crew stamina under severe strain!');
  }

  return { next, warnings, isCritical, failedResource };
}

// Emergency recovery protocol (NASA teaches learning and resilience!)
export function applyEmergencyProtocol(current: ResourceState): { recovered: ResourceState; message: string } {
  const recovered: ResourceState = {
    lifeSupport: Math.max(25, current.lifeSupport),
    power: Math.max(25, current.power),
    protection: Math.max(25, current.protection),
    food: Math.max(25, current.food),
    science: Math.max(5, current.science - 10) // Small science penalty for burning backup reserves
  };

  return {
    recovered,
    message: 'NASA Emergency Protocol Activated: Houston authorized safety backup reserves to stabilize the habitat! Resources restored to survival minimums.'
  };
}

export function calculateMissionScore(
  mission: Mission,
  finalResources: ResourceState,
  success: boolean,
  choicesCount: number
): { survivalScore: number; scienceScore: number; totalScore: number; rank: string; badgesEarned: Badge[]; outcomeStatus: MissionOutcomeStatus } {
  // Check whether any resource fell critically low (< 25%)
  const hasCompromisedResource = 
    finalResources.lifeSupport < 25 ||
    finalResources.power < 25 ||
    finalResources.protection < 25 ||
    finalResources.food < 25;

  let outcomeStatus: MissionOutcomeStatus = 'success';
  if (!success || finalResources.lifeSupport <= 0 || finalResources.power <= 0 || finalResources.protection <= 0 || finalResources.food <= 0) {
    outcomeStatus = 'failure';
  } else if (hasCompromisedResource) {
    outcomeStatus = 'compromised';
  }

  if (outcomeStatus === 'failure') {
    return {
      survivalScore: Math.round(((finalResources.lifeSupport || 0) + (finalResources.power || 0)) / 2),
      scienceScore: finalResources.science || 0,
      totalScore: Math.round((finalResources.science || 0) * 1.5),
      rank: 'Mission Trainee (Debrief Required)',
      badgesEarned: [],
      outcomeStatus
    };
  }

  // Survival score based on remaining lifeSupport, power, protection, food
  const survivalAvg = (finalResources.lifeSupport + finalResources.power + finalResources.protection + finalResources.food) / 4;
  let survivalScore = Math.round(survivalAvg * 10); // Max ~1000

  // Penalty if compromised
  if (outcomeStatus === 'compromised') {
    survivalScore = Math.round(survivalScore * 0.7);
  }

  // Science score
  const scienceScore = Math.round((finalResources.science || 0) * 20); // Max ~2000

  const totalScore = survivalScore + scienceScore;

  let rank = 'Cadet Explorer';
  if (totalScore >= 2400) {
    rank = 'Legendary Fleet Commander';
  } else if (totalScore >= 1800) {
    rank = 'Distinguished Flight Director';
  } else if (totalScore >= 1200) {
    rank = 'Senior Outpost Commander';
  } else if (totalScore >= 800) {
    rank = 'Junior Mission Commander';
  }

  const badgesEarned: Badge[] = [];
  const missionBadge = BADGES_LIST.find(b => b.id === mission.badgeId);
  if (missionBadge) {
    badgesEarned.push(missionBadge);
  }

  if (outcomeStatus === 'success' && finalResources.lifeSupport >= 70 && finalResources.protection >= 70) {
    const safeBadge = BADGES_LIST.find(b => b.id === 'badge-zero-casualty');
    if (safeBadge) badgesEarned.push(safeBadge);
  }

  if (finalResources.science >= 80) {
    const sciBadge = BADGES_LIST.find(b => b.id === 'badge-science-virtuoso');
    if (sciBadge) badgesEarned.push(sciBadge);
  }

  return { survivalScore, scienceScore, totalScore, rank, badgesEarned, outcomeStatus };
}

// Local Storage Management
const STORAGE_KEY = 'jamt_commander_profile_v2';
const PROGRESS_KEY = 'jamt_mission_progress_v2';
const ACTIVE_MISSION_KEY = 'jamt_active_mission_state_v2';

export const StorageService = {
  loadProfile(): PlayerProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // safe fallback
    }
    return null;
  },

  saveProfile(profile: PlayerProfile): void {
    try {
      const updated = { ...profile, savedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Unable to persist profile locally', e);
    }
  },

  loadMissionResults(): Record<string, MissionResult> {
    try {
      const data = localStorage.getItem(PROGRESS_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return {};
  },

  saveMissionResult(result: MissionResult): void {
    try {
      const existing = this.loadMissionResults();
      existing[result.missionId] = result;
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(existing));
    } catch (e) {
      console.warn('Unable to persist mission result', e);
    }
  },

  // In-progress Active Mission Save & Resume
  loadActiveMission(): ActiveMissionState | null {
    try {
      const data = localStorage.getItem(ACTIVE_MISSION_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  },

  saveActiveMission(state: ActiveMissionState): void {
    try {
      localStorage.setItem(ACTIVE_MISSION_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Unable to save active mission state', e);
    }
  },

  clearActiveMission(): void {
    try {
      localStorage.removeItem(ACTIVE_MISSION_KEY);
    } catch {}
  },

  resetAllProgress(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(ACTIVE_MISSION_KEY);
  }
};
