import React from 'react';
import {
  X,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Save,
  Home,
  BookOpen
} from 'lucide-react';
import { PlanetType } from '../../types/survival';
import { CAMPAIGN_MISSIONS } from '../simulation/GameEngine';
import { formatSaveTimestamp } from '../../services/saveSystem';
import { sound } from '../../services/audio';

interface PauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  planet: PlanetType;
  onSwitchPlanet: (planet: PlanetType) => void;
  currentMissionIndex: number;
  onSelectMission: (idx: number) => void;
  onRespawn: () => void;
  onExitHome?: () => void;
  onOpenTutorial?: () => void;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt?: string | null;
  batteryPct?: number;
  sciencePoints?: number;
  onSaveNow?: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onClose,
  planet,
  onSwitchPlanet,
  currentMissionIndex,
  onSelectMission,
  onRespawn,
  onExitHome,
  onOpenTutorial,
  saveStatus = 'idle',
  lastSavedAt = null,
  batteryPct,
  sciencePoints,
  onSaveNow
}) => {
  const [muted, setMuted] = React.useState(sound.getMuted());
  const [confirmRespawn, setConfirmRespawn] = React.useState(false);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const next = sound.toggleMute();
    setMuted(next);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Game Paused and Settings"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0B1016]/80 select-none"
    >
      <div className="relative w-full max-w-2xl bg-[#19232D] border border-[#35434E] rounded-lg p-5 sm:p-6 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#35434E] pb-4 mb-5 gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#F0F2F3]">
              Mission Paused
            </h2>
            <div className="text-xs font-mono-tech text-[#AAB5BE] mt-0.5">
              {planet === 'moon' ? 'Moon Base' : 'Mars Outpost'}
              {typeof batteryPct === 'number' ? ` · Battery ${batteryPct}%` : ''}
              {typeof sciencePoints === 'number' ? ` · Science ${sciencePoints}` : ''}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close pause menu"
            className="w-9 h-9 rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#AAB5BE] hover:text-[#F0F2F3] flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Menu Actions: Resume, Save, Return to Main Menu */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
          <button
            type="button"
            onClick={() => {
              sound.playSuccess();
              onClose();
            }}
            className="px-4 py-2.5 min-h-[42px] rounded-lg bg-[#78A9C8] hover:bg-[#8BB8D4] text-[#0E171F] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume</span>
          </button>

          {onSaveNow && (
            <button
              type="button"
              onClick={() => {
                sound.playSuccess();
                onSaveNow();
              }}
              className="px-4 py-2.5 min-h-[42px] rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#F0F2F3] font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4 text-[#79A88B]" />
              <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Progress'}</span>
            </button>
          )}

          {onExitHome && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onExitHome();
              }}
              className="px-4 py-2.5 min-h-[42px] rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#F0F2F3] font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-4 h-4 text-[#AAB5BE]" />
              <span>Main Menu</span>
            </button>
          )}
        </div>

        <div className="text-xs font-mono-tech text-[#8895A0] mb-5 pb-4 border-b border-[#35434E]">
          {saveStatus === 'error'
            ? 'Local save retry active'
            : lastSavedAt
            ? `Last saved checkpoint: ${formatSaveTimestamp(lastSavedAt)}`
            : 'Autosave active on objective progress'}
        </div>

        {/* Settings & Simulation Options */}
        <div className="space-y-5">
          {/* Audio & Utilities */}
          <div>
            <div className="text-xs font-medium text-[#AAB5BE] mb-2">
              Settings &amp; Utilities
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSound}
                className="px-3.5 py-2 min-h-[38px] rounded-md bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#F0F2F3] text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {muted ? <VolumeX className="w-3.5 h-3.5 text-[#AAB5BE]" /> : <Volume2 className="w-3.5 h-3.5 text-[#78A9C8]" />}
                <span>{muted ? 'Audio: Muted' : 'Audio: On'}</span>
              </button>

              {onOpenTutorial && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onOpenTutorial();
                  }}
                  className="px-3.5 py-2 min-h-[38px] rounded-md bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#F0F2F3] text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#78A9C8]" />
                  <span>How to Play</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!confirmRespawn) {
                    sound.playClick();
                    setConfirmRespawn(true);
                    return;
                  }
                  sound.playClick();
                  setConfirmRespawn(false);
                  onRespawn();
                  onClose();
                }}
                onMouseLeave={() => setConfirmRespawn(false)}
                className={`px-3.5 py-2 min-h-[38px] rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  confirmRespawn
                    ? 'bg-[#382022] border-[#C97979] text-[#F0F2F3]'
                    : 'bg-[#202C36] hover:bg-[#2A3946] border-[#35434E] text-[#AAB5BE] hover:text-[#F0F2F3]'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{confirmRespawn ? 'Confirm Respawn?' : 'Respawn at Lander'}</span>
              </button>
            </div>
          </div>

          {/* Transit Planet */}
          <div>
            <div className="text-xs font-medium text-[#AAB5BE] mb-2">
              Transit Destination
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  sound.playSuccess();
                  onSwitchPlanet('moon');
                }}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  planet === 'moon'
                    ? 'bg-[#202C36] border-[#78A9C8]'
                    : 'bg-[#141D26] border-[#35434E] hover:border-[#4F6270]'
                }`}
              >
                <div className="text-sm font-medium text-[#F0F2F3]">Moon Base</div>
                <div className="text-xs text-[#AAB5BE]">1/6th gravity · Vacuum sky</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playSuccess();
                  onSwitchPlanet('mars');
                }}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  planet === 'mars'
                    ? 'bg-[#202C36] border-[#78A9C8]'
                    : 'bg-[#141D26] border-[#35434E] hover:border-[#4F6270]'
                }`}
              >
                <div className="text-sm font-medium text-[#F0F2F3]">Mars Outpost</div>
                <div className="text-xs text-[#AAB5BE]">0.38g gravity · Thin CO₂ atmosphere</div>
              </button>
            </div>
          </div>

          {/* Mission Jump */}
          <div>
            <div className="text-xs font-medium text-[#AAB5BE] mb-2">
              Campaign Mission
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CAMPAIGN_MISSIONS.map((m, idx) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    sound.playSuccess();
                    onSelectMission(idx);
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    currentMissionIndex === idx
                      ? 'bg-[#202C36] border-[#78A9C8] text-[#F0F2F3]'
                      : 'bg-[#141D26] border-[#35434E] text-[#AAB5BE] hover:border-[#4F6270] hover:text-[#F0F2F3]'
                  }`}
                >
                  <span className="text-[11px] font-mono-tech text-[#78A9C8] mr-1.5">
                    {m.code}
                  </span>
                  <span className="text-xs font-medium">{m.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="pt-4 border-t border-[#35434E]">
            <div className="text-xs font-medium text-[#AAB5BE] mb-2">
              Controls
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-1.5 gap-x-3 text-xs text-[#AAB5BE]">
              <div><span className="font-mono-tech text-[#F0F2F3]">WASD</span> Move</div>
              <div><span className="font-mono-tech text-[#F0F2F3]">Mouse</span> Look</div>
              <div><span className="font-mono-tech text-[#F0F2F3]">Space</span> Jump</div>
              <div><span className="font-mono-tech text-[#F0F2F3]">Shift</span> Sprint</div>
              <div><span className="font-mono-tech text-[#F0F2F3]">E</span> Interact</div>
              <div><span className="font-mono-tech text-[#F0F2F3]">B</span> Build</div>
              <div><span className="font-mono-tech text-[#F0F2F3]">I</span> Inventory</div>
              <div><span className="font-mono-tech text-[#F0F2F3]">Esc</span> Pause</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
