import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, CheckCircle2, RotateCcw, ArrowRight, Shield, 
  Sparkles, FileText, Printer, Check, AlertTriangle, AlertOctagon 
} from 'lucide-react';
import { MissionResult, PlayerProfile } from '../types/game';
import { CertificateModal } from './CertificateModal';
import { sound } from '../services/audio';

interface MissionReportModalProps {
  isOpen: boolean;
  result: MissionResult;
  profile: PlayerProfile;
  onReplayMission: () => void;
  onReturnToOperations: () => void;
}

export const MissionReportModal: React.FC<MissionReportModalProps> = ({
  isOpen,
  result,
  profile,
  onReplayMission,
  onReturnToOperations
}) => {
  const [showCertificate, setShowCertificate] = useState(false);

  const outcome = result.outcomeStatus || (result.success ? 'success' : 'failure');
  const isSuccess = outcome === 'success';
  const isCompromised = outcome === 'compromised';
  const isFailure = outcome === 'failure';

  useEffect(() => {
    if (isOpen && (isSuccess || isCompromised)) {
      try {
        confetti({
          particleCount: isSuccess ? 80 : 35,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D87943', '#193C32', '#F1EBDD', '#fbbf24']
        });
      } catch {}
    }
  }, [isOpen, isSuccess, isCompromised]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-[#081224] border border-[#193C32] rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto text-[#F1EBDD]">
        {/* Top Header Badge & Outcome */}
        <div className="text-center mb-6">
          {isSuccess && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#193C32] border border-[#193C32] text-[#F1EBDD] text-xs font-mono-tech mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#D87943]" />
              <span>MISSION SUCCESS • NOMINAL TELEMETRY</span>
            </div>
          )}

          {isCompromised && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D87943]/20 border border-[#D87943] text-[#D87943] text-xs font-mono-tech mb-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-[#D87943]" />
              <span>MISSION COMPROMISED • SURVIVAL UNDER STRESS</span>
            </div>
          )}

          {isFailure && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500 text-rose-300 text-xs font-mono-tech mb-2 font-bold">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>MISSION ABORT • POST-FLIGHT ANOMALY REVIEW</span>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-display font-black text-[#F1EBDD]">
            {isSuccess && 'MISSION OUTPOST SUCCESS'}
            {isCompromised && 'MISSION COMPLETED WITH CASUALTY MARGINS'}
            {isFailure && 'MISSION CRITICAL ANOMALY DEBRIEF'}
          </h2>
          <div className="text-sm font-medium text-[#D87943] mt-0.5">
            {result.missionTitle} • {result.destination === 'moon' ? '🌙 Artemis Lunar Base' : '🔴 Jezero Martian Outpost'}
          </div>
        </div>

        {/* Compromised / Failure Explanation Box */}
        {isCompromised && (
          <div className="p-4 rounded-2xl bg-[#D87943]/15 border border-[#D87943] mb-6 text-xs text-[#F1EBDD] leading-relaxed">
            <span className="font-bold text-[#D87943] font-mono-tech uppercase block mb-1">
              Flight Director Compromise Notice:
            </span>
            One or more outpost life-support buffers dropped below the safe 25% margin during the mission. The crew survived, but emergency rationing and system strain incurred a 30% survival score penalty.
          </div>
        )}

        {isFailure && result.failureReason && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/70 mb-6 text-xs text-rose-200 leading-relaxed">
            <span className="font-bold text-rose-300 font-mono-tech uppercase block mb-1">
              Primary Cause of Mission Abort:
            </span>
            {result.failureReason}. In space exploration, every failure is analyzed rigorously to upgrade subsequent mission hardware and astronaut checklists.
          </div>
        )}

        {/* Commander Rank & Total Score Hero */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {/* Survival Score */}
          <div className="p-4 rounded-2xl bg-[#252A29] border border-[#193C32] text-center">
            <div className="text-[11px] font-mono-tech uppercase text-[#F1EBDD]/70 mb-1">
              Survival Score
            </div>
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-[#D87943]">
              {result.survivalScore}
            </div>
            <div className="text-[10px] text-[#F1EBDD]/60 mt-1">Resource conservation & crew safety</div>
          </div>

          {/* Science Score */}
          <div className="p-4 rounded-2xl bg-[#252A29] border border-[#193C32] text-center">
            <div className="text-[11px] font-mono-tech uppercase text-[#F1EBDD]/70 mb-1">
              Science Score
            </div>
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-[#F1EBDD]">
              {result.scienceScore}
            </div>
            <div className="text-[10px] text-[#F1EBDD]/60 mt-1">Research & discovery milestones</div>
          </div>

          {/* Commander Rank */}
          <div className="p-4 rounded-2xl bg-[#193C32]/70 border border-[#193C32] text-center">
            <div className="text-[11px] font-mono-tech uppercase text-[#D87943] mb-1 font-bold">
              Rank Awarded
            </div>
            <div className="text-base sm:text-lg font-display font-extrabold text-[#F1EBDD] leading-tight">
              {result.rankAwarded}
            </div>
            <div className="text-[10px] text-[#F1EBDD]/70 mt-1">NASA Command Distinction</div>
          </div>
        </div>

        {/* Badges Earned Section */}
        {result.badgesEarned.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-[#252A29] border border-[#D87943]/60">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-[#D87943]" />
              <h3 className="font-display font-bold text-sm uppercase text-[#D87943] tracking-wider">
                Achievement Badges Unlocked ({result.badgesEarned.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.badgesEarned.map((badge) => (
                <div
                  key={badge.id}
                  className="p-3 rounded-xl bg-[#091122] border border-[#193C32] flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#193C32] border border-[#D87943]/60 flex items-center justify-center text-[#D87943] font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-[#F1EBDD] text-xs sm:text-sm">{badge.title}</div>
                    <div className="text-[11px] text-[#F1EBDD]/70 leading-tight">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decision Breakdown & Trade-Off Lessons */}
        <div className="mb-6">
          <h3 className="text-xs font-mono-tech uppercase tracking-wider text-[#D87943] font-bold mb-2">
            Engineering Decision Log & Trade-Off Analysis:
          </h3>

          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {result.decisionsMade.map((dec, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-[#252A29] border border-[#193C32] text-xs"
              >
                <div className="flex items-center justify-between text-[#F1EBDD]/60 font-mono-tech text-[10px] mb-1">
                  <span>{dec.challengeTitle}</span>
                  <span className="text-[#D87943] font-bold">Action Taken</span>
                </div>
                <div className="font-bold text-[#F1EBDD] text-xs sm:text-sm mb-1">{dec.choiceTitle}</div>
                <div className="text-[#F1EBDD]/80 italic">{dec.explanation}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="p-3.5 rounded-2xl bg-[#193C32]/40 border border-[#193C32] mb-6">
          <div className="text-[10px] font-mono-tech uppercase font-bold text-[#D87943] mb-1">
            Key STEM Takeaway for Commander:
          </div>
          <ul className="text-xs text-[#F1EBDD]/90 space-y-1 list-disc list-inside">
            {result.keyLessonsLearned.map((lesson, idx) => (
              <li key={idx}>{lesson}</li>
            ))}
          </ul>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#193C32]/70">
          <button
            onClick={() => {
              sound.playSuccess();
              setShowCertificate(true);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#D87943] hover:bg-[#c66835] text-[#F1EBDD] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#D87943]/30 transition-all hover:scale-105 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>View Official NASA Certificate</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                sound.playClick();
                onReplayMission();
              }}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-[#252A29] hover:bg-[#193C32] border border-[#193C32] text-[#F1EBDD] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </button>

            <button
              onClick={() => {
                sound.playSuccess();
                onReturnToOperations();
              }}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#193C32] hover:bg-[#193C32]/80 text-[#F1EBDD] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#193C32]/30 transition-all hover:scale-105 cursor-pointer"
            >
              <span>Operations Deck</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Official Certificate Modal */}
      {showCertificate && (
        <CertificateModal
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          result={result}
          profile={profile}
        />
      )}
    </div>
  );
};
