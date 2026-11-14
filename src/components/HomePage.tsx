import React, { useState } from 'react';
import {
  Rocket,
  Volume2,
  VolumeX,
  ArrowRight,
  Box,
  RotateCcw,
  Play,
  AlertTriangle,
  X,
  Check
} from 'lucide-react';
import { PlanetType } from '../types/survival';
import { formatSaveTimestamp, SaveGameV1 } from '../services/saveSystem';
import { sound } from '../services/audio';

interface HomePageProps {
  onStartGame: (planet: PlanetType, callsign: string, avatar: string) => void;
  onContinueMission?: (save: SaveGameV1) => void;
  savedGame?: SaveGameV1 | null;
  saveCorruptedNotice?: boolean;
  onDismissCorruptedNotice?: () => void;
  onOpenScience: () => void;
  onOpenTutorial: () => void;
  onOpenCustomModels?: () => void;
}

const AVATARS = [
  { emoji: '👨‍🚀', label: 'Commander Leo' },
  { emoji: '👩‍🚀', label: 'Commander Maya' },
  { emoji: '🧑‍🚀', label: 'Commander Alex' },
  { emoji: '🌟', label: 'Star Voyager' }
];

export const HomePage: React.FC<HomePageProps> = ({
  onStartGame,
  onContinueMission,
  savedGame = null,
  saveCorruptedNotice = false,
  onDismissCorruptedNotice,
  onOpenScience,
  onOpenTutorial,
  onOpenCustomModels
}) => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetType>(savedGame?.planet || 'moon');
  const [callsign, setCallsign] = useState(savedGame?.profile.callsign || 'Eagle-1');
  const [selectedAvatar, setSelectedAvatar] = useState(savedGame?.profile.avatar || '👩‍🚀');
  const [muted, setMuted] = useState(sound.getMuted());
  const [confirmNewGame, setConfirmNewGame] = useState(false);

  const handleLaunch = () => {
    if (savedGame && !confirmNewGame) {
      sound.playClick();
      setConfirmNewGame(true);
      return;
    }
    sound.playFanfare();
    setConfirmNewGame(false);
    onStartGame(selectedPlanet, callsign.trim() || 'Cadet-1', selectedAvatar);
  };

  const handleContinue = () => {
    if (!savedGame || !onContinueMission) return;
    sound.playFanfare();
    onContinueMission(savedGame);
  };

  const toggleSound = () => {
    const next = sound.toggleMute();
    setMuted(next);
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[#111820] text-[#F0F2F3] flex flex-col justify-between select-none">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-[#35434E] bg-[#111820]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          <div className="text-base font-semibold tracking-tight text-[#F0F2F3] whitespace-nowrap shrink-0">
            Junior Astronaut
          </div>

          <nav className="flex items-center gap-4 sm:gap-6 text-sm text-[#AAB5BE]">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenTutorial();
              }}
              className="hover:text-[#F0F2F3] transition-colors whitespace-nowrap shrink-0 py-2"
            >
              Handbook
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenScience();
              }}
              className="hover:text-[#F0F2F3] transition-colors whitespace-nowrap shrink-0 py-2"
            >
              NASA Data
            </button>

            {onOpenCustomModels && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenCustomModels();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 hover:text-[#F0F2F3] transition-colors whitespace-nowrap shrink-0 py-2"
                title="Load custom .glb 3D models"
              >
                <Box className="w-4 h-4 text-[#78A9C8]" />
                <span>3D Models</span>
              </button>
            )}
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={toggleSound}
              aria-label={muted ? 'Unmute Sound' : 'Mute Sound'}
              title={muted ? 'Unmute Sound' : 'Mute Sound'}
              className="w-10 h-10 rounded-lg border border-[#35434E] bg-[#19232D] hover:bg-[#202C36] text-[#AAB5BE] hover:text-[#F0F2F3] flex items-center justify-center transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Mission Setup */}
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        <div className="mb-8">
          <div className="text-xs font-mono-tech text-[#78A9C8] mb-2">
            NASA &amp; CSA Outpost Simulation
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#F0F2F3] mb-3 [text-wrap:balance]">
            Oops! I'm an Astronaut
          </h1>
          <p className="text-sm sm:text-base text-[#AAB5BE] leading-relaxed max-w-2xl">
            Walk the lunar or Martian surface, gather ice and regolith, construct life-support modules, and balance power and oxygen under authentic space conditions.
          </p>
        </div>

        {/* Corrupted Save Recovery Notice */}
        {saveCorruptedNotice && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-[#282118] border border-[#D2A45F]/60 text-[#F0F2F3] text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#D2A45F] shrink-0" />
              <span className="text-[#AAB5BE]">
                Previous browser save was corrupted or incompatible and was safely skipped.
              </span>
            </div>
            {onDismissCorruptedNotice && (
              <button
                type="button"
                onClick={onDismissCorruptedNotice}
                aria-label="Dismiss save notice"
                className="p-1.5 rounded hover:bg-[#35434E] text-[#AAB5BE] hover:text-[#F0F2F3]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Saved Checkpoint Panel */}
        {savedGame && onContinueMission && (
          <section
            aria-label="Saved Mission Checkpoint"
            className="mb-6 p-4 sm:p-5 rounded-lg bg-[#19232D] border border-[#35434E] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-mono-tech text-[#79A88B] mb-1">
                <span>Saved Checkpoint</span>
                <span aria-hidden="true">·</span>
                <span>{formatSaveTimestamp(savedGame.savedAt)}</span>
              </div>
              <div className="text-base font-semibold text-[#F0F2F3] flex items-center gap-2">
                <span>{savedGame.profile.avatar}</span>
                <span>{savedGame.profile.callsign}</span>
                <span className="text-[#778590]" aria-hidden="true">·</span>
                <span className="text-[#AAB5BE] font-normal">
                  {savedGame.planet === 'moon' ? 'Moon Base' : 'Mars Outpost'}
                </span>
              </div>
              <div className="text-xs font-mono-tech text-[#AAB5BE] mt-1">
                {savedGame.progression.activeMission.code} ·{' '}
                {savedGame.progression.activeMission.objectives.filter(o => o.isCompleted).length}/
                {savedGame.progression.activeMission.objectives.length} objectives ·{' '}
                {savedGame.placedBuildings.length} modules built
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="px-5 py-2.5 min-h-[44px] rounded-lg bg-[#78A9C8] hover:bg-[#8BB8D4] active:bg-[#6A99B7] text-[#0E171F] font-semibold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Continue Mission</span>
            </button>
          </section>
        )}

        {/* Mission Configuration Panel */}
        <section
          aria-label="Mission Setup"
          className="bg-[#19232D] border border-[#35434E] rounded-lg p-5 sm:p-6 mb-6"
        >
          {/* Step 1: Planet Selection */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-[#AAB5BE] mb-2.5">
              1. Starting Environment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedPlanet('moon');
                }}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  selectedPlanet === 'moon'
                    ? 'bg-[#202C36] border-[#78A9C8]'
                    : 'bg-[#141D26] border-[#35434E] hover:border-[#4F6270]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#F0F2F3]">Moon Base</span>
                  {selectedPlanet === 'moon' && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono-tech text-[#78A9C8]">
                      <Check className="w-3.5 h-3.5" />
                      Selected
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono-tech text-[#AAB5BE] mb-2">
                  Artemis Base Camp · 1.62 m/s² (0.16g)
                </div>
                <p className="text-xs text-[#8895A0] leading-relaxed">
                  Vacuum surface, low-gravity traversal, and water ice trapped in permanently shadowed craters.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedPlanet('mars');
                }}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  selectedPlanet === 'mars'
                    ? 'bg-[#202C36] border-[#78A9C8]'
                    : 'bg-[#141D26] border-[#35434E] hover:border-[#4F6270]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#F0F2F3]">Mars Outpost</span>
                  {selectedPlanet === 'mars' && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono-tech text-[#78A9C8]">
                      <Check className="w-3.5 h-3.5" />
                      Selected
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono-tech text-[#AAB5BE] mb-2">
                  Jezero Crater · 3.72 m/s² (0.38g)
                </div>
                <p className="text-xs text-[#8895A0] leading-relaxed">
                  Thin CO₂ atmosphere, iron-rich regolith dunes, dust events, and subsurface permafrost deposits.
                </p>
              </button>
            </div>
          </div>

          {/* Step 2: Commander Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="commander-callsign" className="block text-xs font-medium text-[#AAB5BE] mb-2">
                2. Commander Callsign
              </label>
              <input
                id="commander-callsign"
                type="text"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                placeholder="Eagle-1"
                maxLength={16}
                className="w-full h-11 px-3.5 rounded-lg bg-[#111820] border border-[#35434E] text-[#F0F2F3] placeholder-[#778590] font-mono-tech text-sm focus:border-[#78A9C8] focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-[#AAB5BE] mb-2">
                3. Crew Emblem
              </span>
              <div className="grid grid-cols-4 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av.label}
                    type="button"
                    aria-label={av.label}
                    title={av.label}
                    onClick={() => {
                      sound.playClick();
                      setSelectedAvatar(av.emoji);
                    }}
                    className={`h-11 rounded-lg border text-lg flex items-center justify-center transition-colors ${
                      selectedAvatar === av.emoji
                        ? 'bg-[#202C36] border-[#78A9C8]'
                        : 'bg-[#111820] border-[#35434E] hover:border-[#4F6270]'
                    }`}
                  >
                    <span>{av.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom 3D Model Link */}
          {onOpenCustomModels && (
            <div className="pt-4 pb-5 border-t border-[#35434E] flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[#AAB5BE]">
                Custom 3D assets (.glb / .gltf) can be loaded locally for the astronaut, habitat, or rover.
              </span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenCustomModels();
                }}
                className="text-[#78A9C8] hover:text-[#9AC2DB] font-medium whitespace-nowrap shrink-0 py-1"
              >
                Import .glb Model
              </button>
            </div>
          )}

          {/* Primary Launch Action */}
          {savedGame && confirmNewGame ? (
            <div className="p-4 rounded-lg bg-[#282118] border border-[#D2A45F]/70 space-y-3">
              <div className="text-sm text-[#F0F2F3] leading-relaxed">
                <span className="font-semibold text-[#D2A45F] block mb-0.5">
                  Replace saved checkpoint?
                </span>
                Starting a new mission will overwrite your saved progress for{' '}
                <strong className="font-semibold">{savedGame.profile.callsign}</strong> ({savedGame.progression.activeMission.code}).
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmNewGame(false)}
                  className="flex-1 min-h-[42px] px-4 py-2 rounded-lg bg-[#19232D] hover:bg-[#202C36] border border-[#35434E] text-[#F0F2F3] text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLaunch}
                  className="flex-1 min-h-[42px] px-4 py-2 rounded-lg bg-[#D2A45F] hover:bg-[#DCB476] text-[#111820] text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Confirm New Mission</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLaunch}
              className="w-full min-h-[48px] py-3 px-6 rounded-lg bg-[#78A9C8] hover:bg-[#8BB8D4] active:bg-[#6A99B7] text-[#0E171F] font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors"
            >
              <Rocket className="w-4 h-4" />
              <span>
                {savedGame
                  ? `Start New ${selectedPlanet === 'moon' ? 'Moon' : 'Mars'} Mission`
                  : `Launch ${selectedPlanet === 'moon' ? 'Moon Base' : 'Mars Outpost'}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </section>

        {/* Quiet Inline Keybinding Reference */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs text-[#AAB5BE] px-1">
          <div>
            <span className="font-mono-tech text-[#F0F2F3]">WASD</span> Move
          </div>
          <div>
            <span className="font-mono-tech text-[#F0F2F3]">Space / Shift</span> Jump &amp; Sprint
          </div>
          <div>
            <span className="font-mono-tech text-[#F0F2F3]">Click / E</span> Mine &amp; Interact
          </div>
          <div>
            <span className="font-mono-tech text-[#F0F2F3]">B / I / Esc</span> Build, Cargo &amp; Pause
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="w-full border-t border-[#35434E]/60 py-4 px-4 sm:px-6 text-center text-xs text-[#8895A0]">
        Oops! I'm an Astronaut · NASA &amp; CSA Open Science STEM Simulator
      </footer>
    </div>
  );
};
