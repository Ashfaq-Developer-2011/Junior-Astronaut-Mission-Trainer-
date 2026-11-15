import {
  BuildingBlueprint, BuildingType, CampaignMission,
  PlacedBuilding, PlanetType, PlayerVitals, ResourceNode, ScienceFieldBrief, SpaceWeatherEvent
} from '../../types/survival';
import { RADLAB_VERIFIED_BASELINES, RadLabBaseline } from '../../data/radlabBaselines';
import { CSA_FOOD_PRODUCTION_RESOURCES } from '../../data/csaFoodData';
import { MARS_TREK_SITES } from '../../data/marsTrekSites';
import type { Phase2ScienceBundle } from '../../services/nasaData';
import { SAVE_VERSION, SaveGameV1 } from '../../services/saveSystem';

export const BUILDING_BLUEPRINTS: Record<BuildingType, BuildingBlueprint> = {
  habitat: {
    type: 'habitat',
    name: 'Astronaut Habitat Dome',
    category: 'Life Support',
    cost: { regolith: 25, silicon: 10 },
    powerDelta: -4,
    oxygenDelta: 0,
    waterDelta: 0,
    foodDelta: 0,
    description: 'Pressurized living quarters with regolith radiation berm and airlock. Automatically replenishes suit oxygen and protects from harsh planetary temperatures.',
    nasaContext: 'NASA Artemis Lunar Base Camp surface habitat (TransHab / inflatable module with regolith shielding).'
  },
  oxygen_gen: {
    type: 'oxygen_gen',
    name: 'ECLSS Oxygen Generator',
    category: 'Life Support',
    cost: { regolith: 15, ice: 10, silicon: 5 },
    powerDelta: -5,
    oxygenDelta: 2.5,
    waterDelta: -0.5,
    foodDelta: 0,
    description: 'Electrolysis life-support unit that splits water into breathable oxygen and hydrogen gas, pressurizing your outpost.',
    nasaContext: 'NASA ISS Oxygen Generation System (OGS) and Sabatier CO2 reduction reactor.'
  },
  water_recycler: {
    type: 'water_recycler',
    name: 'Water Recovery System',
    category: 'Life Support',
    cost: { regolith: 20, ice: 15, silicon: 8 },
    powerDelta: -3,
    oxygenDelta: 0,
    waterDelta: 1.8,
    foodDelta: 0,
    description: 'Catalytic wastewater filtration processor inspired by station ECLSS water recovery systems (in-game water balance rates are simulated for training).',
    nasaContext: 'NASA Exploration ECLSS Water Processor Assembly (WPA).'
  },
  solar_panel: {
    type: 'solar_panel',
    name: 'Solar Power Station',
    category: 'Power',
    cost: { silicon: 12, regolith: 10 },
    powerDelta: 12,
    oxygenDelta: 0,
    waterDelta: 0,
    foodDelta: 0,
    description: 'Dual photovoltaic wing arrays generating electricity from sunlight to power life-support machines and heaters (simulated kW output).',
    nasaContext: 'High-efficiency solar array wings used on Artemis lunar landers and Deep Space Gateway.'
  },
  battery: {
    type: 'battery',
    name: 'Battery Storage Bank',
    category: 'Power',
    cost: { silicon: 15, regolith: 15 },
    powerDelta: 0,
    oxygenDelta: 0,
    waterDelta: 0,
    foodDelta: 0,
    description: 'Regenerative energy storage bank balancing solar generation against life-support electrical draw during dust or solar weather events.',
    nasaContext: 'NASA Glenn Research Center energy storage systems for extreme planetary environments.'
  },
  rad_shelter: {
    type: 'rad_shelter',
    name: 'Radiation Storm Shelter',
    category: 'Protection',
    cost: { regolith: 35, silicon: 5 },
    powerDelta: -2,
    oxygenDelta: 0,
    waterDelta: 0,
    foodDelta: 0,
    description: 'Fortified storm bunker shielded with dense regolith mass. Simulates emergency shelter safety during solar particle storms; real radiation attenuation depends on regolith thickness, density, and particle energy.',
    nasaContext: 'NASA Langley in-situ regolith radiation shielding & RadLab environment context (μGy/hour).'
  },
  greenhouse: {
    type: 'greenhouse',
    name: 'Hydroponic Greenhouse',
    category: 'Science & Food',
    cost: { regolith: 20, ice: 10, silicon: 10 },
    powerDelta: -6,
    oxygenDelta: 0.8,
    waterDelta: -1.0,
    foodDelta: 2.0,
    description: 'Controlled Environment Agriculture (CEA) rack using narrow-band LEDs and closed-loop nutrient water (in-game crop timer and yields are simulated).',
    nasaContext: 'CSA Food Production Toolkit / Naurvik Arctic CEA & NASA Veggie / APH programs.'
  },
  research_lab: {
    type: 'research_lab',
    name: 'Research Laboratory',
    category: 'Science & Food',
    cost: { regolith: 30, silicon: 20 },
    powerDelta: -5,
    oxygenDelta: 0,
    waterDelta: 0,
    foodDelta: 0,
    description: 'Equipped with Raman spectrometers and electron microscopes to analyze extraterrestrial rock samples and search for ancient biosignatures.',
    nasaContext: 'NASA Mars 2020 SHERLOC and PIXL instruments for microscopic biosignature analysis.'
  },
  comm_antenna: {
    type: 'comm_antenna',
    name: 'Deep Space Comm Dish',
    category: 'Science & Food',
    cost: { silicon: 18, regolith: 15 },
    powerDelta: -4,
    oxygenDelta: 0,
    waterDelta: 0,
    foodDelta: 0,
    description: 'High-gain X-band parabolic antenna linking the outpost directly to NASA Deep Space Network on Earth for telemetry and live weather updates.',
    nasaContext: 'NASA Deep Space Network (DSN) antennas in Goldstone, Madrid, and Canberra.'
  }
};

