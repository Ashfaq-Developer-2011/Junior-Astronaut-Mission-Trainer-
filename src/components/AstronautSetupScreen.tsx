import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { PlanetType } from '../types/survival';
import { SaveGameV1 } from '../services/saveSystem';
import { sound } from '../services/audio';

interface AstronautSetupScreenProps {
  selectedPlanet: PlanetType;
  callsign: string;
  avatar: string;
  savedGame: SaveGameV1 | null;
  onChangeCallsign: (callsign: string) => void;
  onChangeAvatar: (avatar: string) => void;
  onBack: () => void;
  onLaunchMission: () => void;
}

const AVATARS = [
  { emoji: '👨‍🚀', label: 'Commander Leo' },
  { emoji: '👩‍🚀', label: 'Commander Maya' },
  { emoji: '🧑‍🚀', label: 'Commander Alex' },
  { emoji: '🌟', label: 'Star Voyager' }
];

export const AstronautSetupScreen: React.FC<AstronautSetupScreenProps> = ({
  selectedPlanet,
  callsign,
  avatar,
  savedGame,
  onChangeCallsign,
  onChangeAvatar,
  onBack,
  onLaunchMission
}) => {
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const selectedAvatarLabel = AVATARS.find(a => a.emoji === avatar)?.label || 'Commander';
  const displayCallsign = callsign.trim() || 'Cadet-1';

  const handleContinueClick = () => {
    if (isLaunching) return;
    if (savedGame && !confirmOverwrite) {
      sound.playClick();
      setConfirmOverwrite(true);
      return;
    }
    setIsLaunching(true);
    sound.playFanfare();
    onLaunchMission();
  };

  return (
    <div className="h-[100dvh] w-full overflow-y-auto bg-[#111820] text-[#F0F2F3] flex flex-col justify-between select-none">
      {/* Top Bar */}
      <header className="w-full border-b border-[#35434E] bg-[#111820]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="px-3 py-2 min-h-[40px] rounded-lg hover:bg-[#19232D] text-[#AAB5BE] hover:text-[#F0F2F3] text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono-tech text-[#AAB5BE]">
            <img
              src="/game-icon.png"
              alt="Oops! I'm an Astronaut"
              className="w-6 h-6 rounded-md object-cover border border-[#35434E]"
            />
            <span>Step 3 of 3 · Astronaut Setup</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 my-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F0F2F3] mb-2">
            Astronaut Setup
          </h1>
          <p className="text-sm sm:text-base text-[#AAB5BE]">
            Set your commander callsign and crew emblem before launch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          {/* Commander Preview */}
          <div className="md:col-span-5 bg-[#19232D] border border-[#35434E] rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-[#202C36] border border-[#35434E] flex items-center justify-center text-5xl mb-4">
              {avatar}
            </div>
            <div className="text-lg font-semibold text-[#F0F2F3] mb-0.5">
              {displayCallsign}
            </div>
            <div className="text-sm text-[#AAB5BE] mb-3">
              {selectedAvatarLabel}
            </div>
            <div className="text-xs font-mono-tech text-[#78A9C8]">
              Destination: {selectedPlanet === 'moon' ? 'Moon Base' : 'Mars Outpost'}
            </div>
          </div>

          {/* Setup Controls */}
          <div className="md:col-span-7 bg-[#19232D] border border-[#35434E] rounded-lg p-5 sm:p-6 space-y-6">
            <div>
              <label htmlFor="astronaut-callsign" className="block text-sm font-medium text-[#F0F2F3] mb-2">
                Commander Callsign
              </label>
              <input
                id="astronaut-callsign"
                type="text"
                value={callsign}
                onChange={(e) => onChangeCallsign(e.target.value)}
                placeholder="Eagle-1"
                maxLength={16}
                className="w-full h-11 px-3.5 rounded-lg bg-[#111820] border border-[#35434E] text-[#F0F2F3] placeholder-[#778590] font-mono-tech text-sm focus:border-[#78A9C8] focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-sm font-medium text-[#F0F2F3] mb-2">
                Crew Emblem
              </span>
              <div className="grid grid-cols-4 gap-2.5">
                {AVATARS.map((av) => {
                  const active = avatar === av.emoji;
                  return (
                    <button
                      key={av.label}
                      type="button"
                      aria-label={av.label}
                      aria-pressed={active}
                      title={av.label}
                      onClick={() => {
                        sound.playClick();
                        onChangeAvatar(av.emoji);
                      }}
                      className={`h-14 rounded-lg border text-2xl flex items-center justify-center transition-colors ${
                        active
                          ? 'bg-[#202C36] border-[#78A9C8]'
                          : 'bg-[#111820] border-[#35434E] hover:border-[#4F6270]'
                      }`}
                    >
                      <span>{av.emoji}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Overwrite Confirmation if Saved Game Exists */}
        {savedGame && confirmOverwrite ? (
          <div className="p-4 rounded-lg bg-[#282118] border border-[#D2A45F]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-[#F0F2F3]">
              <span className="font-semibold text-[#D2A45F] block mb-0.5">
                Replace existing saved mission?
              </span>
              <span className="text-[#AAB5BE]">
                Launching a new mission will overwrite your saved checkpoint for{' '}
                <strong className="text-[#F0F2F3]">{savedGame.profile.callsign}</strong> ({savedGame.progression.activeMission.code}).
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmOverwrite(false)}
                className="px-4 py-2.5 min-h-[42px] rounded-lg bg-[#19232D] hover:bg-[#202C36] border border-[#35434E] text-[#F0F2F3] text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLaunching}
                onClick={handleContinueClick}
                className="px-5 py-2.5 min-h-[42px] rounded-lg bg-[#D2A45F] hover:bg-[#DCB476] text-[#111820] text-sm font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-60"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Overwrite &amp; Launch</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onBack();
              }}
              className="px-5 py-3 min-h-[46px] rounded-lg bg-[#19232D] hover:bg-[#202C36] border border-[#35434E] text-[#F0F2F3] text-sm font-medium inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={isLaunching}
              onClick={handleContinueClick}
              className="px-7 py-3 min-h-[46px] rounded-lg bg-[#78A9C8] hover:bg-[#8BB8D4] active:bg-[#6A99B7] text-[#0E171F] font-semibold text-sm sm:text-base inline-flex items-center gap-2 transition-colors disabled:opacity-60"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <div className="h-4" aria-hidden="true" />
    </div>
  );
};
