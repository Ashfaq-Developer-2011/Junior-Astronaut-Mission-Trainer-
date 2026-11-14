import React from 'react';
import { 
  Volume2, VolumeX, BookOpen, Database, HelpCircle, 
  Rocket, Home, Compass, User, Globe, Sparkles 
} from 'lucide-react';
import { PlayerProfile } from '../types/game';
import { sound } from '../services/audio';

interface HeaderProps {
  profile: PlayerProfile | null;
  currentNav: 'home' | 'missions' | 'nasa' | 'profile';
  onNavigate: (nav: 'home' | 'missions' | 'nasa' | 'profile') => void;
  onOpenGlossary: () => void;
  onOpenTutorial: () => void;
  activeMissionTitle?: string;
  isNasaLive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  currentNav,
  onNavigate,
  onOpenGlossary,
  onOpenTutorial,
  activeMissionTitle,
  isNasaLive = false
}) => {
  const [muted, setMuted] = React.useState(sound.getMuted());

  const handleToggleSound = () => {
    const next = sound.toggleMute();
    setMuted(next);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070e17]/95 backdrop-blur-md border-b border-[#193C32] px-3 sm:px-6 py-2.5 transition-all text-[#F1EBDD] select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('home');
            }}
            className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
            title="Mission Control: Beyond Earth"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#193C32] border border-[#193C32] flex items-center justify-center p-0.5 shadow-md shadow-[#193C32]/30 group-hover:scale-105 transition-transform">
              <Rocket className="w-5 h-5 text-[#D87943]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold tracking-wider text-[10px] sm:text-xs text-[#D87943] uppercase">
                  NASA Space Apps 2026
                </span>
              </div>
              <h1 className="text-xs sm:text-sm md:text-base font-bold text-[#F1EBDD] tracking-tight">
                Mission Control: Beyond Earth
              </h1>
            </div>
          </button>

          {/* Active Mission Pill */}
          {activeMissionTitle && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#193C32]/50 border border-[#193C32] text-[#F1EBDD] text-xs font-mono-tech">
              <span className="w-2 h-2 rounded-full bg-[#D87943] animate-pulse" />
              <span className="truncate max-w-[200px]">ACTIVE: {activeMissionTitle}</span>
            </div>
          )}
        </div>

        {/* Center: Minimal Navigation Bar (Home, Missions, NASA Explorer, Profile) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('home');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono-tech transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentNav === 'home'
                ? 'bg-[#193C32] text-[#F1EBDD] border border-[#193C32] font-bold'
                : 'text-[#F1EBDD]/70 hover:text-[#F1EBDD] hover:bg-[#252A29]'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-[#D87943]" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('missions');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono-tech transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentNav === 'missions'
                ? 'bg-[#193C32] text-[#F1EBDD] border border-[#193C32] font-bold'
                : 'text-[#F1EBDD]/70 hover:text-[#F1EBDD] hover:bg-[#252A29]'
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-[#D87943]" />
            <span>Missions</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('nasa');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono-tech transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentNav === 'nasa'
                ? 'bg-[#193C32] text-[#F1EBDD] border border-[#193C32] font-bold'
                : 'text-[#F1EBDD]/70 hover:text-[#F1EBDD] hover:bg-[#252A29]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#D87943]" />
            <span className="hidden sm:inline">NASA Explorer</span>
            <span className="sm:hidden">NASA</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('profile');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono-tech transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentNav === 'profile'
                ? 'bg-[#193C32] text-[#F1EBDD] border border-[#193C32] font-bold'
                : 'text-[#F1EBDD]/70 hover:text-[#F1EBDD] hover:bg-[#252A29]'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#D87943]" />
            <span className="hidden sm:inline">Profile</span>
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Glossary */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenGlossary();
            }}
            className="p-2 rounded-lg bg-[#252A29] hover:bg-[#193C32] text-[#F1EBDD] border border-[#193C32] transition-colors cursor-pointer"
            title="Space Science Glossary"
          >
            <BookOpen className="w-4 h-4 text-[#D87943]" />
          </button>

          {/* Handbook / Tutorial */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenTutorial();
            }}
            className="p-2 rounded-lg bg-[#252A29] hover:bg-[#193C32] text-[#F1EBDD] border border-[#193C32] transition-colors cursor-pointer"
            title="Cadet Training Handbook"
          >
            <HelpCircle className="w-4 h-4 text-[#D87943]" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              muted
                ? 'bg-[#252A29] text-[#F1EBDD]/40 border-[#252A29]'
                : 'bg-[#193C32] text-[#F1EBDD] border-[#193C32]'
            }`}
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Profile Quick Pill */}
          {profile && (
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('profile');
              }}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-[#252A29] border border-[#193C32] hover:border-[#D87943] transition-all text-left cursor-pointer"
              title="View Commander Profile"
            >
              <span className="text-xl leading-none select-none">{profile.avatar || '👨‍🚀'}</span>
              <div className="hidden xs:block">
                <div className="text-[10px] text-[#D87943] uppercase font-mono-tech leading-none font-bold">
                  {profile.destination === 'moon' ? '🌙 Moon' : '🔴 Mars'}
                </div>
                <div className="text-xs font-semibold text-[#F1EBDD] leading-tight truncate max-w-[80px]">
                  {profile.callsign || 'Commander'}
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
