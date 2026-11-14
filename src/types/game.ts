export type DestinationType = 'moon' | 'mars';

export interface PlayerProfile {
  name: string;
  callsign: string;
  avatar: string;
  title: string;
  destination: DestinationType;
  experiencePoints: number;
  completedMissions: string[];
  badges: string[];
  soundEnabled: boolean;
  savedAt?: string;
}

export interface ResourceState {
  lifeSupport: number; // 0 - 100% (Oxygen, Water recycling, Cabin pressure)
  power: number;       // 0 - 100% (Battery storage, Solar/Fission output)
  protection: number;  // 0 - 100% (Shielding integrity, Radiation dosage buffer)
  food: number;        // 0 - 100% (Greenhouse growth, Rations, Crew stamina)
  science: number;     // 0 - 100+ (Research data points accumulated)
}

export interface ResourceDelta {
  lifeSupport?: number;
  power?: number;
  protection?: number;
  food?: number;
  science?: number;
}

export interface Choice {
  id: string;
  title: string;
  tagline: string;
  description: string;
  benefits: string[];
  costs: string[];
  resourceDeltas: ResourceDelta;
  feedbackText: string;
  scientificExplanation: string;
  nasaFact: string;
  nasaSource?: string;
  recoveryNote?: string;
}

export interface Challenge {
  id: string;
  title: string;
  order: number;
  category: 'habitat' | 'power' | 'eclss' | 'protection' | 'food' | 'comms' | 'emergency' | 'science';
  situation: string;
  contextFact: string;
  visualState?: 'nominal' | 'warning' | 'alert' | 'storm' | 'critical';
  choices: Choice[];
  hint: string;
}

export interface RandomEvent {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'critical';
  resourceImpact: ResourceDelta;
  explanation: string;
  nasaRealWorldCase: string;
}

export interface Mission {
  id: string;
  number: number;
  code: string;
  title: string;
  subtitle: string;
  objective: string;
  learningGoal: string;
  durationSols: number;
  environmentCondition: string;
  challenges: Challenge[];
  potentialEvents: RandomEvent[];
  badgeId: string;
  badgeTitle: string;
  badgeDescription: string;
}

export interface Badge {
  id: string;
  title: string;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'legendary';
  unlockedAt?: string;
}

export type MissionOutcomeStatus = 'success' | 'compromised' | 'failure';

export interface MissionResult {
  missionId: string;
  missionTitle: string;
  destination: DestinationType;
  success: boolean;
  outcomeStatus?: MissionOutcomeStatus;
  failureReason?: string;
  finalResources: ResourceState;
  decisionsMade: {
    challengeId: string;
    challengeTitle: string;
    choiceId: string;
    choiceTitle: string;
    explanation: string;
    resourceImpact: ResourceDelta;
  }[];
  survivalScore: number;
  scienceScore: number;
  totalScore: number;
  rankAwarded: string;
  badgesEarned: Badge[];
  keyLessonsLearned: string[];
  seed: number;
  timestamp: string;
}

export interface ActiveMissionState {
  missionId: string;
  missionTitle: string;
  challengeIndex: number;
  totalChallenges: number;
  resources: ResourceState;
  decisionsHistory: {
    challengeId: string;
    challengeTitle: string;
    choiceId: string;
    choiceTitle: string;
    explanation: string;
    resourceImpact: ResourceDelta;
  }[];
  solsElapsed: number;
  destination: DestinationType;
  savedAt: string;
}

export interface NasaObservation {
  id: string;
  title: string;
  type:
    | 'solar_flare'
    | 'cme'
    | 'sep'
    | 'geomagnetic'
    | 'biology_osdr'
    | 'radlab'
    | 'mars_trek'
    | 'csa_food'
    | 'lunar_artemis'
    | 'mars_weather';
  timestamp: string;
  source: string;
  sourceUrl: string;
  status: 'live' | 'archived_verified';
  dataOrigin?: 'live' | 'cached' | 'curated' | 'simulated';
  unit?: string;
  measurementContext?: string;
  caveat?: string;
  previewImageUrl?: string;
  summary: string;
  metrics: { [key: string]: string | number };
  gameplayRelevance: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  phonetic?: string;
  category: 'Life Support' | 'Power & Energy' | 'Radiation & Sun' | 'Planetary Science' | 'Spacecraft & Habitat';
  simpleDefinition: string;
  funFact: string;
  nasaLink?: string;
}
