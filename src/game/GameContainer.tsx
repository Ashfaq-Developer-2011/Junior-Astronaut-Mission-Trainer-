import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BuildingType, PlacedBuilding, PlanetType, ScienceFieldBrief } from '../types/survival';
import { GameEngine } from './simulation/GameEngine';
import { R3FWorld, VirtualInputState } from './R3FWorld';
import { GameHUD } from './ui/GameHUD';
import { BuildMenu } from './ui/BuildMenu';
import { InventoryModal } from './ui/InventoryModal';
import { PauseModal } from './ui/PauseModal';
import { MissionVictoryModal } from './ui/MissionVictoryModal';
import { NasaScienceDrawer } from '../components/NasaScienceDrawer';
import { LoadingScreen } from '../components/LoadingScreen';
import { CustomModelModal } from '../components/CustomModelModal';
import { InteractiveTutorial } from '../components/InteractiveTutorial';
import { MobileOrientationGate } from '../components/MobileOrientationGate';
import { CameraOrbitDelta } from './components/ThirdPersonCamera';
import {
  fetchPhase2ScienceBundle,
  Phase2ScienceBundle,
  VERIFIED_NASA_ARCHIVE
} from '../services/nasaData';
import { sound } from '../services/audio';
import { getPlanetTerrainHeight } from './three/PlanetaryTerrain';
import {
  SaveGameV1,
  saveGameToStorage,
  writeSyncRecoveryMirror
} from '../services/saveSystem';

