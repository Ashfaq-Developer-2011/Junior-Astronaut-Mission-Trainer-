import React from 'react';
import { 
  Rocket, Compass, Shield, Wind, Zap, Utensils, Sun, 
  ArrowRight, Play, BookOpen, User, Sparkles, Activity, Globe, CheckCircle2 
} from 'lucide-react';
import { ActiveMissionState, Mission, MissionResult, PlayerProfile } from '../types/game';
import { MISSIONS } from '../data/missions';
import { sound } from '../services/audio';

interface HomeScreenProps {
  profile: PlayerProfile;
  activeMission: ActiveMissionState | null;
  missionResults: Record<string, MissionResult>;
  onStartTraining: () => void;
  onResumeMission: () => void;
  onOpenMissionBriefing: (mission: Mission) => void;
  onOpenAcademy: () => void;
  onOpenNasaExplorer: () => void;
  onOpenProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  activeMission,
  missionResults,
  onStartTraining,
  onResumeMission,
  onOpenMissionBriefing,
  onOpenAcademy,
  onOpenNasaExplorer,
  onOpenProfile
}) => {
  const isMoon = profile.destination === 'moon';

  return (
    <div className="min-h-screen bg-[#070e17] text-[#F1EBDD] flex flex-col justify-between relative overflow-hidden select-none">
      {/* Cinematic Planetary Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft glowing space nebula */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[120px] opacity-25"
          style={{
            background: isMoon 
              ? 'radial-gradient(circle, #193C32 0%, #0c201b 50%, transparent 80%)'
              : 'radial-gradient(circle, #D87943 0%, #592911 50%, transparent 80%)'
          }}
        />

        {/* Ambient celestial accent */}
        <div 
          className="absolute -bottom-24 right-0 w-[600px] h-[600px] rounded-full blur-[140px] opacity-20"
          style={{ background: isMoon ? '#193C32' : '#D87943' }}
        />

        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(#F1EBDD 1px, transparent 1px)',
            backgroundSize: '36px 36px'
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col justify-between">
        {/* Top Header info */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <img
              src="/game-icon.png"
              alt="Oops! I'm an Astronaut"
              className="w-8 h-8 rounded-lg object-cover border border-[#35434E]"
            />
            <div>
              <div className="text-[10px] font-mono-tech tracking-widest text-[#D87943] font-bold uppercase">
                OOPS! I&apos;M AN ASTRONAUT
              </div>
              <div className="text-xs font-semibold text-[#F1EBDD]">
                AEROSPACE MISSION SIMULATOR
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-[#252A29]/90 border border-[#193C32]/60 text-xs text-[#F1EBDD] font-mono-tech flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D87943] animate-pulse" />
              <span>{isMoon ? '🌙 ARTEMIS MOON BASE' : '🔴 JEZERO MARS OUTPOST'}</span>
            </div>
          </div>
        </div>

        {/* 1. HERO SECTION */}
        <div className="text-center my-auto py-8 sm:py-12 max-w-4xl mx-auto">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#193C32]/70 border border-[#193C32] text-[#F1EBDD] text-xs font-mono-tech tracking-wider uppercase mb-6 shadow-lg shadow-[#193C32]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#D87943]" />
            <span>TRAIN ON EARTH. SURVIVE BEYOND IT.</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-[#F1EBDD] mb-4 leading-none">
            OOPS! I&apos;M AN
            <span className="block text-[#D87943] mt-2">
              ASTRONAUT
            </span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-[#F1EBDD]/80 text-sm sm:text-base md:text-lg mb-8 leading-relaxed font-normal">
            Take command of our planetary outpost. Balance oxygen generation, allocate limited energy, shield your crew from lethal radiation storms, and solve authentic NASA engineering trade-offs.
          </p>

          {/* Prominent START TRAINING Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                sound.playFanfare();
                onStartTraining();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#D87943] hover:bg-[#c66835] text-[#F1EBDD] font-display font-bold text-base sm:text-lg tracking-wider uppercase shadow-xl shadow-[#D87943]/25 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START TRAINING</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Quick Training Academy button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenAcademy();
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#252A29]/90 hover:bg-[#193C32] border border-[#193C32] text-[#F1EBDD] font-semibold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#D87943]" />
              <span>Training Academy</span>
            </button>
          </div>
        </div>

        {/* 2. CONTINUE MISSION (Conditional: only shown when active mission in progress!) */}
        {activeMission && (
          <div className="w-full my-6 p-5 sm:p-6 rounded-3xl bg-[#193C32]/85 border-2 border-[#D87943] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#252A29] border border-[#D87943]/60 flex items-center justify-center text-2xl shadow-inner">
                {profile.avatar || '👨‍🚀'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono-tech text-[#D87943] font-bold uppercase tracking-widest">
                    MISSION IN PROGRESS
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D87943] animate-ping" />
                </div>
                <h3 className="text-lg font-display font-bold text-[#F1EBDD]">
                  {activeMission.missionTitle}
                </h3>
                <p className="text-xs text-[#F1EBDD]/80 font-mono-tech mt-0.5">
                  Challenge {activeMission.challengeIndex + 1} of {activeMission.totalChallenges} • Sol {activeMission.solsElapsed} • {activeMission.destination === 'moon' ? 'Moon Base' : 'Mars Outpost'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playSuccess();
                onResumeMission();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#D87943] hover:bg-[#c66835] text-[#F1EBDD] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#D87943]/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Continue Mission</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3. EXPLORE MISSIONS */}
        <div className="my-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-[#F1EBDD] tracking-wider uppercase">
                Explore Outpost Missions
              </h2>
              <p className="text-xs text-[#F1EBDD]/70 font-light">
                Four critical NASA flight operations. Select any mission to view briefing and commence training.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MISSIONS.map((mission) => {
              const result = missionResults[mission.id];
              const isCompleted = result && result.success;
              const isCompromised = result && result.outcomeStatus === 'compromised';
              const isInProgress = activeMission && activeMission.missionId === mission.id;

              return (
                <div
                  key={mission.id}
                  onClick={() => {
                    sound.playClick();
                    onOpenMissionBriefing(mission);
                  }}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 ${
                    isInProgress
                      ? 'bg-[#193C32]/90 border-[#D87943] shadow-lg shadow-[#D87943]/20 ring-1 ring-[#D87943]'
                      : isCompleted
                      ? 'bg-[#193C32]/60 border-[#193C32] hover:border-[#F1EBDD]/50 shadow-md'
                      : 'bg-[#252A29]/80 border-[#252A29] hover:border-[#193C32] hover:bg-[#252A29] shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Row: Mission code & status */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono-tech text-[#D87943] font-bold tracking-wider">
                        MISSION 0{mission.number}
                      </span>
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono-tech font-bold text-[#F1EBDD] bg-[#193C32] px-2 py-0.5 rounded-full border border-[#193C32]">
                          <CheckCircle2 className="w-3 h-3 text-[#D87943]" />
                          <span>PASS</span>
                        </span>
                      ) : isInProgress ? (
                        <span className="text-[10px] font-mono-tech font-bold text-[#D87943] bg-[#252A29] px-2 py-0.5 rounded-full border border-[#D87943]/60 animate-pulse">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono-tech text-[#F1EBDD]/60">
                          {mission.durationSols} Sols
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-bold text-sm text-[#F1EBDD] group-hover:text-[#D87943] transition-colors leading-snug mb-1">
                      {mission.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-[11px] text-[#F1EBDD]/70 line-clamp-2 leading-relaxed">
                      {mission.subtitle}
                    </p>
                  </div>

                  {/* Card bottom: brief action */}
                  <div className="mt-4 pt-3 border-t border-[#F1EBDD]/10 flex items-center justify-between text-[11px] text-[#F1EBDD]/80">
                    <span className="font-mono-tech text-[10px] text-[#D87943]">
                      View Briefing
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#F1EBDD] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. TRAINING ACADEMY SHORTCUT */}
        <div className="my-4 p-5 rounded-2xl bg-[#252A29]/70 border border-[#193C32] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#193C32] text-[#F1EBDD]">
              <BookOpen className="w-5 h-5 text-[#D87943]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-[#F1EBDD] uppercase tracking-wide">
                Cadet Training Academy
              </h3>
              <p className="text-xs text-[#F1EBDD]/80">
                Master the 5 core aerospace survival loops: Oxygen, Water Recycling, Energy Grids, Food Production, and Solar Radiation.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onOpenAcademy();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#193C32] hover:bg-[#193C32]/80 border border-[#193C32] text-xs font-mono-tech font-bold text-[#F1EBDD] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <span>Open Handbook</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D87943]" />
          </button>
        </div>
      </div>
    </div>
  );
};
