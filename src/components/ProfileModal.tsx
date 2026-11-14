import React from 'react';
import { X, Award, RotateCcw, Moon, Sun, CheckCircle2, Shield, User, ArrowRight } from 'lucide-react';
import { BADGES_LIST } from '../data/missions';
import { DestinationType, MissionResult, PlayerProfile } from '../types/game';
import { sound } from '../services/audio';

interface ProfileModalProps {
  isOpen: boolean;
  profile: PlayerProfile;
  missionResults: Record<string, MissionResult>;
  onClose: () => void;
  onUpdateDestination: (dest: DestinationType) => void;
  onSwitchProfile: () => void;
  onResetAll: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  profile,
  missionResults,
  onClose,
  onUpdateDestination,
  onSwitchProfile,
  onResetAll
}) => {
  if (!isOpen) return null;

  const totalScore = Object.values(missionResults).reduce((sum, res) => sum + (res.totalScore || 0), 0);
  const completedCount = Object.values(missionResults).filter(res => res.success).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none text-[#F1EBDD]">
      <div className="relative w-full max-w-2xl bg-[#091122] border border-[#193C32] rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#193C32]/70">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-[#D87943]" />
            <h2 className="font-display font-bold text-lg uppercase tracking-wider text-[#F1EBDD]">
              Commander Flight Dossier
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-[#252A29] hover:bg-[#193C32] text-[#F1EBDD] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Identity Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#252A29] border border-[#193C32] flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#193C32] border border-[#D87943]/60 flex items-center justify-center text-4xl shadow-inner">
              {profile.avatar || '👨‍🚀'}
            </div>
            <div>
              <div className="text-[10px] font-mono-tech text-[#D87943] font-bold uppercase tracking-widest">
                OUTPOST COMMANDER
              </div>
              <h3 className="text-xl font-display font-bold text-[#F1EBDD]">
                {profile.callsign}
              </h3>
              <p className="text-xs text-[#F1EBDD]/70 font-mono-tech">
                {profile.name} • {profile.title}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 text-center sm:text-right">
            <span className="text-[10px] font-mono-tech text-[#F1EBDD]/60 uppercase">Total Career Score</span>
            <span className="text-2xl font-display font-extrabold text-[#D87943]">{totalScore} PTS</span>
          </div>
        </div>

        {/* Destination Switcher */}
        <div className="mb-6">
          <label className="block text-xs font-mono-tech text-[#D87943] uppercase tracking-wider mb-2 font-bold">
            Outpost Deployment Destination:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onUpdateDestination('moon');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                profile.destination === 'moon'
                  ? 'bg-[#193C32] border-[#D87943] ring-1 ring-[#D87943] shadow-md shadow-[#D87943]/20'
                  : 'bg-[#252A29] border-[#193C32]/60 hover:border-[#193C32]'
              }`}
            >
              <div className="font-bold text-sm text-[#F1EBDD] flex items-center gap-1.5">
                <span>🌙</span> Artemis Moon Base
              </div>
              <div className="text-[11px] text-[#F1EBDD]/70 mt-1">
                1/6 Earth gravity • High solar night challenge
              </div>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onUpdateDestination('mars');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                profile.destination === 'mars'
                  ? 'bg-[#D87943]/30 border-[#D87943] ring-1 ring-[#D87943] shadow-md shadow-[#D87943]/20'
                  : 'bg-[#252A29] border-[#193C32]/60 hover:border-[#193C32]'
              }`}
            >
              <div className="font-bold text-sm text-[#F1EBDD] flex items-center gap-1.5">
                <span>🔴</span> Jezero Mars Outpost
              </div>
              <div className="text-[11px] text-[#F1EBDD]/70 mt-1">
                1/3 Earth gravity • Global dust storms & light lag
              </div>
            </button>
          </div>
        </div>

        {/* Badges Earned */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono-tech uppercase tracking-wider text-[#D87943] font-bold">
              Achievement Badges ({profile.badges.length} / {BADGES_LIST.length})
            </h3>
            <span className="text-[11px] font-mono-tech text-[#F1EBDD]/70">
              {completedCount}/4 Missions Completed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {BADGES_LIST.map((b) => {
              const isUnlocked = profile.badges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                    isUnlocked
                      ? 'bg-[#193C32]/60 border-[#D87943]/60'
                      : 'bg-[#252A29]/50 border-[#193C32]/40 opacity-50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isUnlocked
                        ? 'bg-[#D87943] text-[#F1EBDD]'
                        : 'bg-[#252A29] text-[#F1EBDD]/40'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#F1EBDD] leading-tight">
                      {b.title}
                    </div>
                    <div className="text-[10px] text-[#F1EBDD]/70 line-clamp-1">
                      {b.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#193C32]/70 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onSwitchProfile();
            }}
            className="px-4 py-2 rounded-xl bg-[#252A29] hover:bg-[#193C32] border border-[#193C32] text-xs font-mono-tech text-[#F1EBDD] cursor-pointer"
          >
            Switch / Edit Profile
          </button>

          <button
            onClick={() => {
              sound.playWarning();
              onResetAll();
            }}
            className="px-4 py-2 rounded-xl bg-[#252A29] hover:bg-rose-950/60 border border-rose-900/50 text-xs font-mono-tech text-rose-300 cursor-pointer"
          >
            Reset All Saved Progress
          </button>
        </div>
      </div>
    </div>
  );
};