export interface GameContainerProps {
  initialPlanet?: PlanetType;
  callsign?: string;
  avatar?: string;
  initialSave?: SaveGameV1 | null;
  onExitToHome?: () => void;
  initialScienceBundle?: Phase2ScienceBundle | null;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  initialPlanet = 'moon',
  callsign = 'Eagle-1',
  avatar = '👩‍🚀',
  initialSave = null,
  onExitToHome,
  initialScienceBundle = null
}) => {
  // Core Game Simulation Engine (lazily instantiated once; restored cleanly from IndexedDB save if present)
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = initialSave
      ? GameEngine.fromSave(initialSave)
      : new GameEngine(initialPlanet);
  }
  const initialEngine = engineRef.current;

  const hudSyncTimerRef = useRef(0);
  const victoryShownForMissionRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const prevCompletedCountRef = useRef<number>(
    initialEngine.activeMission.objectives.filter(o => o.isCompleted).length
  );
  const prevMissionIdRef = useRef<number>(initialEngine.activeMission.id);
  const virtualInputRef = useRef<VirtualInputState>({
    moveX: 0,
    moveY: 0,
    jump: false,
    sprint: false,
    interact: false
  });
  const cameraOrbitDeltaRef = useRef<CameraOrbitDelta>({
    yawDelta: 0,
    pitchDelta: 0
  });

  // Reactive UI States
  const [vitals, setVitals] = useState(initialEngine.vitals);
  const [activeMission, setActiveMission] = useState(initialEngine.activeMission);
  const [gridPower, setGridPower] = useState({
    generated: initialEngine.gridPowerGenerated,
    consumed: initialEngine.gridPowerConsumed,
    battery: initialEngine.gridBatteryCharge,
    maxBattery: initialEngine.maxBatteryCapacity
  });
  const [sciencePoints, setSciencePoints] = useState(initialEngine.sciencePoints);
  const [interactPrompt, setInteractPrompt] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ text: string; tone?: 'info' | 'success' | 'warning' } | null>(null);
  const [weatherEvent, setWeatherEvent] = useState(initialEngine.weatherEvent);
  const [planet, setPlanet] = useState<PlanetType>(initialEngine.planet);
  const [isGameOver, setIsGameOver] = useState(false);
  const [spawnToken, setSpawnToken] = useState(0);
  const [spawnPose, setSpawnPose] = useState<{ pos: [number, number, number]; rot: number }>(() => ({
    pos: [
      initialEngine.playerX,
      getPlanetTerrainHeight(initialEngine.planet, initialEngine.playerX, initialEngine.playerZ),
      initialEngine.playerZ
    ],
    rot: initialEngine.playerRotation
  }));

  // Save State Indicators & Concise First-Time Guide
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    initialSave ? 'saved' : 'idle'
  );
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialSave?.savedAt || null);
  const [tutorialDismissed, setTutorialDismissed] = useState<boolean>(
    Boolean(initialSave?.progression.tutorialDismissed)
  );
  const [showQuickGuide, setShowQuickGuide] = useState<boolean>(
    !initialSave?.progression.tutorialDismissed && !initialSave
  );

  // World synchronization states
  const [resourceNodes, setResourceNodes] = useState(initialEngine.resourceNodes);
  const [placedBuildings, setPlacedBuildings] = useState(initialEngine.placedBuildings);

  // Modals & Build Mode
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showScience, setShowScience] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [isTransiting, setIsTransiting] = useState(false);
  const [showCustomModels, setShowCustomModels] = useState(false);
  const [activeBuildType, setActiveBuildType] = useState<BuildingType | null>(null);

  // NASA & CSA Open Science data
  const [scienceBundle, setScienceBundle] = useState<Phase2ScienceBundle | null>(initialScienceBundle);
  const [nasaObservations, setNasaObservations] = useState(
    initialScienceBundle?.observations || VERIFIED_NASA_ARCHIVE
  );
  const [isNasaLive, setIsNasaLive] = useState(Boolean(initialScienceBundle?.isLive));
  const [isScienceRefreshing, setIsScienceRefreshing] = useState(false);
  const [scienceError, setScienceError] = useState<string | null>(null);
  const [activeScienceBrief, setActiveScienceBrief] = useState<ScienceFieldBrief | null>(null);

  // Mobile detection & orientation state
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [dismissedPortraitGate, setDismissedPortraitGate] = useState(false);
  const [mobileSprintActive, setMobileSprintActive] = useState(false);
  const [showTutorialOverlay, setShowTutorialOverlay] = useState(false);

  const showOrientationGate = isMobile && isPortrait && !dismissedPortraitGate;

  const isAnyModalOpen =
    showPause ||
    showBuildMenu ||
    showInventory ||
    showScience ||
    showVictory ||
    showCustomModels ||
    showTutorialOverlay ||
    showOrientationGate ||
    isTransiting ||
    isGameOver;

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.isPaused = isAnyModalOpen;
  }, [isAnyModalOpen]);

  const showFeedbackToast = useCallback((text: string, tone: 'info' | 'success' | 'warning' = 'info') => {
    setActionFeedback({ text, tone });
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setActionFeedback(null);
    }, 2600);
  }, []);

  const persistCheckpoint = useCallback(
    async (tutorialFlagOverride?: boolean) => {
      const engine = engineRef.current;
      if (!engine || engine.isGameOver) return;
      setSaveStatus('saving');
      const snapshot = engine.exportSnapshot(
        { callsign, avatar },
        tutorialFlagOverride ?? tutorialDismissed
      );
      const result = await saveGameToStorage(snapshot);
      if (result.ok) {
        setSaveStatus('saved');
        setLastSavedAt(result.savedAt);
      } else {
        setSaveStatus('error');
      }
    },
    [avatar, callsign, tutorialDismissed]
  );

  const persistCheckpointSyncOnly = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || engine.isGameOver) return;
    const snapshot = engine.exportSnapshot({ callsign, avatar }, tutorialDismissed);
    writeSyncRecoveryMirror(snapshot);
    void saveGameToStorage(snapshot);
  }, [avatar, callsign, tutorialDismissed]);

  const computeInteractPrompt = useCallback((engine: GameEngine): string | null => {
    for (const node of engine.resourceNodes) {
      const dx = engine.playerX - node.x;
      const dz = engine.playerZ - node.z;
      if (dx * dx + dz * dz <= 4.5 * 4.5) {
        return `Click or Press [E] to Mine ${node.name}`;
      }
    }

    const bioSamples = engine.inventory.get('biosignature') || 0;
    for (const bld of engine.placedBuildings) {
      const dx = engine.playerX - bld.x;
      const dz = engine.playerZ - bld.z;
      if (dx * dx + dz * dz <= 6.5 * 6.5) {
        if (bld.type === 'research_lab' && bioSamples > 0) {
          return 'Click Lab or Press [E] to Analyze Biosignature Sample';
        }
        if (bld.type === 'greenhouse' && engine.greenhouseCropProgress >= 100) {
          return 'Click Greenhouse or Press [E] to Harvest Fresh Hydroponic Crops';
        }
      }
    }
    return null;
  }, []);

  const syncHudFromEngine = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    setVitals({ ...engine.vitals });
    setActiveMission({
      ...engine.activeMission,
      objectives: engine.activeMission.objectives.map(o => ({ ...o }))
    });
    setGridPower({
      generated: engine.gridPowerGenerated,
      consumed: engine.gridPowerConsumed,
      battery: engine.gridBatteryCharge,
      maxBattery: engine.maxBatteryCapacity
    });
    setSciencePoints(engine.sciencePoints);
    setWeatherEvent({ ...engine.weatherEvent });
    setIsGameOver(engine.isGameOver);
    setResourceNodes([...engine.resourceNodes]);
    setPlacedBuildings([...engine.placedBuildings]);

    const nextPrompt = computeInteractPrompt(engine);
    setInteractPrompt(prev => (prev === nextPrompt ? prev : nextPrompt));

    const nextBrief = engine.popScienceBrief();
    if (nextBrief) {
      setActiveScienceBrief(nextBrief);
    }

    // Detect objective completions at checkpoint boundaries
    const completedCount = engine.activeMission.objectives.filter(o => o.isCompleted).length;
    if (
      engine.activeMission.id === prevMissionIdRef.current &&
      completedCount > prevCompletedCountRef.current
    ) {
      prevCompletedCountRef.current = completedCount;
      void persistCheckpoint();
    } else if (engine.activeMission.id !== prevMissionIdRef.current) {
      prevMissionIdRef.current = engine.activeMission.id;
      prevCompletedCountRef.current = completedCount;
    }

    if (engine.isMissionCompleted() && victoryShownForMissionRef.current !== engine.activeMission.id) {
      victoryShownForMissionRef.current = engine.activeMission.id;
      setShowVictory(true);
      void persistCheckpoint();
    }
  }, [computeInteractPrompt, persistCheckpoint]);

  const refreshScienceData = useCallback(async (liveRadLab = false) => {
    setIsScienceRefreshing(true);
    setScienceError(null);
    try {
      const bundle = await fetchPhase2ScienceBundle({ liveRadLab });
      engineRef.current?.applyScienceBundle(bundle);
      setScienceBundle(bundle);
      setNasaObservations(bundle.observations);
      setIsNasaLive(bundle.isLive);
    } catch {
      setScienceError('Unable to reach local NASA/CSA proxy service.');
    } finally {
      setIsScienceRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const updateViewportFlags = () => {
      const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
      const touchCapable = coarse || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const smallViewport = Math.min(window.innerWidth, window.innerHeight) <= 950;
      setIsMobile(touchCapable && smallViewport);

      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
      if (!portrait) {
        setDismissedPortraitGate(false);
      }
    };

    updateViewportFlags();
    window.addEventListener('resize', updateViewportFlags);
    window.addEventListener('orientationchange', updateViewportFlags);

    const engine = engineRef.current!;

    if (initialScienceBundle) {
      engine.applyScienceBundle(initialScienceBundle);
    } else {
      void refreshScienceData(false);
    }

    if (!initialSave) {
      engine.triggerReconBriefForPlanet(engine.planet);
      const initialBrief = engine.popScienceBrief();
      if (initialBrief) {
        setActiveScienceBrief(initialBrief);
      }
      // Establish immediate initial save checkpoint for brand-new launch
      void persistCheckpoint();
    }

    return () => {
      window.removeEventListener('resize', updateViewportFlags);
      window.removeEventListener('orientationchange', updateViewportFlags);
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
    // Run once per session launch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodic safe autosave (15s) + Page Visibility API & pagehide instant recovery
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!isAnyModalOpen && !engineRef.current?.isGameOver) {
        void persistCheckpoint();
      }
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        persistCheckpointSyncOnly();
      }
    };
    const handlePageHide = () => {
      persistCheckpointSyncOnly();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isAnyModalOpen, persistCheckpoint, persistCheckpointSyncOnly]);

  useEffect(() => {
    // Keyboard shortcuts for HUD
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'KeyB') {
        setShowBuildMenu(prev => !prev);
      } else if (e.code === 'KeyI') {
        setShowInventory(prev => !prev);
      } else if (e.code === 'Escape') {
        if (activeBuildType) {
          setActiveBuildType(null);
        } else {
          setShowPause(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBuildType]);

  // Memoized planet-aware terrain height formula synced across terrain, player physics, buildings & rocks
  const getTerrainHeight = useCallback(
    (x: number, z: number): number => getPlanetTerrainHeight(planet, x, z),
    [planet]
  );

  // Callback when avatar updates in R3F scene (runs at frame rate; syncs HUD at ~10 Hz)
  const handlePlayerMove = useCallback((
    delta: number,
    pos: [number, number, number],
    rotation: number,
    isMoving: boolean,
    isSprinting: boolean,
    _isJumping: boolean
  ) => {
    const engine = engineRef.current!;
    engine.playerX = pos[0];
    engine.playerY = pos[1];
    engine.playerZ = pos[2];
    engine.playerRotation = rotation;

    engine.update(delta, isMoving, isSprinting);

    hudSyncTimerRef.current += delta;
    const shouldFlushNow =
      hudSyncTimerRef.current >= 0.1 ||
      engine.isGameOver ||
      (engine.isMissionCompleted() && victoryShownForMissionRef.current !== engine.activeMission.id);

    if (shouldFlushNow) {
      hudSyncTimerRef.current = 0;
      syncHudFromEngine();
    }
  }, [syncHudFromEngine]);

  // Mouse Click Structure Placement Handler
  const handlePlaceBuildingAtCoords = useCallback((type: BuildingType, x: number, z: number) => {
    const engine = engineRef.current!;
    if (!engine.canAffordBuilding(type)) {
      sound.playWarning();
      showFeedbackToast('Insufficient resources to construct module.', 'warning');
      return;
    }

    const res = engine.placeBuilding(type, x, z, 0);
    if (res.success) {
      sound.playSuccess();
      setPlacedBuildings([...engine.placedBuildings]);
      setActiveBuildType(null);
      showFeedbackToast(res.message, 'success');
      syncHudFromEngine();
      void persistCheckpoint();
    }
  }, [persistCheckpoint, showFeedbackToast, syncHudFromEngine]);

  // Click Mining Node Handler
  const handleMineNodeClick = useCallback((nodeId: string) => {
    const engine = engineRef.current!;
    const res = engine.mineNode(nodeId);
    if (res.success) {
      sound.playBeep();
      setResourceNodes([...engine.resourceNodes]);
      showFeedbackToast(res.message, 'success');
      syncHudFromEngine();
      void persistCheckpoint();
    } else {
      sound.playWarning();
      showFeedbackToast(res.message, 'warning');
    }
  }, [persistCheckpoint, showFeedbackToast, syncHudFromEngine]);

  // Contextual [E] Key / USE Interaction Handler
  const handleInteractAction = useCallback(() => {
    const engine = engineRef.current!;
    if (engine.isPaused || engine.isGameOver) return;

    // 1. Closest resource node within range
    let closestNodeId: string | null = null;
    let closestDistSq = 4.5 * 4.5;
    for (const node of engine.resourceNodes) {
      const dx = engine.playerX - node.x;
      const dz = engine.playerZ - node.z;
      const dSq = dx * dx + dz * dz;
      if (dSq <= closestDistSq) {
        closestDistSq = dSq;
        closestNodeId = node.id;
      }
    }
    if (closestNodeId) {
      handleMineNodeClick(closestNodeId);
      return;
    }

    // 2. Nearby interactive buildings (Research Lab or Greenhouse)
    for (const bld of engine.placedBuildings) {
      const dx = engine.playerX - bld.x;
      const dz = engine.playerZ - bld.z;
      if (dx * dx + dz * dz <= 6.5 * 6.5) {
        if (bld.type === 'research_lab') {
          const res = engine.analyzeBiosignature();
          if (res.success) {
            sound.playFanfare();
            showFeedbackToast(res.message, 'success');
            syncHudFromEngine();
            void persistCheckpoint();
          } else {
            sound.playWarning();
            showFeedbackToast(res.message, 'warning');
          }
          return;
        }
        if (bld.type === 'greenhouse') {
          const res = engine.harvestCrops();
          if (res.success) {
            sound.playSuccess();
            showFeedbackToast(res.message, 'success');
            syncHudFromEngine();
            void persistCheckpoint();
          } else {
            sound.playBeep();
            showFeedbackToast(res.message, 'info');
          }
          return;
        }
      }
    }
  }, [handleMineNodeClick, persistCheckpoint, showFeedbackToast, syncHudFromEngine]);

  // Click handler for interactive placed buildings
  const handleBuildingClick = useCallback((building: PlacedBuilding) => {
    const engine = engineRef.current!;
    const dx = engine.playerX - building.x;
    const dz = engine.playerZ - building.z;
    if (dx * dx + dz * dz > 7.5 * 7.5) {
      sound.playWarning();
      showFeedbackToast('Move closer to the module to interact.', 'warning');
      return;
    }

    if (building.type === 'research_lab') {
      const res = engine.analyzeBiosignature();
      if (res.success) {
        sound.playFanfare();
        showFeedbackToast(res.message, 'success');
        syncHudFromEngine();
        void persistCheckpoint();
      } else {
        sound.playWarning();
        showFeedbackToast(res.message, 'warning');
      }
    } else if (building.type === 'greenhouse') {
      const res = engine.harvestCrops();
      if (res.success) {
        sound.playSuccess();
        showFeedbackToast(res.message, 'success');
        syncHudFromEngine();
        void persistCheckpoint();
      } else {
        sound.playBeep();
        showFeedbackToast(res.message, 'info');
      }
    }
  }, [persistCheckpoint, showFeedbackToast, syncHudFromEngine]);

  // Mobile virtual input callbacks
  const handleVirtualMove = useCallback((x: number, y: number) => {
    virtualInputRef.current.moveX = x;
    virtualInputRef.current.moveY = y;
  }, []);

  const handleVirtualOrbit = useCallback((yawDelta: number, pitchDelta: number) => {
    cameraOrbitDeltaRef.current.yawDelta += yawDelta;
    cameraOrbitDeltaRef.current.pitchDelta += pitchDelta;
  }, []);

  const handleVirtualAction = useCallback((action: 'jump' | 'interact' | 'sprint', active: boolean) => {
    virtualInputRef.current[action] = active;
  }, []);

  const handleToggleMobileSprint = useCallback(() => {
    setMobileSprintActive((prev) => {
      const next = !prev;
      virtualInputRef.current.sprint = next;
      return next;
    });
  }, []);

  // Switch Planet (Moon vs Mars) with Transit Loading Screen
  const handleSwitchPlanet = (newPlanet: PlanetType) => {
    const engine = engineRef.current!;
    setIsTransiting(true);
    setPlanet(newPlanet);
    engine.planet = newPlanet;
    engine.playerX = 0;
    engine.playerZ = 0;
    engine.playerRotation = 0;
    engine.spawnResourceNodes();
    engine.triggerReconBriefForPlanet(newPlanet);
    setSpawnPose({
      pos: [0, getPlanetTerrainHeight(newPlanet, 0, 0), 0],
      rot: 0
    });
    setResourceNodes([...engine.resourceNodes]);
    setPlacedBuildings([...engine.placedBuildings]);
    setSpawnToken(prev => prev + 1);
    syncHudFromEngine();
    void persistCheckpoint();
  };

  // Select blueprint from Build Menu
  const handleSelectBlueprint = (type: BuildingType) => {
    setActiveBuildType(type);
    sound.playSuccess();
  };

  // Eat Food Ration
  const handleEatFood = () => {
    const engine = engineRef.current!;
    const inv = engine.inventory;
    const current = inv.get('food_rations') || 0;
    if (current > 0) {
      inv.set('food_rations', current - 1);
      engine.vitals.food = Math.min(100, engine.vitals.food + 25);
      syncHudFromEngine();
      void persistCheckpoint();
    }
  };

  // Melt Ice to Water
  const handleMeltIce = () => {
    const engine = engineRef.current!;
    const inv = engine.inventory;
    const current = inv.get('ice') || 0;
    if (current >= 2) {
      inv.set('ice', current - 2);
      engine.vitals.water = Math.min(100, engine.vitals.water + 25);
      syncHudFromEngine();
      void persistCheckpoint();
    }
  };

  // Advance Campaign Mission
  const handleNextMission = () => {
    const engine = engineRef.current!;
    const advanced = engine.advanceToNextMission();
    if (advanced) {
      victoryShownForMissionRef.current = null;
      prevMissionIdRef.current = engine.activeMission.id;
      prevCompletedCountRef.current = engine.activeMission.objectives.filter(o => o.isCompleted).length;
      setShowVictory(false);
      syncHudFromEngine();
      void persistCheckpoint();
    }
  };

  const handleExitWithSave = () => {
    persistCheckpointSyncOnly();
    onExitToHome?.();
  };

  const engine = engineRef.current!;
  const canAffordBuild = activeBuildType ? engine.canAffordBuilding(activeBuildType) : false;
  let cargoCount = 0;
  engine.inventory.forEach(qty => {
    cargoCount += qty;
  });
  const scienceSummary = useMemo(() => {
    // Recompute summary cleanly only when planet or loaded scienceBundle changes
    void scienceBundle;
    return engineRef.current!.getScienceSummaryForHud();
  }, [planet, scienceBundle]);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#111820] select-none gameplay-surface">
      {/* 3D React Three Fiber (R3F) World */}
      <R3FWorld
        planet={planet}
        playerPos={spawnPose.pos}
        playerRotation={spawnPose.rot}
        spawnToken={spawnToken}
        isPaused={isAnyModalOpen}
        virtualInputRef={virtualInputRef}
        cameraOrbitDeltaRef={cameraOrbitDeltaRef}
        onPlayerMove={handlePlayerMove}
        onInteract={handleInteractAction}
        onBuildingClick={handleBuildingClick}
        resourceNodes={resourceNodes}
        placedBuildings={placedBuildings}
        activeBuildType={activeBuildType}
        canAffordBuild={canAffordBuild}
        onPlaceBuildingAtCoords={handlePlaceBuildingAtCoords}
        onMineNodeClick={handleMineNodeClick}
        isStormActive={weatherEvent.isActive}
        getTerrainHeight={getTerrainHeight}
      />

      {/* Hologram Building Placement Banner */}
      {activeBuildType && (
        <div className="absolute top-14 sm:top-20 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#19232D]/95 border border-[#78A9C8] text-[#F0F2F3] text-xs sm:text-sm flex items-center gap-2.5 max-w-[92vw]">
          <span className="font-semibold text-[#78A9C8] shrink-0">Construction</span>
          <span className="text-[#AAB5BE] truncate">
            {isMobile ? 'Tap flat ground to place' : 'Click flat terrain to place module'}
          </span>
          <button
            type="button"
            onClick={() => setActiveBuildType(null)}
            className="px-2.5 py-1 rounded bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#F0F2F3] font-mono-tech text-xs transition-colors shrink-0"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Heads-Up Display (HUD) */}
      <GameHUD
        vitals={vitals}
        activeMission={activeMission}
        gridPower={gridPower}
        sciencePoints={sciencePoints}
        cargoCount={cargoCount}
        interactPrompt={interactPrompt}
        actionFeedback={actionFeedback}
        weatherEvent={weatherEvent}
        planet={planet}
        activeScienceBrief={activeScienceBrief}
        onDismissScienceBrief={() => setActiveScienceBrief(null)}
        scienceSummary={scienceSummary}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        showQuickGuide={showQuickGuide}
        onDismissQuickGuide={() => {
          setShowQuickGuide(false);
          setTutorialDismissed(true);
          void persistCheckpoint(true);
        }}
        onOpenBuild={() => setShowBuildMenu(true)}
        onOpenInventory={() => setShowInventory(true)}
        onOpenScience={() => setShowScience(true)}
        onOpenPause={() => {
          setShowPause(true);
          void persistCheckpoint();
        }}
        isMobileTouch={isMobile}
        isBuildPlacementActive={Boolean(activeBuildType)}
        mobileSprintActive={mobileSprintActive}
        onToggleMobileSprint={handleToggleMobileSprint}
        onVirtualMove={handleVirtualMove}
        onVirtualOrbit={handleVirtualOrbit}
        onVirtualAction={handleVirtualAction}
      />

      {/* Base Building Blueprint Menu */}
      <BuildMenu
        isOpen={showBuildMenu}
        onClose={() => setShowBuildMenu(false)}
        inventory={engine.inventory}
        onSelectBlueprint={handleSelectBlueprint}
      />

      {/* Cargo Backpack Inventory Modal */}
      <InventoryModal
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        inventory={engine.inventory}
        onEatFood={handleEatFood}
        onMeltIce={handleMeltIce}
        vitals={vitals}
      />

      {/* NASA & CSA Science Open Telemetry Terminal */}
      <NasaScienceDrawer
        isOpen={showScience}
        onClose={() => setShowScience(false)}
        observations={nasaObservations}
        isLive={isNasaLive}
        onRefresh={() => {
          void refreshScienceData(true);
        }}
        isRefreshing={isScienceRefreshing}
        bundle={scienceBundle}
        errorMessage={scienceError}
      />

      {/* Pause & Settings Menu */}
      <PauseModal
        isOpen={showPause}
        onClose={() => setShowPause(false)}
        planet={planet}
        onSwitchPlanet={handleSwitchPlanet}
        currentMissionIndex={engine.currentMissionIndex}
        onSelectMission={(idx) => {
          engine.setMission(idx);
          victoryShownForMissionRef.current = null;
          prevMissionIdRef.current = engine.activeMission.id;
          prevCompletedCountRef.current = engine.activeMission.objectives.filter(o => o.isCompleted).length;
          setShowVictory(false);
          setShowPause(false);
          syncHudFromEngine();
          void persistCheckpoint();
        }}
        onRespawn={() => {
          engine.respawn();
          setSpawnPose({
            pos: [0, getPlanetTerrainHeight(planet, 0, 0), 0],
            rot: 0
          });
          setSpawnToken(prev => prev + 1);
          syncHudFromEngine();
          void persistCheckpoint();
        }}
        onExitHome={onExitToHome ? handleExitWithSave : undefined}
        onOpenTutorial={() => {
          setShowPause(false);
          setShowTutorialOverlay(true);
        }}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        batteryPct={Math.round((gridPower.battery / gridPower.maxBattery) * 100)}
        sciencePoints={sciencePoints}
        onSaveNow={() => {
          void persistCheckpoint();
          showFeedbackToast('Outpost checkpoint saved.', 'success');
        }}
      />

      {/* Mission Victory Celebration Modal */}
      <MissionVictoryModal
        isOpen={showVictory}
        onClose={() => setShowVictory(false)}
        mission={activeMission}
        onNextMission={handleNextMission}
        hasNextMission={engine.currentMissionIndex < 3}
      />

      {/* Game Over Screen */}
      {isGameOver && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mission Critical Failure"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1016]/85 select-none"
        >
          <div className="w-full max-w-md p-6 rounded-lg bg-[#19232D] border border-[#C97979]/80 text-left">
            <div className="text-xs font-mono-tech text-[#C97979] mb-1">
              Life-Support Telemetry Alert
            </div>
            <h2 className="text-xl font-semibold text-[#F0F2F3] mb-2">
              Mission Critical Failure
            </h2>
            <p className="text-sm text-[#F0F2F3] mb-3">{engine.gameOverReason}</p>
            <p className="text-xs text-[#AAB5BE] leading-relaxed mb-6">
              Monitor suit oxygen reserves and enter radiation-shielded habitat modules before space weather events peak.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#35434E]">
              {onExitToHome && (
                <button
                  type="button"
                  onClick={handleExitWithSave}
                  className="px-4 py-2.5 min-h-[42px] rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#F0F2F3] font-medium text-xs sm:text-sm transition-colors"
                >
                  Home Menu
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  engine.respawn();
                  setSpawnPose({
                    pos: [0, getPlanetTerrainHeight(planet, 0, 0), 0],
                    rot: 0
                  });
                  setSpawnToken(prev => prev + 1);
                  syncHudFromEngine();
                  void persistCheckpoint();
                }}
                className="px-5 py-2.5 min-h-[42px] rounded-lg bg-[#78A9C8] hover:bg-[#8BB8D4] text-[#0E171F] font-semibold text-xs sm:text-sm transition-colors"
              >
                Respawn Astronaut
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Planet Transit Loading Screen */}
      {isTransiting && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          <LoadingScreen
            planet={planet}
            callsign={callsign}
            avatar={avatar}
            onFinishLoading={() => setIsTransiting(false)}
          />
        </div>
      )}

      {/* In-Game Custom 3D Model Importer Modal */}
      <CustomModelModal
        isOpen={showCustomModels}
        onClose={() => setShowCustomModels(false)}
      />

      {/* Revisit 7-Step Interactive Tutorial from Pause */}
      {showTutorialOverlay && (
        <div className="fixed inset-0 z-50">
          <InteractiveTutorial
            mode="revisit"
            onComplete={() => setShowTutorialOverlay(false)}
            onSkip={() => setShowTutorialOverlay(false)}
          />
        </div>
      )}

      {/* Portrait Mobile Orientation Prompt */}
      {showOrientationGate && (
        <MobileOrientationGate
          onDismissFallback={() => setDismissedPortraitGate(true)}
          onExitHome={onExitToHome ? handleExitWithSave : undefined}
        />
      )}
    </div>
  );
};
