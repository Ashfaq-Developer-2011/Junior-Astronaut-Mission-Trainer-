import React, { useState } from 'react';
import {
  Play,
  ArrowRight,
  Settings,
  X,
  Volume2,
  VolumeX,
  BookOpen,
  Database,
  Box,
  AlertTriangle
} from 'lucide-react';
import welcomeBg from '../assets/images/welcome_outpost_bg_1794585718560.jpg';
import { formatSaveTimestamp, SaveGameV1 } from '../services/saveSystem';
import { sound } from '../services/audio';

interface WelcomeScreenProps {
  onNewMission: () => void;
  onContinueMission: (save: SaveGameV1) => void;
  savedGame: SaveGameV1 | null;
  saveCorruptedNotice: boolean;
  onDismissCorruptedNotice: () => void;
  onOpenScience: () => void;
  onOpenTutorial: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNewMission,
  onContinueMission,
  savedGame,
  saveCorruptedNotice,
  onDismissCorruptedNotice,
  onOpenScience,
  onOpenTutorial
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [muted, setMuted] = useState(sound.getMuted());

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setMuted(next);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#111820] text-[#F0F2F3] flex flex-col justify-between select-none">
      {/* Wide Cinematic Gameplay Backdrop */}
      <div className="absolute inset-0">
        <img
          src={welcomeBg}
          alt="Astronaut exploring an extraterrestrial lunar outpost beside a pressurized habitat and lander"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#111820]/95 via-[#111820]/75 to-[#111820]/35"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#111820]/90 via-transparent to-[#111820]/50"
        />
      </div>

