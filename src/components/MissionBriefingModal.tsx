import React from 'react';
import { 
  Rocket, Shield, Wind, Zap, Utensils, AlertTriangle, 
  ArrowRight, X, Play, Compass, Award, Box, Sparkles 
} from 'lucide-react';
import { DestinationType, Mission, PlayerProfile } from '../types/game';
import { INITIAL_RESOURCES } from '../engine/simulation';
import { sound } from '../services/audio';

interface MissionBriefingModalProps {
  isOpen: boolean;
  mission: Mission | null;
  profile: PlayerProfile;
  onClose: () => void;
  onStartCommandMission: (mission: Mission) => void;
  onStart3DSurfaceMode?: (mission: Mission) => void;
}

export const MissionBriefingModal: React.FC<MissionBriefingModalProps> = ({
  isOpen,
  mission,
  profile,
  onClose,
  onStartCommandMission,
  onStart3DSurfaceMode
}) => {
  if (!isOpen || !mission) return null;

  const dest = profile.destination;
  const initRes = INITIAL_RESOURCES[dest];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-[#081224] border border-[#193C32] rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto text-[#F1EBDD]">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#252A29]/80 hover:bg-[#193C32] text-[#F1EBDD] transition-colors"
          title="Close Briefing"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mission Identification Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#193C32] border border-[#193C32] text-[#D87943] text-xs font-mono-tech font-bold uppercase tracking-widest">
              MISSION 0{mission.number} BRIEFING • {mission.code}
            </span>
            <span className="text-xs text-[#F1EBDD]/70 font-mono-tech">
              {dest === 'moon' ? '🌙 ARTEMIS MOON' : '🔴 JEZERO MARS'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#F1EBDD]">
            {mission.title}
          </h2>
          <p className="text-sm text-[#D87943] font-medium mt-1">
            {mission.subtitle}
          </p>
        </div>

        {/* Mission Objectives & Learning Goals */}
        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-2xl bg-[#252A29]/80 border border-[#193C32]/80">
            <div className="text-[10px] font-mono-tech uppercase font-bold text-[#D87943] mb-1">
              Flight Objective
            </div>
            <p className="text-xs sm:text-sm text-[#F1EBDD] leading-relaxed">
              {mission.objective}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#193C32]/60 border border-[#193C32]">
            <div className="text-[10px] font-mono-tech uppercase font-bold text-[#F1EBDD] mb-1">
              Core Engineering Principle
            </div>
            <p className="text-xs sm:text-sm text-[#F1EBDD]/90 italic leading-relaxed">
              "{mission.learningGoal}"
            </p>
          </div>
        </div>

        {/* Environmental Hazards & Sol Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-[#252A29]/70 border border-[#252A29]">
            <div className="flex items-center gap-1.5 text-xs text-[#D87943] font-mono-tech font-bold uppercase mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Environmental Conditions</span>
            </div>
            <p className="text-xs text-[#F1EBDD]/80">
              {mission.environmentCondition}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#252A29]/70 border border-[#252A29] flex items-center justify-between">
            <div>
              <div className="text-xs text-[#F1EBDD]/70 font-mono-tech uppercase">
                Mission Duration
              </div>
              <div className="text-xl font-display font-bold text-[#F1EBDD]">
                {mission.durationSols} <span className="text-xs font-mono-tech font-normal text-[#D87943]">Planetary Sols</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#F1EBDD]/70 font-mono-tech uppercase">
                Award Badge
              </div>
              <div className="text-xs font-bold text-[#D87943]">
                {mission.badgeTitle}
              </div>
            </div>
          </div>
        </div>

        {/* Initial Resource Telemetry Cushion */}
        <div className="mb-6">
          <div className="text-xs font-mono-tech uppercase tracking-wider text-[#F1EBDD]/70 font-bold mb-2">
            Initial Outpost Allocation Buffer:
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#252A29] border border-[#193C32]">
              <Wind className="w-4 h-4 mx-auto text-[#D87943] mb-1" />
              <div className="text-[10px] text-[#F1EBDD]/60 uppercase font-mono-tech">Life Support</div>
              <div className="text-sm font-bold text-[#F1EBDD] font-mono-tech">{initRes.lifeSupport}%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#252A29] border border-[#193C32]">
              <Zap className="w-4 h-4 mx-auto text-[#D87943] mb-1" />
              <div className="text-[10px] text-[#F1EBDD]/60 uppercase font-mono-tech">Power Grid</div>
              <div className="text-sm font-bold text-[#F1EBDD] font-mono-tech">{initRes.power}%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#252A29] border border-[#193C32]">
              <Shield className="w-4 h-4 mx-auto text-[#D87943] mb-1" />
              <div className="text-[10px] text-[#F1EBDD]/60 uppercase font-mono-tech">Shielding</div>
              <div className="text-sm font-bold text-[#F1EBDD] font-mono-tech">{initRes.protection}%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#252A29] border border-[#193C32]">
              <Utensils className="w-4 h-4 mx-auto text-[#D87943] mb-1" />
              <div className="text-[10px] text-[#F1EBDD]/60 uppercase font-mono-tech">Food Rations</div>
              <div className="text-sm font-bold text-[#F1EBDD] font-mono-tech">{initRes.food}%</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#F1EBDD]/15">
          <button
            onClick={() => {
              sound.playSuccess();
              onStartCommandMission(mission);
            }}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-[#D87943] hover:bg-[#c66835] text-[#F1EBDD] font-display font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#D87943]/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Commence Mission Command</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onStart3DSurfaceMode && (
            <button
              onClick={() => {
                sound.playSuccess();
                onStart3DSurfaceMode(mission);
              }}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-[#193C32] hover:bg-[#193C32]/80 border border-[#193C32] text-[#F1EBDD] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Box className="w-4 h-4 text-[#D87943]" />
              <span>3D Surface Base Mode</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
