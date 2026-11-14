import React from 'react';
import { X, Printer, Award, Shield, CheckCircle2 } from 'lucide-react';
import { MissionResult, PlayerProfile } from '../types/game';
import { sound } from '../services/audio';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: MissionResult;
  profile: PlayerProfile;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  result,
  profile
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const isMoon = result.destination === 'moon';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-[#080e1a] border border-amber-500/60 rounded-3xl p-5 sm:p-8 shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Top Control Bar (hidden in print) */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Official NASA Junior Astronaut Credential
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-600/30 transition-all hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Certificate</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CERTIFICATE CONTAINER */}
        <div
          id="nasa-certificate-printable"
          className="relative bg-gradient-to-b from-[#0a1428] via-[#050b16] to-[#040812] border-4 border-amber-400/80 rounded-2xl p-6 sm:p-10 shadow-2xl text-center overflow-hidden"
        >
          {/* Inner Decorative Double Border */}
          <div className="absolute inset-2 border-2 border-dashed border-amber-400/40 rounded-xl pointer-events-none" />

          {/* NASA Header Header Vector */}
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 via-indigo-700 to-cyan-500 flex items-center justify-center border-2 border-amber-400 shadow-lg mb-2">
              <span className="font-display font-extrabold text-white text-lg tracking-widest">
                NASA
              </span>
            </div>
            <div className="text-[11px] font-mono-tech tracking-[0.25em] text-cyan-300 uppercase font-bold">
              National Aeronautics and Space Administration
            </div>
            <div className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-widest">
              Space Apps Challenge 2026 • STEM Aerospace Division
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-3xl font-display font-black text-amber-300 tracking-wider uppercase mb-1">
            Junior Astronaut Certificate
          </h1>
          <div className="text-xs sm:text-sm text-cyan-200 font-mono-tech uppercase tracking-widest mb-6">
            For Exceptional Outpost Command & Engineering Trade-Off Mastery
          </div>

          {/* Certify Text */}
          <p className="text-xs sm:text-sm text-slate-300 mb-2 font-light">
            This is to certify that Mission Commander
          </p>

          {/* Commander Name / Callsign */}
          <div className="my-3 py-2 px-6 inline-block border-b-2 border-amber-400 text-2xl sm:text-3xl md:text-4xl font-display font-black text-white tracking-wide">
            {profile.name} <span className="text-cyan-400 font-mono-tech text-xl sm:text-2xl font-bold">"{profile.callsign}"</span>
          </div>

          {/* Citation Body */}
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-200 leading-relaxed my-4">
            has successfully commanded the <span className="text-cyan-300 font-bold">{isMoon ? 'Artemis Lunar Base Camp' : 'Jezero Martian Outpost'}</span> during <span className="text-amber-300 font-bold">{result.missionTitle}</span>, demonstrating rigorous resource conservation, life-support problem solving, and exemplary scientific trade-off leadership.
          </p>

          {/* Achievement Score & Rank Grid */}
          <div className="max-w-md mx-auto grid grid-cols-3 gap-2 my-6 p-3 rounded-xl bg-black/60 border border-amber-400/30">
            <div>
              <div className="text-[10px] text-slate-400 font-mono-tech uppercase">Survival Score</div>
              <div className="text-sm sm:text-base font-bold font-mono-tech text-emerald-400">
                {result.survivalScore} PTS
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono-tech uppercase">Science Score</div>
              <div className="text-sm sm:text-base font-bold font-mono-tech text-cyan-400">
                {result.scienceScore} PTS
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono-tech uppercase">Commander Rank</div>
              <div className="text-xs sm:text-sm font-bold font-display text-amber-300 truncate">
                {result.rankAwarded}
              </div>
            </div>
          </div>

          {/* Official Signatures Row */}
          <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto pt-4 border-t border-slate-700/80">
            <div className="text-center">
              <div className="font-display italic text-cyan-300 text-sm font-bold mb-0.5">
                Dr. Katherine Vance
              </div>
              <div className="w-32 h-0.5 bg-slate-600 mx-auto mb-1" />
              <div className="text-[10px] font-mono-tech text-slate-400 uppercase">
                Flight Operations Director, NASA
              </div>
            </div>

            <div className="text-center">
              <div className="font-display italic text-amber-300 text-sm font-bold mb-0.5">
                Capt. Mark Chen
              </div>
              <div className="w-32 h-0.5 bg-slate-600 mx-auto mb-1" />
              <div className="text-[10px] font-mono-tech text-slate-400 uppercase">
                Chief Astronaut, Deep Space Training
              </div>
            </div>
          </div>

          {/* Seal / Timestamp */}
          <div className="mt-6 text-[9px] font-mono-tech text-slate-500 uppercase tracking-widest">
            AUTHENTICATED CRYPTOGRAPHIC MISSION SEED #{result.seed} • ISSUED {new Date(result.timestamp).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};