export const CAMPAIGN_MISSIONS: CampaignMission[] = [
  {
    id: 1,
    code: 'M-01',
    title: 'Mission 1: First Landing',
    subtitle: 'Touchdown & Initial Survival Systems',
    briefing: 'You have landed safely on the planetary surface! Your immediate priority is survival: explore the perimeter, mine regolith and ice, construct an Astronaut Habitat Dome, and establish an initial solar power and oxygen grid.',
    learningGoal: 'Living in space requires immediately prioritizing oxygen and pressurized habitat over all else.',
    badgeTitle: 'Lunar/Martian Pioneer',
    badgeId: 'badge_m1_pioneer',
    objectives: [
      { id: 'm1_explore', text: 'Explore the landing perimeter (walk 35m from lander)', isCompleted: false },
      { id: 'm1_mine', text: 'Mine 25 Regolith and 10 Ice crystals from resource deposits', isCompleted: false, current: 0, target: 35 },
      { id: 'm1_habitat', text: 'Open Construction Menu (B) and place an Astronaut Habitat Dome', isCompleted: false },
      { id: 'm1_power', text: 'Construct a Solar Power Station to energize the outpost', isCompleted: false },
      { id: 'm1_oxygen', text: 'Construct an ECLSS Oxygen Generator and verify airlock pressurization', isCompleted: false }
    ]
  },
  {
    id: 2,
    code: 'M-02',
    title: 'Mission 2: Build the Outpost',
    subtitle: 'Base Expansion & Closed-Loop Agriculture',
    briefing: 'A single habitat is not enough for extended stays. You must build energy storage for night cycles, install water recycling to prevent dehydration, and establish a hydroponic greenhouse for fresh food.',
    learningGoal: 'Closed-loop recycling (water and hydroponics) is essential because rockets cannot deliver infinite consumables from Earth.',
    badgeTitle: 'Master Outpost Engineer',
    badgeId: 'badge_m2_engineer',
    objectives: [
      { id: 'm2_battery', text: 'Build a Battery Storage Bank to store surplus energy', isCompleted: false },
      { id: 'm2_water', text: 'Construct a Water Recovery System to recycle wastewater', isCompleted: false },
      { id: 'm2_greenhouse', text: 'Construct a Hydroponic Greenhouse to cultivate space crops', isCompleted: false },
      { id: 'm2_power_balance', text: 'Achieve a positive base power balance (> 10 kW surplus)', isCompleted: false }
    ]
  },
  {
    id: 3,
    code: 'M-03',
    title: 'Mission 3: Survive the Storm',
    subtitle: 'Coronal Mass Ejection & Radiation Shielding',
    briefing: 'NASA DONKI space weather satellites have detected an X-class solar flare launching an energetic proton shock front toward your position. Construct a heavy Radiation Storm Shelter and take cover until the storm passes!',
    learningGoal: 'Radiation protection requires physical mass shielding (water or regolith) and operational shelter readiness.',
    badgeTitle: 'Solar Storm Survivor',
    badgeId: 'badge_m3_storm',
    objectives: [
      { id: 'm3_warning', text: 'Acknowledge NASA DONKI space weather alert', isCompleted: false },
      { id: 'm3_shelter', text: 'Construct a fortified Radiation Storm Shelter using dense regolith', isCompleted: false },
      { id: 'm3_retreat', text: 'Enter inside the shelter airlock before the proton shock wave hits', isCompleted: false },
      { id: 'm3_survive', text: 'Survive the full duration of the solar particle storm safely inside', isCompleted: false }
    ]
  },
  {
    id: 4,
    code: 'M-04',
    title: 'Mission 4: The Long Expedition',
    subtitle: 'Deep Science, Communication & Self-Sufficiency',
    briefing: 'Embark on a true planetary expedition. Construct a Deep Space Comm Antenna to link with Earth, venture out to find the ancient Biosignature Outcrop, extract core samples, and analyze them in a Research Laboratory.',
    learningGoal: 'Long-duration exploration balances scientific discovery with meticulous life-support management.',
    badgeTitle: 'Interplanetary Expedition Commander',
    badgeId: 'badge_m4_explorer',
    objectives: [
      { id: 'm4_antenna', text: 'Construct a Deep Space Comm Dish to transmit telemetry to NASA', isCompleted: false },
      { id: 'm4_expedition', text: 'Journey across the terrain to locate the ancient Biosignature Outcrop', isCompleted: false },
      { id: 'm4_sample', text: 'Mine a geological Biosignature Core Sample', isCompleted: false },
      { id: 'm4_lab', text: 'Construct a Research Laboratory and process the discovery sample', isCompleted: false },
      { id: 'm4_sustain', text: 'Maintain all vital systems above 50% with self-sufficient food and water', isCompleted: false }
    ]
  }
];

export class GameEngine {
  public planet: PlanetType = 'moon';
  public vitals: PlayerVitals;
  public inventory: Map<string, number> = new Map();
  public placedBuildings: PlacedBuilding[] = [];
  public resourceNodes: ResourceNode[] = [];
  public currentMissionIndex = 0;
  public activeMission: CampaignMission;

  // Base Energy & Life-Support Grid
  public gridPowerGenerated = 0;
  public gridPowerConsumed = 0;
  public gridBatteryCharge = 100;
  public maxBatteryCapacity = 100;
  public gridOxygenFlow = 0;
  public gridWaterFlow = 0;
  public greenhouseCropProgress = 0; // 0 - 100%
  public sciencePoints = 0;

  // Weather Event
  public weatherEvent: SpaceWeatherEvent = {
    isActive: false,
    type: 'solar_storm',
    severity: 'extreme',
    radiationRate: 0,
    timeRemainingSec: 0,
    nasaWarning: ''
  };
  private pendingStormDelaySec: number | null = null;
  private pendingStormWarning = '';

  // Player position in 3D world
  public playerX = 0;
  public playerZ = 0;
  public playerY = 0;
  public playerRotation = 0;

  public isPaused = false;
  public isGameOver = false;
  public gameOverReason = '';
  public completedMissionIds: number[] = [];
  public earnedBadges: string[] = [];
  public biosignaturesAnalyzed = 0;

  // Phase 3 Scientific Context & Educational Briefs Queue
  private donkiContext: {
    id: string;
    title: string;
    origin: 'live' | 'cached' | 'curated';
  } = {
    id: 'DONKI-FLR-2024-X58',
    title: 'Solar Eruption / CME Activity Reference',
    origin: 'curated'
  };

  private osdrStudies: Array<{
    id: string;
    title: string;
    summary: string;
    origin: 'live' | 'cached' | 'curated';
  }> = [
    {
      id: 'OSD-120',
      title: 'Genetic dissection of the Arabidopsis spaceflight transcriptome',
      summary: 'ISS plant adaptation transcriptome study.',
      origin: 'curated'
    },
    {
      id: 'OSD-520',
      title: 'DNA Methylation in Arabidopsis Exposed Over Multiple Generations to Gamma Radiation',
      summary: 'Evaluates multi-generation ionizing radiation effects on plant DNA.',
      origin: 'curated'
    },
    {
      id: 'OSD-46',
      title: 'Gamma radiation and HZE treatment of seedlings in Arabidopsis',
      summary: 'Measures plant cellular repair transcriptional response to ionizing radiation.',
      origin: 'curated'
    }
  ];

  private radlabBaselines: RadLabBaseline[] = RADLAB_VERIFIED_BASELINES.map(b => ({ ...b }));
  private marsTrekSiteSummary = MARS_TREK_SITES[0];
  private triggeredBriefKeys = new Set<string>();
  private scienceBriefQueue: ScienceFieldBrief[] = [];

