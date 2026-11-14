import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, ArrowRight } from 'lucide-react';
import { CampaignMission } from '../../types/survival';
import { sound } from '../../services/audio';

interface MissionVictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: CampaignMission;
  onNextMission: () => void;
  hasNextMission: boolean;
}

export const MissionVictoryModal: React.FC<MissionVictoryModalProps> = ({
  isOpen,
  onClose,
  mission,
  onNextMission,
  hasNextMission
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playFanfare();
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#78A9C8', '#79A88B', '#D2A45F', '#F0F2F3']
        });
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Mission Complete: ${mission.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0B1016]/80 select-none"
    >
      <div className="relative w-full max-w-lg bg-[#19232D] border border-[#35434E] rounded-lg p-6 flex flex-col text-left">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-lg bg-[#202C36] border border-[#79A88B]/60 flex items-center justify-center text-[#79A88B] shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono-tech text-[#79A88B]">
              {mission.code} · Mission Complete
            </div>
            <h2 className="text-xl font-semibold text-[#F0F2F3]">
              {mission.title}
            </h2>
          </div>
        </div>

        <p className="text-sm text-[#AAB5BE] leading-relaxed mb-4">
          All primary mission objectives have been completed on the planetary surface.
        </p>

        {/* Commendation Details */}
        <div className="p-3.5 rounded-lg bg-[#202C36] border border-[#35434E] mb-4">
          <div className="text-[11px] font-mono-tech text-[#D2A45F] mb-0.5">
            Commendation Earned
          </div>
          <div className="font-semibold text-[#F0F2F3] text-sm">{mission.badgeTitle}</div>
          <div className="text-xs text-[#AAB5BE] mt-0.5">{mission.learningGoal}</div>
        </div>

        {/* Science Applied Summary */}
        <div className="p-3.5 rounded-lg bg-[#141D26] border border-[#35434E] text-xs text-[#AAB5BE] leading-relaxed mb-5">
          <div className="text-[11px] font-mono-tech text-[#78A9C8] mb-1">
            NASA &amp; CSA Science Applied (Simulated Drill)
          </div>
          {mission.id === 1 && (
            <span>
              Connected landing-site reconnaissance to NASA Mars Trek (Jezero Crater 6 m/px CTX on Mars) and Artemis LRO polar context (Moon), while keeping local 3D relief procedurally simulated.
            </span>
          )}
          {mission.id === 2 && (
            <span>
              Applied closed-loop ECLSS water recovery and Canadian Space Agency (CSA) Controlled Environment Agriculture concepts; crop rates and kW deltas remain simulated.
            </span>
          )}
          {mission.id === 3 && (
            <span>
              Paired NASA DONKI solar-weather alert context with NASA RadLab dosimetry (μGy/hour), preserving orbital vs surface distinctions and simulated shelter gameplay.
            </span>
          )}
          {mission.id === 4 && (
            <span>
              Linked Research Laboratory discovery to verified NASA OSDR studies (OSD-120, OSD-520, OSD-46) and CSA Deep Space Food principles.
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#35434E]">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2.5 min-h-[42px] rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#F0F2F3] text-xs sm:text-sm font-medium transition-colors"
          >
            Stay &amp; Explore
          </button>

          {hasNextMission ? (
            <button
              type="button"
              onClick={() => {
                sound.playSuccess();
                onNextMission();
                onClose();
              }}
              className="px-5 py-2.5 min-h-[42px] rounded-lg bg-[#78A9C8] hover:bg-[#8BB8D4] text-[#0E171F] font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <span>Next Mission</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                sound.playSuccess();
                onClose();
              }}
              className="px-5 py-2.5 min-h-[42px] rounded-lg bg-[#79A88B] hover:bg-[#8AB59B] text-[#0E171F] font-semibold text-xs sm:text-sm transition-colors"
            >
              Campaign Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
