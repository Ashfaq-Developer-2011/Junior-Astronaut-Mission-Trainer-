export type PlanetType = 'moon' | 'mars';

export interface PlayerVitals {
  health: number;       // 0 - 100
  oxygen: number;       // 0 - 100 (% of suit tank)
  energy: number;       // 0 - 100 (suit battery)
  water: number;        // 0 - 100 (hydration)
  food: number;         // 0 - 100 (nourishment)
  radiationDose: number;// mSv accumulated
  isInsideShelter: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  count: number;
  icon: string;
  description: string;
}

export type BuildingType =
  | 'habitat'
  | 'oxygen_gen'
  | 'water_recycler'
  | 'solar_panel'
  | 'battery'
  | 'rad_shelter'
  | 'greenhouse'
  | 'research_lab'
  | 'comm_antenna';

export interface BuildingBlueprint {
  type: BuildingType;
  name: string;
  category: 'Life Support' | 'Power' | 'Protection' | 'Science & Food';
  cost: { [resourceId: string]: number };
  powerDelta: number; // positive = generates kW, negative = consumes kW
  oxygenDelta: number;
  waterDelta: number;
  foodDelta: number;
  description: string;
  nasaContext: string;
}

export interface PlacedBuilding {
  id: string;
  type: BuildingType;
  x: number;
  z: number;
  rotation: number;
  isOnline: boolean;
  health: number; // 0 - 100
}

export interface ResourceNode {
  id: string;
  type: 'regolith' | 'ice' | 'silicon' | 'biosignature';
  name: string;
  x: number;
  z: number;
  amountRemaining: number;
}

export interface CampaignMission {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  briefing: string;
  learningGoal: string;
  badgeTitle: string;
  badgeId: string;
  objectives: {
    id: string;
    text: string;
    isCompleted: boolean;
    current?: number;
    target?: number;
  }[];
}

export interface SpaceWeatherEvent {
  isActive: boolean;
  type: 'solar_storm' | 'dust_storm';
  severity: 'moderate' | 'extreme';
  radiationRate: number; // simulated gameplay mSv/sec unprotected
  timeRemainingSec: number;
  nasaWarning: string;
  donkiEventId?: string;
  dataOrigin?: 'live' | 'cached' | 'curated';
}

export interface ScienceFieldBrief {
  id: string;
  missionId: number;
  category: 'recon' | 'space_weather' | 'habitat' | 'food_osdr';
  title: string;
  explanation: string;
  scientificReference: string;
  measurementContext: string;
  dataOrigin: 'live' | 'cached' | 'curated';
  simulatedNote: string;
}
