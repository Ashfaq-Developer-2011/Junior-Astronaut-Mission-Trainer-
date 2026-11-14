import React from 'react';
import { Rocket, Shield, Activity, Sun, Globe, CheckCircle2, Award, ArrowRight, Play, AlertTriangle } from 'lucide-react';
import { Mission, MissionResult, PlayerProfile } from '../types/game';
import { MISSIONS } from '../data/missions';
import { sound } from '../services/audio';

interface MissionSelectProps {
  profile: PlayerProfile;
  missionResults: Record<string, MissionResult>;
  onSelectMission: (mission: Mission) => void;
  onOpenTutorial: () => void;
}

export const MissionSelect: React.FC<MissionSelectProps> = ({
  profile,
  missionResults,
  onSelectMission,
  onOpenTutorial
}) => {
  const getMissionIcon = (num: number) => {
    switch (num) {
      case 1:
        return Rocket;
      case 2:
        return Activity;
      case 3:
        return Sun;
      case 4:
        return Globe;
      default:
        return Shield;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 select-none text-[#F1EBDD]">
      {/* Top Banner */}
      <div className="bg-[#193C32]/80 border border-[#193C32] rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#252A29] border border-[#D87943]/60 flex items-center justify-center text-3xl shadow-lg">
            {profile.avatar || '👨‍🚀'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono-tech text-[#D87943] uppercase tracking-widest font-bold">
                COMMANDER FLIGHT ROSTER
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-tech font-bold bg-[#252A29] text-[#F1EBDD] border border-[#193C32]">
                {profile.destination === 'moon' ? '🌙 MOON BASE (ARTEMIS)' : '🔴 MARS OUTPOST (JEZERO)'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#F1EBDD]">
              Commander {profile.callsign}
            </h2>
            <p className="text-xs sm:text-sm text-[#F1EBDD]/80">
              Completed {profile.completedMissions.length} of 4 Playable Missions • {profile.badges.length} Badges Unlocked
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              sound.playClick();
              onOpenTutorial();
            }}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-[#252A29] hover:bg-[#193C32] border border-[#193C32] text-xs font-bold text-[#D87943] tracking-wider uppercase transition-colors cursor-pointer"
          >
            Review Handbook
          </button>
        </div>
      </div>

      {/* Mission Grid Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-display font-bold text-[#F1EBDD] tracking-wide uppercase">
            NASA Flight Operations Roster
          </h3>
          <p className="text-xs text-[#F1EBDD]/70">
            Select any mission to open its tactical briefing and commence outpost command.
          </p>
        </div>
      </div>

      {/* 4 Playable Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {MISSIONS.map((mission) => {
          const Icon = getMissionIcon(mission.number);
          const result = missionResults[mission.id];
          const isCompleted = !!result && result.success;
          const isCompromised = !!result && result.outcomeStatus === 'compromised';

          return (
            <div
              key={mission.id}
              className={`relative rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                isCompleted
                  ? 'bg-[#193C32]/70 border-[#193C32] hover:border-[#D87943]/80 shadow-xl'
                  : 'bg-[#252A29]/90 border-[#193C32] hover:border-[#D87943]/80 shadow-xl'
              }`}
            >
              {/* Top Accent Strip */}
              <div
                className={`h-1.5 w-full ${
                  isCompleted
                    ? 'bg-gradient-to-r from-[#193C32] to-[#D87943]'
                    : 'bg-gradient-to-r from-[#D87943] to-[#193C32]'
                }`}
              />

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Header Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-[#091122] border border-[#193C32] text-[#D87943]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono-tech text-[#D87943] uppercase font-bold tracking-wider">
                          MISSION 0{mission.number} • {mission.code}
                        </span>
                        <h4 className="text-lg sm:text-xl font-display font-bold text-[#F1EBDD] leading-snug">
                          {mission.title}
                        </h4>
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#193C32] border border-[#193C32] text-[#F1EBDD] text-xs font-mono-tech font-bold shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D87943]" />
                        <span>COMPLETED</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-[#050b14]/70 border border-[#193C32] text-[#F1EBDD]/80 text-[11px] font-mono-tech">
                        {mission.durationSols} Sols
                      </span>
                    )}
                  </div>

                  {/* Subtitle */}
                  <div className="text-xs font-medium text-[#D87943] mb-3">
                    {mission.subtitle}
                  </div>

                  {/* Objective */}
                  <p className="text-xs sm:text-sm text-[#F1EBDD]/80 leading-relaxed mb-4">
                    {mission.objective}
                  </p>

                  {/* Learning Goal Tag */}
                  <div className="p-3 rounded-2xl bg-[#050b14]/60 border border-[#193C32]/80 mb-4">
                    <div className="text-[10px] font-mono-tech text-[#D87943] uppercase font-bold mb-0.5">
                      Core Engineering Principle:
                    </div>
                    <div className="text-xs text-[#F1EBDD]/90 italic">
                      "{mission.learningGoal}"
                    </div>
                  </div>
                </div>

                {/* Footer with Badge & Launch Briefing Button */}
                <div className="pt-3 border-t border-[#193C32]/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#193C32] text-[#D87943]">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="text-[11px]">
                      <div className="text-[#F1EBDD]/60">Award Badge:</div>
                      <div className="font-bold text-[#F1EBDD]">{mission.badgeTitle}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onSelectMission(mission);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#D87943] hover:bg-[#c66835] text-[#F1EBDD] font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>{isCompleted ? 'Replay Briefing' : 'Mission Briefing'}</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