  constructor(planet: PlanetType = 'moon') {
    this.planet = planet;
    this.vitals = {
      health: 100,
      oxygen: 100,
      energy: 100,
      water: 90,
      food: 85,
      radiationDose: 0,
      isInsideShelter: false
    };

    // Starting explorer inventory
    this.inventory.set('regolith', 20);
    this.inventory.set('ice', 10);
    this.inventory.set('silicon', 10);
    this.inventory.set('food_rations', 4);

    this.activeMission = JSON.parse(JSON.stringify(CAMPAIGN_MISSIONS[0]));

    this.spawnResourceNodes();
  }

  // Populate terrain with natural resource deposits
  public spawnResourceNodes() {
    this.resourceNodes = [];
    const count = 28;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.4;
      const dist = 18 + (i * 7) % 85;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      let type: 'regolith' | 'ice' | 'silicon' | 'biosignature' = 'regolith';
      if (i % 3 === 1) type = 'ice';
      else if (i % 3 === 2) type = 'silicon';

      // One special biosignature outcrop far to the north-east for Mission 4
      if (i === count - 1) {
        type = 'biosignature';
      }

      this.resourceNodes.push({
        id: `node_${i}`,
        type,
        name:
          type === 'ice'
            ? 'Water-Ice Crystal Cluster'
            : type === 'regolith'
            ? 'Regolith Mineral Boulder'
            : type === 'silicon'
            ? 'Solar Silicon Ore Deposit'
            : 'Ancient Biosignature Fossil Strata',
        x: i === count - 1 ? 65 : x,
        z: i === count - 1 ? 55 : z,
        amountRemaining: type === 'biosignature' ? 2 : 4
      });
    }
  }

  public ensureBiosignatureNodeAvailable() {
    const hasNode = this.resourceNodes.some(n => n.type === 'biosignature' && n.amountRemaining > 0);
    const hasSample = (this.inventory.get('biosignature') || 0) > 0;
    if (!hasNode && !hasSample && this.biosignaturesAnalyzed === 0) {
      this.resourceNodes.push({
        id: `node_bio_${Date.now()}`,
        type: 'biosignature',
        name: 'Ancient Biosignature Fossil Strata',
        x: 65,
        z: 55,
        amountRemaining: 2
      });
    }
  }

  // Core Simulation Tick (called every frame)
  public update(delta: number, isMoving: boolean, isSprinting: boolean) {
    if (this.isPaused || this.isGameOver) return;
    const dt = Math.min(Math.max(delta, 0), 0.1);
    delta = dt;

    // 1. Oxygen Depletion & Refill
    if (this.vitals.isInsideShelter || this.isNearFunctioningOxygenGen()) {
      // Refill suit tank
      this.vitals.oxygen = Math.min(100, this.vitals.oxygen + delta * 12);
    } else {
      // Consumed during EVA
      const o2Rate = isSprinting ? 0.65 : 0.28;
      this.vitals.oxygen = Math.max(0, this.vitals.oxygen - delta * o2Rate);
    }

    // If oxygen depleted, astronaut suffocates
    if (this.vitals.oxygen <= 0) {
      this.vitals.health = Math.max(0, this.vitals.health - delta * 6);
      if (this.vitals.health <= 0) {
        this.triggerGameOver('Oxygen reserves exhausted on the planetary surface.');
      }
    }

    // 2. Suit Energy Depletion
    const energyDrain = isSprinting ? 0.5 : 0.15;
    this.vitals.energy = Math.max(0, this.vitals.energy - delta * energyDrain);

    // 3. Hydration & Hunger
    this.vitals.water = Math.max(0, this.vitals.water - delta * 0.08);
    this.vitals.food = Math.max(0, this.vitals.food - delta * 0.05);

    if (this.vitals.water <= 0 || this.vitals.food <= 0) {
      this.vitals.health = Math.max(0, this.vitals.health - delta * 2.5);
    }

    // 4. Base Grid Power Calculation
    this.recomputeGridState();

    // Battery charge calculation
    const netPower = this.gridPowerGenerated - this.gridPowerConsumed;
    this.gridBatteryCharge = Math.max(
      0,
      Math.min(this.maxBatteryCapacity, this.gridBatteryCharge + netPower * delta * 0.2)
    );

    // 5. Greenhouse Crop Growth
    const hasGreenhouse = this.placedBuildings.some(b => b.type === 'greenhouse');
    if (hasGreenhouse && this.gridBatteryCharge > 0) {
      this.greenhouseCropProgress = Math.min(100, this.greenhouseCropProgress + delta * 2.5);
    }

    // 6. Check if astronaut is inside a Habitat Dome or Radiation Shelter
    this.vitals.isInsideShelter = this.checkInsideShelter();

    // 7. Pending & Active Space Weather Simulation (Pause-Safe)
    if (this.pendingStormDelaySec !== null) {
      this.pendingStormDelaySec -= delta;
      if (this.pendingStormDelaySec <= 0) {
        this.pendingStormDelaySec = null;
        if (this.activeMission.id === 3 && !this.weatherEvent.isActive) {
          this.triggerSolarStormEvent(
            this.pendingStormWarning ||
              'NASA DONKI: Fast CME shock front inbound! Seek radiation shelter immediately!'
          );
        }
      }
    }

    if (this.weatherEvent.isActive) {
      this.weatherEvent.timeRemainingSec = Math.max(0, this.weatherEvent.timeRemainingSec - delta);

      if (!this.vitals.isInsideShelter) {
        // Radiation damage outside!
        this.vitals.radiationDose += delta * this.weatherEvent.radiationRate;
        this.vitals.health = Math.max(0, this.vitals.health - delta * 4);
        if (this.vitals.health <= 0) {
          this.triggerGameOver('Lethal solar particle radiation exposure outside shelter.');
        }
      }

      if (this.weatherEvent.timeRemainingSec <= 0) {
        this.weatherEvent.isActive = false;
        // Mission 3 objective check: complete survive only if player built shelter & sheltered during storm
        if (this.activeMission.id === 3) {
          const retObj = this.activeMission.objectives.find(o => o.id === 'm3_retreat');
          const shObj = this.activeMission.objectives.find(o => o.id === 'm3_shelter');
          const survObj = this.activeMission.objectives.find(o => o.id === 'm3_survive');
          if (shObj?.isCompleted && (retObj?.isCompleted || this.vitals.isInsideShelter)) {
            if (retObj) retObj.isCompleted = true;
            if (survObj) survObj.isCompleted = true;
          } else if (survObj && !survObj.isCompleted) {
            // Re-arm storm drill in 8s so M-03 never softlocks if player missed shelter on first wave
            this.pendingStormDelaySec = 8;
            this.pendingStormWarning =
              `SIMULATED DRILL (Ref: NASA DONKI ${this.donkiContext.id}): Second CME wave inbound — build Radiation Shelter & take cover!`;
          }
        }
      }
    }

    // 8. Update Campaign Mission Objectives
    this.checkMissionProgress();
  }

  // Check if player is within shelter radius
  private checkInsideShelter(): boolean {
    for (const bld of this.placedBuildings) {
      if (bld.type === 'habitat' || bld.type === 'rad_shelter') {
        const dx = this.playerX - bld.x;
        const dz = this.playerZ - bld.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        // Habitat Dome (20m wide) uses 10.5m radius; compact Storm Shelter (~8.4m wide + entrance ramp) uses 7.2m
        const shelterRadius = bld.type === 'habitat' ? 10.5 : 7.2;
        if (dist <= shelterRadius) {
          return true;
        }
      }
    }
    // Also lander is safe
    const ldx = this.playerX - (-6);
    const ldz = this.playerZ - (-6);
    return Math.sqrt(ldx * ldx + ldz * ldz) <= 4.0;
  }

  private isNearFunctioningOxygenGen(): boolean {
    if (this.gridBatteryCharge <= 0 && this.gridPowerGenerated <= 0) return false;
    for (const bld of this.placedBuildings) {
      if (bld.type === 'oxygen_gen') {
        const dx = this.playerX - bld.x;
        const dz = this.playerZ - bld.z;
        if (Math.sqrt(dx * dx + dz * dz) <= 5.0) return true;
      }
    }
    return false;
  }

  // Mine a Resource Node
  public mineNode(nodeId: string): { success: boolean; resourceEarned?: string; message: string } {
    const node = this.resourceNodes.find(n => n.id === nodeId);
    if (!node) return { success: false, message: 'Deposit not found.' };

    const dx = this.playerX - node.x;
    const dz = this.playerZ - node.z;
    if (Math.sqrt(dx * dx + dz * dz) > 4.5) {
      return { success: false, message: 'Too far away from deposit to mine.' };
    }

    // Add to inventory
    const current = this.inventory.get(node.type) || 0;
    const yieldAmount = node.type === 'biosignature' ? 1 : 5;
    this.inventory.set(node.type, current + yieldAmount);

    node.amountRemaining -= 1;
    if (node.amountRemaining <= 0) {
      this.resourceNodes = this.resourceNodes.filter(n => n.id !== nodeId);
    }

    // Mission 1 & 4 mining trackers
    if (this.activeMission.id === 1) {
      const mineObj = this.activeMission.objectives.find(o => o.id === 'm1_mine');
      if (mineObj && !mineObj.isCompleted) {
        mineObj.current = (mineObj.current || 0) + yieldAmount;
        if (mineObj.current >= (mineObj.target || 35)) {
          mineObj.isCompleted = true;
        }
      }
    } else if (this.activeMission.id === 4 && node.type === 'biosignature') {
      const sampObj = this.activeMission.objectives.find(o => o.id === 'm4_sample');
      if (sampObj) sampObj.isCompleted = true;
    }

    return {
      success: true,
      resourceEarned: node.type,
      message: `Extracted +${yieldAmount} ${node.type.toUpperCase()}`
    };
  }

  // Construct and place a building
  public canAffordBuilding(type: BuildingType): boolean {
    const bp = BUILDING_BLUEPRINTS[type];
    for (const [res, count] of Object.entries(bp.cost)) {
      if ((this.inventory.get(res) || 0) < count) {
        return false;
      }
    }
    return true;
  }

  public placeBuilding(type: BuildingType, x: number, z: number, rotation: number): { success: boolean; message: string } {
    if (!this.canAffordBuilding(type)) {
      return { success: false, message: 'Insufficient construction resources.' };
    }

    // Deduct cost
    const bp = BUILDING_BLUEPRINTS[type];
    for (const [res, count] of Object.entries(bp.cost)) {
      this.inventory.set(res, (this.inventory.get(res) || 0) - count);
    }

    // Add building
    const building: PlacedBuilding = {
      id: `bld_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type,
      x,
      z,
      rotation,
      isOnline: true,
      health: 100
    };
    this.placedBuildings.push(building);

    // Update mission objective trackers
    this.updateMissionBuildObjectives(type);

    // Phase 3 Educational Triggers for Building Choices
    if (type === 'rad_shelter') {
      const msl = this.radlabBaselines.find(b => b.id === 'RADLAB-MSL-SURFACE');
      const lro = this.radlabBaselines.find(b => b.id === 'RADLAB-LRO-MOON-ORBIT');
      const refText =
        this.planet === 'mars'
          ? `Curiosity MSL-RAD Mars surface mean: ${msl?.meanDoseRate.toFixed(2)} ${msl?.unit}`
          : `LRO CRaTER Lunar Orbit mean: ${lro?.meanDoseRate.toFixed(2)} ${lro?.unit} (Orbital only — not lunar surface)`;
      this.emitBriefOnce({
        id: 'habitat_rad_shelter',
        missionId: this.activeMission.id,
        category: 'habitat',
        title: 'Engineering Choice: Regolith Mass Shielding',
        explanation:
          'Unlike Earth, the Moon and Mars lack thick atmospheres and global magnetic shields. Engineers study using native lunar or Martian regolith as physical mass barriers over emergency shelters.',
        scientificReference: refText,
        measurementContext:
          this.planet === 'mars'
            ? 'Mars Surface (Curiosity RAD) vs Mars Orbit (TGO) in μGy/hour'
            : 'Lunar Orbit (LRO CRaTER) vs Earth LEO (ISS) in μGy/hour',
        dataOrigin: lro?.dataOrigin || 'cached',
        simulatedNote:
          'Simulated shelter protection in gameplay: exact real-world shielding effectiveness is not fabricated.'
      });
    } else if (type === 'water_recycler') {
      this.emitBriefOnce({
        id: 'habitat_water_recycler',
        missionId: this.activeMission.id,
        category: 'habitat',
        title: 'Closed-Loop Water Recovery (ECLSS)',
        explanation:
          'Launching bulk water from Earth costs tremendous rocket mass. Real stations recover humidity condensate and wastewater via catalytic filtration so crews can sustain long-duration missions.',
        scientificReference: 'NASA Exploration ECLSS & CSA Food/Water Loop Principles',
        measurementContext: 'Educational Engineering Context',
        dataOrigin: 'curated',
        simulatedNote: 'Water flow (+1.8 H2O) is a simulated gameplay resource balance value.'
      });
    } else if (type === 'greenhouse') {
      const cea = CSA_FOOD_PRODUCTION_RESOURCES[2];
      this.emitBriefOnce({
        id: 'greenhouse_built',
        missionId: this.activeMission.id,
        category: 'food_osdr',
        title: 'Controlled Environment Agriculture (CSA CEA)',
        explanation:
          'The Canadian Space Agency (CSA) studies soil-less hydroponics and tuned LED lighting (such as the Naurvik Arctic analog) to grow fresh nutrient-rich crops with minimal water and power.',
        scientificReference: `${cea.sourceName}: ${cea.title}`,
        measurementContext: cea.measurementContext,
        dataOrigin: 'curated',
        simulatedNote: 'In-game crop growth timer and harvest counts are simulated for gameplay.'
      });
    }

    return { success: true, message: `Successfully constructed ${bp.name}!` };
  }

  private updateMissionBuildObjectives(type: BuildingType) {
    if (this.activeMission.id === 1) {
      if (type === 'habitat') {
        const obj = this.activeMission.objectives.find(o => o.id === 'm1_habitat');
        if (obj) obj.isCompleted = true;
      }
      if (type === 'solar_panel') {
        const obj = this.activeMission.objectives.find(o => o.id === 'm1_power');
        if (obj) obj.isCompleted = true;
      }
      if (type === 'oxygen_gen') {
        const obj = this.activeMission.objectives.find(o => o.id === 'm1_oxygen');
        if (obj) obj.isCompleted = true;
      }
    } else if (this.activeMission.id === 2) {
      if (type === 'battery') {
        const obj = this.activeMission.objectives.find(o => o.id === 'm2_battery');
        if (obj) obj.isCompleted = true;
      }
      if (type === 'water_recycler') {
        const obj = this.activeMission.objectives.find(o => o.id === 'm2_water');
        if (obj) obj.isCompleted = true;
      }
      if (type === 'greenhouse') {
        const obj = this.activeMission.objectives.find(o => o.id === 'm2_greenhouse');
        if (obj) obj.isCompleted = true;
      }
    } else if (this.activeMission.id === 3) {
      if (type === 'rad_shelter') {
        const obj = this.activeMission.objectives.find(o => o.id === 'm3_shelter');
        if (obj) obj.isCompleted = true;
      }
    } else if (this.activeMission.id === 4) {
      if (type === 'comm_antenna') {
        const obj = this.activeMission.objectives.find(o => o.id === 'm4_antenna');
        if (obj) obj.isCompleted = true;
      }
      // m4_lab completes when the biosignature sample is actually processed via analyzeBiosignature()
    }
  }

  // Harvest greenhouse crops
  public harvestCrops(): { success: boolean; message: string } {
    if (this.greenhouseCropProgress < 100) {
      return { success: false, message: `Crops still growing (${Math.round(this.greenhouseCropProgress)}%).` };
    }

    this.greenhouseCropProgress = 0;
    const current = this.inventory.get('food_rations') || 0;
    this.inventory.set('food_rations', current + 6);
    this.vitals.food = Math.min(100, this.vitals.food + 25);

    const dsfc = CSA_FOOD_PRODUCTION_RESOURCES[1];
    this.emitBriefOnce({
      id: 'greenhouse_harvested',
      missionId: this.activeMission.id,
      category: 'food_osdr',
      title: 'Fresh Harvest: CSA Deep Space Food Principles',
      explanation:
        'Packaged astronaut rations lose certain vitamins over multi-year missions. Fresh greens grown in hydroponic racks restore nutrition and crew morale while recycling humidity vapor.',
      scientificReference: `${dsfc.sourceName}: ${dsfc.title}`,
      measurementContext: dsfc.measurementContext,
      dataOrigin: 'curated',
      simulatedNote: 'Simulated harvest (+6 rations, +25% food) — not a measured CSA crop yield.'
    });

    return {
      success: true,
      message: 'Harvested +6 Simulated Space Crops (+25% Food) • Informed by CSA Food Toolkit'
    };
  }

  // Analyze Biosignature in Research Lab
  public analyzeBiosignature(): { success: boolean; message: string } {
    const hasLab = this.placedBuildings.some(b => b.type === 'research_lab');
    if (!hasLab) return { success: false, message: 'Construct a Research Laboratory first.' };

    const samples = this.inventory.get('biosignature') || 0;
    if (samples <= 0) return { success: false, message: 'No biosignature geological samples in inventory.' };

    this.inventory.set('biosignature', samples - 1);
    this.sciencePoints += 50;
    this.biosignaturesAnalyzed += 1;

    if (this.activeMission.id === 4) {
      const obj = this.activeMission.objectives.find(o => o.id === 'm4_lab');
      if (obj) obj.isCompleted = true;
    }

    const osdrRef = this.osdrStudies[0];
    const osdrRadRef = this.osdrStudies[1];
    this.emitBriefOnce({
      id: 'osdr_lab_analysis',
      missionId: this.activeMission.id,
      category: 'food_osdr',
      title: `NASA OSDR Research Tie-In (${osdrRef.id} & ${osdrRadRef.id})`,
      explanation: `Real mission laboratories pair geological biosignature searches with spaceflight biology studies like NASA OSDR ${osdrRef.id} (${osdrRef.title}) and ${osdrRadRef.id} to understand how cosmic radiation affects living cells and plants.`,
      scientificReference: `Verified NASA OSDR Studies: ${this.osdrStudies.map(s => s.id).join(', ')}`,
      measurementContext: 'Real NASA Open Science Data Repository Study Metadata',
      dataOrigin: osdrRef.origin,
      simulatedNote: 'Gameplay +50 Science Points and biosignature core extraction are simulated.'
    });

    return {
      success: true,
      message: `Sample analyzed (+50 Science Points) • Linked to NASA OSDR ${osdrRef.id}`
    };
  }

  // Trigger Solar Radiation Storm Event
  public triggerSolarStormEvent(warning: string) {
    this.weatherEvent = {
      isActive: true,
      type: 'solar_storm',
      severity: 'extreme',
      radiationRate: 3.5, // simulated gameplay radiation buffer mSv/sec outside
      timeRemainingSec: 45,
      nasaWarning: warning,
      donkiEventId: this.donkiContext.id,
      dataOrigin: this.donkiContext.origin
    };

    if (this.activeMission.id === 3) {
      const warnObj = this.activeMission.objectives.find(o => o.id === 'm3_warning');
      if (warnObj) warnObj.isCompleted = true;
    }

    this.triggerSpaceWeatherBrief();
  }

  // Sync live/cached Phase 2 NASA & CSA bundle into engine context without breaking offline play
  public applyScienceBundle(bundle: Phase2ScienceBundle) {
    const firstDonki = bundle.observations.find(
      o => o.type === 'cme' || o.type === 'solar_flare' || o.type === 'sep' || o.type === 'geomagnetic'
    );
    if (firstDonki) {
      this.donkiContext = {
        id: firstDonki.id,
        title: firstDonki.title,
        origin: firstDonki.dataOrigin === 'live' ? 'live' : firstDonki.dataOrigin === 'cached' ? 'cached' : 'curated'
      };
    }

    const osdrItems = bundle.observations.filter(o => o.type === 'biology_osdr');
    if (osdrItems.length > 0) {
      this.osdrStudies = osdrItems.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        origin: item.dataOrigin === 'live' ? 'live' : item.dataOrigin === 'cached' ? 'cached' : 'curated'
      }));
    }

    if (Array.isArray(bundle.radlabBaselines) && bundle.radlabBaselines.length > 0) {
      this.radlabBaselines = bundle.radlabBaselines.map(b => ({ ...b }));
    }

    if (Array.isArray(bundle.marsTrekSites) && bundle.marsTrekSites.length > 0) {
      this.marsTrekSiteSummary = bundle.marsTrekSites[0];
    }
  }

  public emitBriefOnce(brief: ScienceFieldBrief) {
    const key = `${this.planet}:${brief.id}`;
    if (this.triggeredBriefKeys.has(key)) return;
    this.triggeredBriefKeys.add(key);
    this.scienceBriefQueue.push(brief);
  }

  public popScienceBrief(): ScienceFieldBrief | null {
    return this.scienceBriefQueue.shift() || null;
  }

  public triggerReconBriefForPlanet(targetPlanet: PlanetType = this.planet) {
    if (targetPlanet === 'mars') {
      this.emitBriefOnce({
        id: 'recon_mars_trek',
        missionId: this.activeMission.id,
        category: 'recon',
        title: `Mars Reconnaissance: ${this.marsTrekSiteSummary.centerCoords.label}`,
        explanation:
          'Mars landing sites like Jezero Crater are selected using NASA Mars Trek orbital mosaics (MRO CTX 6 m/px & HiRISE 25 cm/px) to avoid steep scarps and boulder fields while targeting ancient delta minerals.',
        scientificReference: `NASA Mars Trek (${this.marsTrekSiteSummary.layerId})`,
        measurementContext: 'Mars Orbital Mosaic — Never Applied to Lunar Terrain',
        dataOrigin: this.marsTrekSiteSummary.dataOrigin,
        simulatedNote:
          'The 3D dunes and hills in the playable arena are procedurally simulated for real-time movement.'
      });
    } else {
      this.emitBriefOnce({
        id: 'recon_moon_artemis',
        missionId: this.activeMission.id,
        category: 'recon',
        title: 'Lunar South Pole Reconnaissance (Artemis Context)',
        explanation:
          'Lunar bases target elevated crater rims that receive prolonged sunlight for solar power while remaining near Permanently Shadowed Regions that trap cryogenic water ice.',
        scientificReference: 'NASA LRO Diviner & Artemis Lunar South Pole Science',
        measurementContext: 'Lunar Polar Context (Mars Trek datasets are excluded on Moon)',
        dataOrigin: 'curated',
        simulatedNote:
          'The 3D crater terrain mesh is procedural with NASA lunar surface imagery styling.'
      });
    }
  }

  public triggerSpaceWeatherBrief() {
    const msl = this.radlabBaselines.find(b => b.id === 'RADLAB-MSL-SURFACE');
    const tgo = this.radlabBaselines.find(b => b.id === 'RADLAB-TGO-MARS-ORBIT');
    const lro = this.radlabBaselines.find(b => b.id === 'RADLAB-LRO-MOON-ORBIT');
    const iss = this.radlabBaselines.find(b => b.id === 'RADLAB-ISS-LEO');

    const radComparison =
      this.planet === 'mars'
        ? `Mars Surface (Curiosity RAD): ${msl?.meanDoseRate.toFixed(2)} μGy/hr mean vs Mars Orbit (TGO): ${tgo?.meanDoseRate.toFixed(2)} μGy/hr mean`
        : `Lunar Orbit (LRO CRaTER): ${lro?.meanDoseRate.toFixed(2)} μGy/hr mean (orbital only) vs ISS Earth LEO: ${iss?.meanDoseRate.toFixed(2)} μGy/hr mean`;

    this.emitBriefOnce({
      id: 'space_weather_radlab',
      missionId: this.activeMission.id,
      category: 'space_weather',
      title: 'Space Weather Alert vs Radiation Measurement',
      explanation:
        'NASA DONKI watches solar eruptions (CMEs, flares, SEPs) that trigger space-weather alerts, while NASA RadLab records actual absorbed dose rates (μGy/hour) on spacecraft and rovers. Orbital and surface readings differ significantly.',
      scientificReference: `DONKI Event: ${this.donkiContext.id} | ${radComparison}`,
      measurementContext:
        this.planet === 'moon'
          ? 'Orbital RadLab Baselines Only (No Moon Surface Dataset in Feed)'
          : 'Gale Crater Surface vs Martian Orbit (μGy/hour)',
      dataOrigin: this.donkiContext.origin,
      simulatedNote:
        'Storm duration and exposure damage are simulated training mechanics; DONKI does not measure personal dose.'
    });
  }

  public getScienceSummaryForHud(): {
    reconTitle: string;
    reconDetail: string;
    radlabLine: string;
    donkiLine: string;
    osdrLine: string;
    csaLine: string;
  } {
    const msl = this.radlabBaselines.find(b => b.id === 'RADLAB-MSL-SURFACE');
    const tgo = this.radlabBaselines.find(b => b.id === 'RADLAB-TGO-MARS-ORBIT');
    const lro = this.radlabBaselines.find(b => b.id === 'RADLAB-LRO-MOON-ORBIT');
    const iss = this.radlabBaselines.find(b => b.id === 'RADLAB-ISS-LEO');

    const reconTitle =
      this.planet === 'mars'
        ? `Mars Trek: Jezero (${this.marsTrekSiteSummary.centerCoords.lat.toFixed(2)}°N, ${this.marsTrekSiteSummary.centerCoords.lon.toFixed(2)}°E)`
        : 'Artemis Context: Lunar South Pole Crater Rim';

    const reconDetail =
      this.planet === 'mars'
        ? 'MRO CTX 6 m/px mosaic reference • 3D arena relief is simulated'
        : 'LRO polar ice & sunlight context • 3D arena relief is simulated';

    const radlabLine =
      this.planet === 'mars'
        ? `RadLab Mars Surface: ${msl?.meanDoseRate.toFixed(2)} μGy/hr (Curiosity) vs Orbit ${tgo?.meanDoseRate.toFixed(2)} μGy/hr (TGO)`
        : `RadLab Orbit Only: LRO Moon Orbit ${lro?.meanDoseRate.toFixed(2)} μGy/hr | ISS LEO ${iss?.meanDoseRate.toFixed(2)} μGy/hr (Not Surface)`;

    return {
      reconTitle,
      reconDetail,
      radlabLine,
      donkiLine: `DONKI Event Context (${this.donkiContext.origin.toUpperCase()}): ${this.donkiContext.id} — alerts only, not personal dose`,
      osdrLine: `OSDR Lab Studies: ${this.osdrStudies.map(s => s.id).join(', ')}`,
      csaLine: 'CSA Food Toolkit & Naurvik CEA (In-game crop yields simulated)'
    };
  }

  public recomputeGridState() {
    let genPower = 0;
    let conPower = 0;
    let maxBat = 100;
    let o2Rate = 0;
    let waterRate = 0;

    for (const bld of this.placedBuildings) {
      const bp = BUILDING_BLUEPRINTS[bld.type];
      if (!bp) continue;
      if (bp.powerDelta > 0) {
        const stormPenalty = this.weatherEvent.isActive ? 0.4 : 1.0;
        genPower += bp.powerDelta * stormPenalty;
      } else if (bp.powerDelta < 0) {
        conPower += Math.abs(bp.powerDelta);
      }

      if (bld.type === 'battery') maxBat += 100;
      if (bld.type === 'oxygen_gen') o2Rate += bp.oxygenDelta;
      if (bld.type === 'water_recycler') waterRate += bp.waterDelta;
    }

    this.gridPowerGenerated = Math.round(genPower);
    this.gridPowerConsumed = Math.round(conPower);
    this.maxBatteryCapacity = maxBat;
    this.gridOxygenFlow = o2Rate;
    this.gridWaterFlow = waterRate;
  }

  private checkMissionProgress() {
    const distFromOrigin = Math.sqrt(this.playerX * this.playerX + this.playerZ * this.playerZ);

    if (this.activeMission.id === 1) {
      const expObj = this.activeMission.objectives.find(o => o.id === 'm1_explore');
      if (expObj && !expObj.isCompleted && distFromOrigin >= 35) {
        expObj.isCompleted = true;
        this.triggerReconBriefForPlanet(this.planet);
      }
      const habObj = this.activeMission.objectives.find(o => o.id === 'm1_habitat');
      if (habObj && !habObj.isCompleted && this.placedBuildings.some(b => b.type === 'habitat')) {
        habObj.isCompleted = true;
      }
      const pwrObj = this.activeMission.objectives.find(o => o.id === 'm1_power');
      if (pwrObj && !pwrObj.isCompleted && this.placedBuildings.some(b => b.type === 'solar_panel')) {
        pwrObj.isCompleted = true;
      }
      const oxyObj = this.activeMission.objectives.find(o => o.id === 'm1_oxygen');
      if (oxyObj && !oxyObj.isCompleted && this.placedBuildings.some(b => b.type === 'oxygen_gen')) {
        oxyObj.isCompleted = true;
      }
    } else if (this.activeMission.id === 2) {
      const batObj = this.activeMission.objectives.find(o => o.id === 'm2_battery');
      if (batObj && !batObj.isCompleted && this.placedBuildings.some(b => b.type === 'battery')) {
        batObj.isCompleted = true;
      }
      const watObj = this.activeMission.objectives.find(o => o.id === 'm2_water');
      if (watObj && !watObj.isCompleted && this.placedBuildings.some(b => b.type === 'water_recycler')) {
        watObj.isCompleted = true;
      }
      const ghObj = this.activeMission.objectives.find(o => o.id === 'm2_greenhouse');
      if (ghObj && !ghObj.isCompleted && this.placedBuildings.some(b => b.type === 'greenhouse')) {
        ghObj.isCompleted = true;
      }
      const pwrObj = this.activeMission.objectives.find(o => o.id === 'm2_power_balance');
      if (pwrObj && !pwrObj.isCompleted && this.gridPowerGenerated - this.gridPowerConsumed >= 10) {
        pwrObj.isCompleted = true;
      }
    } else if (this.activeMission.id === 3) {
      const shObj = this.activeMission.objectives.find(o => o.id === 'm3_shelter');
      if (shObj && !shObj.isCompleted && this.placedBuildings.some(b => b.type === 'rad_shelter')) {
        shObj.isCompleted = true;
      }
      if (this.weatherEvent.isActive && this.vitals.isInsideShelter) {
        const retObj = this.activeMission.objectives.find(o => o.id === 'm3_retreat');
        if (retObj) retObj.isCompleted = true;
      }
    } else if (this.activeMission.id === 4) {
      this.ensureBiosignatureNodeAvailable();

      const antObj = this.activeMission.objectives.find(o => o.id === 'm4_antenna');
      if (antObj && !antObj.isCompleted && this.placedBuildings.some(b => b.type === 'comm_antenna')) {
        antObj.isCompleted = true;
      }
      // Near biosignature outcrop
      const bioObj = this.activeMission.objectives.find(o => o.id === 'm4_expedition');
      if (bioObj && !bioObj.isCompleted) {
        const distToBio = Math.sqrt(Math.pow(this.playerX - 65, 2) + Math.pow(this.playerZ - 55, 2));
        if (distToBio <= 8) bioObj.isCompleted = true;
      }
      // Prevent softlock if player collected biosignature sample earlier
      const sampObj = this.activeMission.objectives.find(o => o.id === 'm4_sample');
      if (
        sampObj &&
        !sampObj.isCompleted &&
        ((this.inventory.get('biosignature') || 0) > 0 || this.biosignaturesAnalyzed > 0 || this.sciencePoints >= 50)
      ) {
        sampObj.isCompleted = true;
      }
      // Sync research lab objective if lab exists and sample was processed
      const labObj = this.activeMission.objectives.find(o => o.id === 'm4_lab');
      if (
        labObj &&
        !labObj.isCompleted &&
        this.biosignaturesAnalyzed > 0 &&
        this.placedBuildings.some(b => b.type === 'research_lab')
      ) {
        labObj.isCompleted = true;
      }
      const susObj = this.activeMission.objectives.find(o => o.id === 'm4_sustain');
      if (susObj && !susObj.isCompleted && this.vitals.oxygen >= 50 && this.vitals.water >= 50 && this.vitals.food >= 50) {
        susObj.isCompleted = true;
      }
    }

    if (this.isMissionCompleted()) {
      if (!this.completedMissionIds.includes(this.activeMission.id)) {
        this.completedMissionIds.push(this.activeMission.id);
      }
      if (!this.earnedBadges.includes(this.activeMission.badgeId)) {
        this.earnedBadges.push(this.activeMission.badgeId);
      }
    }
  }

  public isMissionCompleted(): boolean {
    return this.activeMission.objectives.every(o => o.isCompleted);
  }

  public advanceToNextMission(): boolean {
    if (this.currentMissionIndex + 1 < CAMPAIGN_MISSIONS.length) {
      this.currentMissionIndex += 1;
      this.activeMission = JSON.parse(JSON.stringify(CAMPAIGN_MISSIONS[this.currentMissionIndex]));
      if (this.activeMission.id === 3) {
        this.pendingStormDelaySec = 8;
        this.pendingStormWarning =
          `SIMULATED DRILL (Ref: NASA DONKI ${this.donkiContext.id}): Solar eruption shock front approaching — seek Radiation Shelter!`;
        this.triggerSpaceWeatherBrief();
      } else {
        this.pendingStormDelaySec = null;
        this.weatherEvent.isActive = false;
      }
      if (this.activeMission.id === 4) {
        this.ensureBiosignatureNodeAvailable();
      }
      this.checkMissionProgress();
      return true;
    }
    return false;
  }

  public setMission(missionIndex: number) {
    this.currentMissionIndex = Math.max(0, Math.min(CAMPAIGN_MISSIONS.length - 1, missionIndex));
    this.activeMission = JSON.parse(JSON.stringify(CAMPAIGN_MISSIONS[this.currentMissionIndex]));
    if (this.activeMission.id === 3) {
      this.pendingStormDelaySec = 8;
      this.pendingStormWarning =
        `SIMULATED DRILL (Ref: NASA DONKI ${this.donkiContext.id}): Solar eruption alert — enter Radiation Shelter!`;
      this.triggerSpaceWeatherBrief();
    } else {
      this.pendingStormDelaySec = null;
      this.weatherEvent.isActive = false;
    }
    if (this.activeMission.id === 4) {
      this.ensureBiosignatureNodeAvailable();
    }
    this.checkMissionProgress();
  }

  private triggerGameOver(reason: string) {
    this.isGameOver = true;
    this.gameOverReason = reason;
  }

  public respawn() {
    this.isGameOver = false;
    this.gameOverReason = '';
    this.vitals.health = 100;
    this.vitals.oxygen = 100;
    this.vitals.energy = 100;
    this.vitals.water = 80;
    this.vitals.food = 80;
    this.playerX = 0;
    this.playerZ = 0;
    this.playerRotation = 0;
  }

  public exportSnapshot(
    profile: { callsign: string; avatar: string },
    tutorialDismissed = false
  ): SaveGameV1 {
    const nowMs = Date.now();
    const invRecord: Record<string, number> = {};
    this.inventory.forEach((count, key) => {
      invRecord[key] = Math.max(0, Math.floor(count));
    });

    return {
      version: SAVE_VERSION,
      savedAt: new Date(nowMs).toISOString(),
      savedAtMs: nowMs,
      profile: {
        callsign: profile.callsign || 'Eagle-1',
        avatar: profile.avatar || '👩‍🚀'
      },
      planet: this.planet,
      player: {
        x: this.playerX,
        y: this.playerY,
        z: this.playerZ,
        rotation: this.playerRotation
      },
      vitals: { ...this.vitals },
      inventory: invRecord,
      placedBuildings: this.placedBuildings.map(b => ({ ...b })),
      resourceNodes: this.resourceNodes.map(n => ({ ...n })),
      progression: {
        currentMissionIndex: this.currentMissionIndex,
        activeMission: {
          ...this.activeMission,
          objectives: this.activeMission.objectives.map(o => ({ ...o }))
        },
        completedMissionIds: [...this.completedMissionIds],
        earnedBadges: [...this.earnedBadges],
        sciencePoints: this.sciencePoints,
        greenhouseCropProgress: this.greenhouseCropProgress,
        biosignaturesAnalyzed: this.biosignaturesAnalyzed,
        triggeredBriefKeys: Array.from(this.triggeredBriefKeys),
        tutorialDismissed
      },
      simulation: {
        gridBatteryCharge: this.gridBatteryCharge,
        maxBatteryCapacity: this.maxBatteryCapacity,
        weatherEvent: { ...this.weatherEvent },
        pendingStormDelaySec: this.pendingStormDelaySec
      }
    };
  }

  public static fromSave(save: SaveGameV1): GameEngine {
    const engine = new GameEngine(save.planet);
    engine.restoreFromSave(save);
    return engine;
  }

  public restoreFromSave(save: SaveGameV1) {
    this.planet = save.planet;
    this.playerX = save.player.x;
    this.playerY = save.player.y;
    this.playerZ = save.player.z;
    this.playerRotation = save.player.rotation;

    this.vitals = { ...save.vitals };
    this.isGameOver = false;
    this.gameOverReason = '';

    this.inventory = new Map(Object.entries(save.inventory));
    this.placedBuildings = save.placedBuildings.map(b => ({ ...b }));
    if (save.resourceNodes.length > 0) {
      this.resourceNodes = save.resourceNodes.map(n => ({ ...n }));
    } else {
      this.spawnResourceNodes();
    }

    const missionIdx = Math.max(0, Math.min(CAMPAIGN_MISSIONS.length - 1, save.progression.currentMissionIndex));
    this.currentMissionIndex = missionIdx;
    const baseMission: CampaignMission = JSON.parse(JSON.stringify(CAMPAIGN_MISSIONS[missionIdx]));
    const savedObjById = new Map(save.progression.activeMission.objectives.map(o => [o.id, o]));
    baseMission.objectives = baseMission.objectives.map(obj => {
      const savedObj = savedObjById.get(obj.id);
      if (!savedObj) return obj;
      return {
        ...obj,
        isCompleted: Boolean(savedObj.isCompleted),
        ...(savedObj.current !== undefined ? { current: savedObj.current } : {})
      };
    });
    this.activeMission = baseMission;

    this.completedMissionIds = [...save.progression.completedMissionIds];
    this.earnedBadges = [...save.progression.earnedBadges];
    this.sciencePoints = save.progression.sciencePoints;
    this.greenhouseCropProgress = save.progression.greenhouseCropProgress;
    this.biosignaturesAnalyzed = save.progression.biosignaturesAnalyzed;
    this.triggeredBriefKeys = new Set(save.progression.triggeredBriefKeys);
    this.scienceBriefQueue = [];

    this.gridBatteryCharge = save.simulation.gridBatteryCharge;
    this.maxBatteryCapacity = save.simulation.maxBatteryCapacity;
    this.weatherEvent = { ...save.simulation.weatherEvent };
    this.pendingStormDelaySec = save.simulation.pendingStormDelaySec;

    this.recomputeGridState();
    this.vitals.isInsideShelter = this.checkInsideShelter();
    if (this.activeMission.id === 4) {
      this.ensureBiosignatureNodeAvailable();
    }
    this.checkMissionProgress();
  }
}