      {/* Minimal Top Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-5 flex items-center justify-between">
        <span className="text-sm font-medium text-[#AAB5BE] tracking-tight">
          Junior Astronaut
        </span>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setShowSettings(true);
          }}
          aria-label="Open Settings"
          className="h-10 px-3.5 rounded-lg bg-[#19232D]/90 hover:bg-[#202C36] border border-[#35434E] text-[#F0F2F3] text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors"
        >
          <Settings className="w-4 h-4 text-[#AAB5BE]" />
          <span>Settings</span>
        </button>
      </header>

      {/* Main Focal Title & Primary Actions */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 my-auto py-8">
        <div className="max-w-xl">
          {saveCorruptedNotice && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-[#282118]/95 border border-[#D2A45F]/70 text-xs sm:text-sm text-[#F0F2F3] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#D2A45F] shrink-0" />
                <span className="text-[#AAB5BE]">
                  Previous saved game data was incompatible and safely skipped.
                </span>
              </div>
              <button
                type="button"
                onClick={onDismissCorruptedNotice}
                aria-label="Dismiss notice"
                className="p-1 rounded hover:bg-[#35434E] text-[#AAB5BE] hover:text-[#F0F2F3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#F0F2F3] mb-4 [text-wrap:balance]">
            Oops! I'm an Astronaut
          </h1>

          <p className="text-base sm:text-lg text-[#AAB5BE] mb-8 leading-relaxed">
            Your mission. Your outpost. Your survival.
          </p>

          {/* Two Prominent Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {savedGame && (
              <button
                type="button"
                onClick={() => {
                  sound.playFanfare();
                  onContinueMission(savedGame);
                }}
                className="px-6 py-3.5 min-h-[48px] rounded-lg bg-[#78A9C8] hover:bg-[#8BB8D4] active:bg-[#6A99B7] text-[#0E171F] font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Continue Mission</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onNewMission();
              }}
              className={`px-6 py-3.5 min-h-[48px] rounded-lg font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                savedGame
                  ? 'bg-[#19232D]/95 hover:bg-[#202C36] border border-[#35434E] text-[#F0F2F3]'
                  : 'bg-[#78A9C8] hover:bg-[#8BB8D4] active:bg-[#6A99B7] text-[#0E171F]'
              }`}
            >
              <span>New Mission</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Saved Checkpoint Summary (only when valid save exists) */}
          {savedGame && (
            <div className="mt-4 text-xs sm:text-sm text-[#AAB5BE] font-mono-tech">
              Saved: {savedGame.planet === 'moon' ? 'Moon Base' : 'Mars Outpost'} ·{' '}
              {savedGame.profile.callsign} · {savedGame.progression.activeMission.code} ·{' '}
              {formatSaveTimestamp(savedGame.savedAt)}
            </div>
          )}
        </div>
      </main>

      {/* Discreet Footer & Credits Link */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pb-5 flex items-center justify-between text-xs text-[#8895A0]">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setShowAbout(true);
          }}
          className="hover:text-[#F0F2F3] transition-colors underline underline-offset-4 py-1"
        >
          Credits &amp; About
        </button>

        <span>Educational Space Survival Simulator</span>
      </footer>

      {/* Settings Modal */}
      {showSettings && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Game Settings"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1016]/80"
        >
          <div className="w-full max-w-md bg-[#19232D] border border-[#35434E] rounded-lg p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-[#35434E] pb-3.5 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-[#F0F2F3]">
                Settings &amp; Resources
              </h2>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
                className="w-9 h-9 rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#AAB5BE] hover:text-[#F0F2F3] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleToggleMute}
                className="w-full px-4 py-3 rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-left text-sm text-[#F0F2F3] flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  {muted ? <VolumeX className="w-4 h-4 text-[#AAB5BE]" /> : <Volume2 className="w-4 h-4 text-[#78A9C8]" />}
                  <span>Sound Effects &amp; Audio</span>
                </span>
                <span className="font-mono-tech text-xs text-[#AAB5BE]">
                  {muted ? 'Muted' : 'Enabled'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettings(false);
                  onOpenTutorial();
                }}
                className="w-full px-4 py-3 rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-left text-sm text-[#F0F2F3] flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#78A9C8]" />
                  <span>How to Play Tutorial</span>
                </span>
                <ArrowRight className="w-4 h-4 text-[#8895A0]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettings(false);
                  onOpenScience();
                }}
                className="w-full px-4 py-3 rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-left text-sm text-[#F0F2F3] flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-[#78A9C8]" />
                  <span>NASA &amp; CSA Science Data</span>
                </span>
                <ArrowRight className="w-4 h-4 text-[#8895A0]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credits & About Modal */}
      {showAbout && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Credits and About Oops! I'm an Astronaut"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1016]/80"
        >
          <div className="w-full max-w-md bg-[#19232D] border border-[#35434E] rounded-lg p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-[#35434E] pb-3.5 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-[#F0F2F3]">
                About Oops! I'm an Astronaut
              </h2>
              <button
                type="button"
                onClick={() => setShowAbout(false)}
                aria-label="Close about dialog"
                className="w-9 h-9 rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#AAB5BE] hover:text-[#F0F2F3] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[#AAB5BE] leading-relaxed">
              <p>
                Oops! I'm an Astronaut is an interactive 3D space exploration and habitat engineering simulator designed to help students explore real aerospace survival trade-offs on the Moon and Mars.
              </p>
              <p>
                <strong className="text-[#F0F2F3] font-medium">Science &amp; 3D Data Sources:</strong> NASA Open Data (DONKI Space Weather, OSDR Space Biology, RadLab Radiation Dosimetry, Mars Trek, Lunar Reconnaissance Orbiter), NASA 3D Resources (Apollo LM-5, EMU Spacesuit, Habitat Demonstration Unit), and Canadian Space Agency (CSA) Controlled Environment Agriculture food systems.
              </p>
              <p className="text-xs text-[#8895A0]">
                Gameplay resource rates, crop timers, and shelter metrics are simplified educational simulations paired with verified agency context.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-[#35434E] flex justify-end">
              <button
                type="button"
                onClick={() => setShowAbout(false)}
                className="px-4 py-2 min-h-[40px] rounded-lg bg-[#78A9C8] hover:bg-[#8BB8D4] text-[#0E171F] text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
