import React, { useCallback, useEffect, useRef, useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MissionBriefingScreen } from './components/MissionBriefingScreen';
import { DestinationSelectionScreen } from './components/DestinationSelectionScreen';
import { AstronautSetupScreen } from './components/AstronautSetupScreen';
import { MissionLaunchScreen } from './components/MissionLaunchScreen';
import { GameContainer } from './game/GameContainer';
import { PlanetType } from './types/survival';
import { NasaScienceDrawer } from './components/NasaScienceDrawer';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import {
  fetchPhase2ScienceBundle,
  Phase2ScienceBundle,
  RetryableFeed,
  retrySingleScienceFeed,
  VERIFIED_NASA_ARCHIVE
} from './services/nasaData';
import {
  clearSavedGame,
  loadSavedGame,
  SaveGameV1
} from './services/saveSystem';

type AppScreen =
  | 'welcome'
  | 'briefing'
  | 'destination'
  | 'astronaut'
  | 'launch'
  | 'game';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('screen');
      if (p === 'game' || p === 'destination' || p === 'briefing' || p === 'astronaut' || p === 'welcome') {
        return p as AppScreen;
      }
    }
    return 'welcome';
  });
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetType>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('planet');
      if (p === 'moon' || p === 'mars') return p as PlanetType;
    }
    return 'moon';
  });
  const [callsign, setCallsign] = useState('Eagle-1');
  const [avatar, setAvatar] = useState('👩‍🚀');
  const [showScience, setShowScience] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const [savedGame, setSavedGame] = useState<SaveGameV1 | null>(null);
  const [activeResumeSave, setActiveResumeSave] = useState<SaveGameV1 | null>(null);
  const [saveCorruptedNotice, setSaveCorruptedNotice] = useState(false);

  const [scienceBundle, setScienceBundle] = useState<Phase2ScienceBundle | null>(null);
  const [isRefreshingScience, setIsRefreshingScience] = useState(false);
  const [retryingFeed, setRetryingFeed] = useState<RetryableFeed | null>(null);
  const [scienceError, setScienceError] = useState<string | null>(null);

  const launchingRef = useRef(false);

  const loadScienceData = useCallback(async (liveRadLab = true, forceRefresh = false) => {
    setIsRefreshingScience(true);
    setScienceError(null);
    try {
      const bundle = await fetchPhase2ScienceBundle({ liveRadLab, forceRefresh });
      setScienceBundle(bundle);
    } catch {
      setScienceError('Unable to reach local NASA/CSA proxy service.');
    } finally {
      setIsRefreshingScience(false);
    }
  }, []);

  const handleRetryFeed = useCallback(
    async (feed: RetryableFeed) => {
      if (!scienceBundle) {
        await loadScienceData(true, true);
        return;
      }
      setRetryingFeed(feed);
      setScienceError(null);
      try {
        const updated = await retrySingleScienceFeed(scienceBundle, feed);
        setScienceBundle(updated);
      } catch {
        setScienceError(`Unable to retry ${feed} feed right now.`);
      } finally {
        setRetryingFeed(null);
      }
    },
    [scienceBundle, loadScienceData]
  );

  const refreshSavedState = useCallback(async () => {
    const res = await loadSavedGame();
    setSavedGame(res.save);
    setSaveCorruptedNotice(res.corrupted);
  }, []);

  useEffect(() => {
    void loadScienceData(true, false);
    void refreshSavedState();
  }, [loadScienceData, refreshSavedState]);

  const handleLaunchNewMission = async () => {
    if (launchingRef.current) return;
    launchingRef.current = true;
    try {
      await clearSavedGame();
      setSavedGame(null);
      setActiveResumeSave(null);
      setSaveCorruptedNotice(false);
      setCallsign((prev) => prev.trim() || 'Cadet-1');
      setScreen('launch');
    } finally {
      launchingRef.current = false;
    }
  };

  const handleContinueSavedMission = (save: SaveGameV1) => {
    setActiveResumeSave(save);
    setSelectedPlanet(save.planet);
    setCallsign(save.profile.callsign);
    setAvatar(save.profile.avatar);
    setScreen('game');
  };

  const handleFinishLoading = useCallback(() => {
    setScreen('game');
  }, []);

  const handleExitToHome = () => {
    setScreen('welcome');
    void refreshSavedState();
  };

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-[#111820] text-[#F0F2F3] select-none">
      {screen === 'welcome' && (
        <WelcomeScreen
          onNewMission={() => setScreen('briefing')}
          onContinueMission={handleContinueSavedMission}
          savedGame={savedGame}
          saveCorruptedNotice={saveCorruptedNotice}
          onDismissCorruptedNotice={() => setSaveCorruptedNotice(false)}
          onOpenScience={() => setShowScience(true)}
          onOpenTutorial={() => setShowTutorial(true)}
        />
      )}

      {screen === 'briefing' && (
        <MissionBriefingScreen
          onBack={() => setScreen('welcome')}
          onContinue={() => setScreen('destination')}
        />
      )}

      {screen === 'destination' && (
        <DestinationSelectionScreen
          selectedPlanet={selectedPlanet}
          onSelectPlanet={setSelectedPlanet}
          onBack={() => setScreen('briefing')}
          onContinue={() => setScreen('astronaut')}
        />
      )}

      {screen === 'astronaut' && (
        <AstronautSetupScreen
          selectedPlanet={selectedPlanet}
          callsign={callsign}
          avatar={avatar}
          savedGame={savedGame}
          onChangeCallsign={setCallsign}
          onChangeAvatar={setAvatar}
          onBack={() => setScreen('destination')}
          onLaunchMission={() => {
            void handleLaunchNewMission();
          }}
        />
      )}

      {screen === 'launch' && (
        <MissionLaunchScreen
          planet={selectedPlanet}
          callsign={callsign.trim() || 'Cadet-1'}
          avatar={avatar}
          onFinishLoading={handleFinishLoading}
        />
      )}

      {screen === 'game' && (
        <GameContainer
          initialPlanet={selectedPlanet}
          callsign={callsign.trim() || 'Cadet-1'}
          avatar={avatar}
          initialSave={activeResumeSave}
          onExitToHome={handleExitToHome}
          initialScienceBundle={scienceBundle}
        />
      )}

      {/* NASA & CSA Open Science Center Modal */}
      <NasaScienceDrawer
        isOpen={showScience}
        onClose={() => setShowScience(false)}
        observations={scienceBundle?.observations || VERIFIED_NASA_ARCHIVE}
        isLive={Boolean(scienceBundle?.isLive)}
        onRefresh={() => {
          void loadScienceData(true, true);
        }}
        onRetryFeed={(feed) => {
          void handleRetryFeed(feed);
        }}
        retryingFeed={retryingFeed}
        isRefreshing={isRefreshingScience}
        bundle={scienceBundle}
        errorMessage={scienceError}
      />

      {/* Revisit Interactive Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 z-50">
          <InteractiveTutorial
            mode="revisit"
            onComplete={() => setShowTutorial(false)}
            onSkip={() => setShowTutorial(false)}
          />
        </div>
      )}
    </div>
  );
}
