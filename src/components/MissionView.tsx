import React, { useState, useEffect } from 'react';
import { 
  Shield, Zap, Wind, Utensils, CheckCircle2, AlertTriangle, 
  HelpCircle, Sparkles, ArrowRight, Check, RotateCcw, AlertOctagon, Info, Box, X
} from 'lucide-react';
import { 
  Challenge, Choice, DestinationType, Mission, PlayerProfile, 
  ResourceDelta, ResourceState, MissionResult, RandomEvent, ActiveMissionState 
} from '../types/game';
import { HabitatVisualizer } from './HabitatVisualizer';
import { ResourcePanel } from './ResourcePanel';
import { applyEmergencyProtocol, applyResourceDeltas, calculateMissionScore, INITIAL_RESOURCES, StorageService } from '../engine/simulation';
import { sound } from '../services/audio';

interface MissionViewProps {
  mission: Mission;
  profile: PlayerProfile;
  destination: DestinationType;
  initialState?: ActiveMissionState | null;
  onFinishMission: (result: MissionResult) => void;
  onAbortMission: () => void;
  onSwitchTo3DSurface?: () => void;
}

export const MissionView: React.FC<MissionViewProps> = ({
  mission,
  profile,
  destination,
  initialState,
  onFinishMission,
  onAbortMission,
  onSwitchTo3DSurface
}) => {
  // Simulation State
  const [resources, setResources] = useState<ResourceState>(() => {
    return initialState ? initialState.resources : INITIAL_RESOURCES[destination];
  });
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(() => {
    return initialState ? initialState.challengeIndex : 0;
  });
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [lastDelta, setLastDelta] = useState<ResourceDelta | null>(null);
  const [showDebrief, setShowDebrief] = useState(false);
  const [activeChoice, setActiveChoice] = useState<Choice | null>(null);
  const [showCapcomHint, setShowCapcomHint] = useState(false);
  const [randomEvent, setRandomEvent] = useState<RandomEvent | null>(null);
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<string | null>(null);
  const [showAbortModal, setShowAbortModal] = useState(false);

  // History of decisions made
  const [decisionsHistory, setDecisionsHistory] = useState<{
    challengeId: string;
    challengeTitle: string;
    choiceId: string;
    choiceTitle: string;
    explanation: string;
    resourceImpact: ResourceDelta;
  }[]>(() => {
    return initialState ? initialState.decisionsHistory : [];
  });

  const currentChallenge: Challenge = mission.challenges[currentChallengeIndex] || mission.challenges[0];
  const solElapsed = Math.round(((currentChallengeIndex + 1) / mission.challenges.length) * mission.durationSols);

  // Select a choice before confirming (Locking prevents changing)
  const handleSelectChoice = (choiceId: string) => {
    if (isLockedIn) return; // Answer is locked permanently once submitted
    sound.playClick();
    setSelectedChoiceId(choiceId);
  };

  // Lock in and submit the selected decision
  const handleConfirmDecision = () => {
    if (!selectedChoiceId || isLockedIn) return;

    const choice = currentChallenge.choices.find(c => c.id === selectedChoiceId);
    if (!choice) return;

    sound.playSuccess();
    setIsLockedIn(true);
    setActiveChoice(choice);
    setLastDelta(choice.resourceDeltas);

    // Apply simulation math with guaranteed non-NaN clamping
    const { next, warnings, failedResource } = applyResourceDeltas(
      resources,
      choice.resourceDeltas,
      destination
    );

    setResources(next);

    const updatedHistory = [
      ...decisionsHistory,
      {
        challengeId: currentChallenge.id,
        challengeTitle: currentChallenge.title,
        choiceId: choice.id,
        choiceTitle: choice.title,
        explanation: choice.scientificExplanation,
        resourceImpact: choice.resourceDeltas
      }
    ];
    setDecisionsHistory(updatedHistory);

    // Save active mission state to localStorage
    const activeState: ActiveMissionState = {
      missionId: mission.id,
      missionTitle: mission.title,
      challengeIndex: currentChallengeIndex,
      totalChallenges: mission.challenges.length,
      resources: next,
      decisionsHistory: updatedHistory,
      solsElapsed: solElapsed,
      destination,
      savedAt: new Date().toISOString()
    };
    StorageService.saveActiveMission(activeState);

    // Check failure condition
    if (failedResource) {
      sound.playWarning();
      setGameOverReason(failedResource);
      setIsGameOver(true);
    } else if (warnings.length > 0) {
      sound.playWarning();
      setEmergencyAlert(warnings[0]);
    } else {
      setEmergencyAlert(null);
    }

    setShowDebrief(true);
  };

  // Emergency Recovery Protocol (NASA resilience learning)
  const handleRecoverEmergency = () => {
    sound.playSuccess();
    const { recovered, message } = applyEmergencyProtocol(resources);
    setResources(recovered);
    setEmergencyAlert(message);
    setIsGameOver(false);
    setGameOverReason(null);

    // Update saved active mission state
    StorageService.saveActiveMission({
      missionId: mission.id,
      missionTitle: mission.title,
      challengeIndex: currentChallengeIndex,
      totalChallenges: mission.challenges.length,
      resources: recovered,
      decisionsHistory,
      solsElapsed: solElapsed,
      destination,
      savedAt: new Date().toISOString()
    });
  };

  // Advance to next challenge or complete mission
  const handleNextChallenge = () => {
    sound.playClick();
    setShowDebrief(false);
    setIsLockedIn(false);
    setSelectedChoiceId(null);
    setActiveChoice(null);
    setLastDelta(null);
    setShowCapcomHint(false);

    if (currentChallengeIndex + 1 < mission.challenges.length) {
      const nextIdx = currentChallengeIndex + 1;
      // Check for mission random event between challenges
      if (mission.potentialEvents.length > 0 && nextIdx === 1 && !randomEvent) {
        const ev = mission.potentialEvents[0];
        setRandomEvent(ev);
        const { next } = applyResourceDeltas(resources, ev.resourceImpact, destination);
        setResources(next);
        sound.playWarning();
      } else {
        setRandomEvent(null);
      }
      setCurrentChallengeIndex(nextIdx);

      // Persist next index
      StorageService.saveActiveMission({
        missionId: mission.id,
        missionTitle: mission.title,
        challengeIndex: nextIdx,
        totalChallenges: mission.challenges.length,
        resources,
        decisionsHistory,
        solsElapsed: Math.round(((nextIdx + 1) / mission.challenges.length) * mission.durationSols),
        destination,
        savedAt: new Date().toISOString()
      });
    } else {
      // Mission Complete! Clear active mission from storage
      StorageService.clearActiveMission();
      sound.playFanfare();

      const score = calculateMissionScore(
        mission,
        resources,
        !isGameOver,
        mission.challenges.length
      );

      const result: MissionResult = {
        missionId: mission.id,
        missionTitle: mission.title,
        destination,
        success: !isGameOver && score.outcomeStatus !== 'failure',
        outcomeStatus: score.outcomeStatus,
        failureReason: gameOverReason || undefined,
        finalResources: resources,
        decisionsMade: decisionsHistory,
        survivalScore: score.survivalScore,
        scienceScore: score.scienceScore,
        totalScore: score.totalScore,
        rankAwarded: score.rank,
        badgesEarned: score.badgesEarned,
        keyLessonsLearned: [
          mission.learningGoal,
          'Resource preservation must be balanced with active scientific discovery.',
          'Early mitigation of life-support and electrical anomalies prevents cascade system failure.'
        ],
        seed: Date.now(),
        timestamp: new Date().toISOString()
      };

      onFinishMission(result);
    }
  };

  const handleConfirmAbort = () => {
    StorageService.clearActiveMission();
    setShowAbortModal(false);
    sound.playClick();
    onAbortMission();
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 select-none space-y-4 text-[#F1EBDD]">
      {/* Habitat Visualizer Banner */}
      <HabitatVisualizer
        destination={destination}
        visualState={currentChallenge.visualState || 'nominal'}
        solCount={solElapsed}
        missionNumber={mission.number}
        activeSystem={currentChallenge.category}
      />

      {/* Core Resource Telemetry Gauges */}
      <ResourcePanel resources={resources} recentDelta={lastDelta} />

      {/* Random Event Alert Banner (if triggered) */}
      {randomEvent && (
        <div className="p-3 sm:p-4 rounded-2xl bg-[#D87943]/20 border border-[#D87943] text-[#F1EBDD] flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-[#D87943] shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <div className="font-bold uppercase tracking-wider text-[#D87943] font-mono-tech">
              ANOMALY LOG: {randomEvent.title}
            </div>
            <p className="mt-0.5 text-[#F1EBDD]">{randomEvent.description}</p>
            <div className="mt-1 text-[11px] text-[#F1EBDD]/70 font-mono-tech">
              NASA Real-World Case: {randomEvent.nasaRealWorldCase}
            </div>
          </div>
          <button
            onClick={() => setRandomEvent(null)}
            className="px-2.5 py-1 rounded-lg bg-[#252A29] hover:bg-[#193C32] text-[#F1EBDD] text-xs font-mono-tech cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Emergency Alert Banner */}
      {emergencyAlert && !isGameOver && (
        <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
            <span>{emergencyAlert}</span>
          </div>
          <button
            onClick={() => setEmergencyAlert(null)}
            className="px-2 py-0.5 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[10px] uppercase font-mono-tech cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Challenge Screen */}
      <div className="bg-[#252A29]/95 border border-[#193C32] rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
        {/* Progress & Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#193C32]/70 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-[#193C32] border border-[#193C32] text-[#F1EBDD] font-mono-tech text-xs font-bold">
              CHALLENGE {currentChallengeIndex + 1} OF {mission.challenges.length}
            </span>
            <span className="text-xs text-[#F1EBDD]/70 font-mono-tech">
              MISSION SOL {solElapsed} / {mission.durationSols}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onSwitchTo3DSurface && (
              <button
                onClick={() => {
                  sound.playClick();
                  onSwitchTo3DSurface();
                }}
                className="px-3 py-1 rounded-xl bg-[#193C32]/70 hover:bg-[#193C32] text-[#F1EBDD] text-xs font-mono-tech flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Switch to 3D planetary surface mode"
              >
                <Box className="w-3.5 h-3.5 text-[#D87943]" />
                <span className="hidden sm:inline">3D Surface</span>
              </button>
            )}

            {/* Abort button triggers in-UI modal (avoids window.confirm) */}
            <button
              onClick={() => {
                sound.playClick();
                setShowAbortModal(true);
              }}
              className="text-xs text-[#F1EBDD]/60 hover:text-[#D87943] font-mono-tech transition-colors cursor-pointer px-2 py-1"
            >
              Abort to Deck
            </button>
          </div>
        </div>

        {/* Challenge Header & Narrative */}
        <div className="mb-5">
          <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-[#F1EBDD] mb-2">
            {currentChallenge.title}
          </h3>
          <p className="text-sm sm:text-base text-[#F1EBDD]/90 leading-relaxed bg-[#050b14]/50 p-3.5 rounded-2xl border border-[#193C32]/50">
            {currentChallenge.situation}
          </p>

          <div className="mt-2.5 flex items-start gap-2 text-xs text-[#D87943] font-mono-tech">
            <Info className="w-4 h-4 text-[#D87943] shrink-0 mt-0.5" />
            <span>NASA Context: {currentChallenge.contextFact}</span>
          </div>
        </div>

        {/* CAPCOM Hint Collapsible Drawer */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setShowCapcomHint(!showCapcomHint);
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#193C32]/40 hover:bg-[#193C32]/70 border border-[#193C32] text-[#F1EBDD] text-xs font-medium transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#D87943]" />
              <span className="font-bold uppercase font-mono-tech text-[#F1EBDD]">
                Flight Director CAPCOM Tactical Hint
              </span>
            </div>
            <span className="text-[11px] text-[#D87943] underline font-mono-tech">
              {showCapcomHint ? 'Hide Hint' : 'Request Hint'}
            </span>
          </button>

          {showCapcomHint && (
            <div className="mt-2 p-3.5 rounded-2xl bg-[#193C32]/80 border border-[#193C32] text-xs text-[#F1EBDD] leading-relaxed animate-fade-in">
              <span className="font-bold text-[#D87943] font-mono-tech">CAPCOM ORBIT:</span> "{currentChallenge.hint}"
            </div>
          )}
        </div>

        {/* Trade-Off Choices Grid */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-mono-tech uppercase tracking-wider text-[#F1EBDD]/70 font-bold">
            Select Commander Action (Evaluate Benefits vs. Resource Costs):
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {currentChallenge.choices.map((choice) => {
              const isSelected = selectedChoiceId === choice.id;

              return (
                <div
                  key={choice.id}
                  onClick={() => handleSelectChoice(choice.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#193C32] border-[#D87943] ring-2 ring-[#D87943] shadow-xl shadow-[#D87943]/20 scale-[1.01]'
                      : 'bg-[#0b1419]/90 border-[#193C32]/60 hover:border-[#193C32] hover:bg-[#0f1b22]'
                  } ${isLockedIn && !isSelected ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-sm sm:text-base text-[#F1EBDD] leading-snug">
                        {choice.title}
                      </h4>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[#D87943] border-[#D87943] text-[#F1EBDD]'
                            : 'border-[#F1EBDD]/40'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Tagline */}
                    <div className="text-xs text-[#D87943] font-medium mb-3 italic">
                      "{choice.tagline}"
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#F1EBDD]/80 leading-relaxed mb-4">
                      {choice.description}
                    </p>

                    {/* Benefits vs Costs Breakdown */}
                    <div className="space-y-2 mb-3">
                      {/* Benefits */}
                      <div className="p-2 rounded-xl bg-[#193C32]/70 border border-[#193C32]">
                        <div className="text-[10px] font-mono-tech uppercase font-bold text-[#F1EBDD] mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#D87943]" /> Benefits:
                        </div>
                        <ul className="text-[11px] text-[#F1EBDD]/90 space-y-0.5 list-disc list-inside">
                          {choice.benefits.map((b, idx) => (
                            <li key={idx}>{b}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Costs */}
                      <div className="p-2 rounded-xl bg-[#252A29] border border-[#252A29]">
                        <div className="text-[10px] font-mono-tech uppercase font-bold text-[#D87943] mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-[#D87943]" /> Costs & Trade-Offs:
                        </div>
                        <ul className="text-[11px] text-[#F1EBDD]/80 space-y-0.5 list-disc list-inside">
                          {choice.costs.map((c, idx) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Resource Delta Chips */}
                  <div className="pt-2 border-t border-[#F1EBDD]/10 flex flex-wrap gap-1.5 font-mono-tech text-[10px]">
                    {choice.resourceDeltas.lifeSupport !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          choice.resourceDeltas.lifeSupport > 0
                            ? 'bg-[#193C32] text-[#F1EBDD]'
                            : 'bg-rose-950/60 text-rose-300'
                        }`}
                      >
                        O₂/H₂O: {choice.resourceDeltas.lifeSupport > 0 ? `+${choice.resourceDeltas.lifeSupport}` : choice.resourceDeltas.lifeSupport}%
                      </span>
                    )}

                    {choice.resourceDeltas.power !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          choice.resourceDeltas.power > 0
                            ? 'bg-[#193C32] text-[#F1EBDD]'
                            : 'bg-rose-950/60 text-rose-300'
                        }`}
                      >
                        Power: {choice.resourceDeltas.power > 0 ? `+${choice.resourceDeltas.power}` : choice.resourceDeltas.power}%
                      </span>
                    )}

                    {choice.resourceDeltas.protection !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          choice.resourceDeltas.protection > 0
                            ? 'bg-[#193C32] text-[#F1EBDD]'
                            : 'bg-rose-950/60 text-rose-300'
                        }`}
                      >
                        Shield: {choice.resourceDeltas.protection > 0 ? `+${choice.resourceDeltas.protection}` : choice.resourceDeltas.protection}%
                      </span>
                    )}

                    {choice.resourceDeltas.food !== undefined && choice.resourceDeltas.food !== 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          choice.resourceDeltas.food > 0
                            ? 'bg-[#193C32] text-[#F1EBDD]'
                            : 'bg-rose-950/60 text-rose-300'
                        }`}
                      >
                        Food: {choice.resourceDeltas.food > 0 ? `+${choice.resourceDeltas.food}` : choice.resourceDeltas.food}%
                      </span>
                    )}

                    {choice.resourceDeltas.science !== undefined && choice.resourceDeltas.science !== 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          choice.resourceDeltas.science > 0
                            ? 'bg-[#D87943]/40 text-[#F1EBDD]'
                            : 'bg-rose-950/60 text-rose-300'
                        }`}
                      >
                        Science: {choice.resourceDeltas.science > 0 ? `+${choice.resourceDeltas.science}` : choice.resourceDeltas.science} pts
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confirmation Action Button */}
        {!isLockedIn ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#193C32]/70">
            <span className="text-xs text-[#F1EBDD]/70">
              {selectedChoiceId
                ? 'Review benefits and costs above. Once submitted, your action is permanently locked.'
                : 'Select an option above to review your tactical decision.'}
            </span>

            <button
              onClick={handleConfirmDecision}
              disabled={!selectedChoiceId}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-display font-bold text-sm uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedChoiceId
                  ? 'bg-[#D87943] hover:bg-[#c66835] text-[#F1EBDD] shadow-[#D87943]/30 hover:scale-105 active:scale-95'
                  : 'bg-[#252A29] text-[#F1EBDD]/40 cursor-not-allowed border border-[#193C32]/50'
              }`}
            >
              <span>Confirm & Lock In Decision</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-[#193C32]/70 border border-[#D87943] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-[#F1EBDD]">
              <CheckCircle2 className="w-4 h-4 text-[#D87943]" />
              <span>Decision submitted & locked in permanently.</span>
            </div>
            <button
              onClick={() => setShowDebrief(true)}
              className="px-4 py-2 rounded-xl bg-[#D87943] hover:bg-[#c66835] text-[#F1EBDD] text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              View Decision Telemetry
            </button>
          </div>
        )}
      </div>

      {/* Decision Outcome Modal / Step Debrief */}
      {showDebrief && activeChoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
          <div className="relative w-full max-w-xl bg-[#091326] border border-[#193C32] rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto text-[#F1EBDD]">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#193C32]/70 pb-3 mb-4">
              <div className="p-2 rounded-xl bg-[#193C32] text-[#D87943]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono-tech text-[#D87943] uppercase tracking-widest font-bold">
                  DECISION TELEMETRY REPORT
                </span>
                <h3 className="text-lg font-display font-bold text-[#F1EBDD]">
                  {activeChoice.title}
                </h3>
              </div>
            </div>

            {/* Immediate Result Feedback */}
            <div className="p-3.5 rounded-2xl bg-[#193C32]/50 border border-[#193C32] mb-4">
              <div className="text-xs font-bold font-mono-tech text-[#D87943] uppercase mb-1">
                Outpost Immediate Result:
              </div>
              <p className="text-xs sm:text-sm text-[#F1EBDD] leading-relaxed">
                {activeChoice.feedbackText}
              </p>
            </div>

            {/* Scientific Explanation (WHY it happened) */}
            <div className="p-3.5 rounded-2xl bg-[#252A29] border border-[#252A29] mb-4">
              <div className="text-xs font-bold font-mono-tech text-[#F1EBDD] uppercase mb-1">
                🔬 STEM Aerospace Science: Why This Happened
              </div>
              <p className="text-xs sm:text-sm text-[#F1EBDD]/90 leading-relaxed">
                {activeChoice.scientificExplanation}
              </p>
            </div>

            {/* Authentic NASA Fact & Attribution */}
            <div className="p-3 rounded-2xl bg-[#193C32]/30 border border-[#193C32] mb-5">
              <div className="text-[11px] font-mono-tech text-[#D87943] font-bold mb-0.5">
                ★ NASA Real Mission Record:
              </div>
              <p className="text-xs text-[#F1EBDD]">
                {activeChoice.nasaFact}
              </p>
              {activeChoice.nasaSource && (
                <div className="text-[10px] text-[#F1EBDD]/60 mt-1 italic">
                  Source: {activeChoice.nasaSource}
                </div>
              )}
            </div>

            {/* Critical Failure / Recovery Prompt (if any) */}
            {isGameOver && (
              <div className="p-3.5 rounded-2xl bg-rose-950/90 border border-rose-500 text-rose-200 mb-5">
                <div className="font-bold font-mono-tech uppercase text-xs flex items-center gap-1.5 mb-1">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  Mission Alert: {gameOverReason}
                </div>
                <p className="text-xs text-rose-100 mb-3">
                  A critical life-support loop exhausted completely! NASA flight directors teach that failure is the beginning of resilience. Activate emergency protocol reserves to stabilize the outpost.
                </p>
                <button
                  onClick={handleRecoverEmergency}
                  className="w-full py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-900/50 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Authorize Emergency Backup Reserves</span>
                </button>
              </div>
            )}

            {/* Action to proceed */}
            <div className="mt-auto pt-3 border-t border-[#193C32]/70 flex justify-end">
              <button
                onClick={handleNextChallenge}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#D87943] hover:bg-[#c66835] text-[#F1EBDD] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#D87943]/30 transition-all hover:scale-105 cursor-pointer"
              >
                <span>
                  {currentChallengeIndex + 1 < mission.challenges.length
                    ? 'Proceed to Challenge ' + (currentChallengeIndex + 2)
                    : 'Complete Mission & View Performance Report'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom In-UI Abort Confirmation Modal (No window.confirm) */}
      {showAbortModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[#252A29] border border-[#193C32] text-[#F1EBDD] shadow-2xl">
            <h3 className="text-lg font-display font-bold text-[#F1EBDD] mb-2 uppercase">
              Abort Active Mission?
            </h3>
            <p className="text-xs text-[#F1EBDD]/80 leading-relaxed mb-6">
              Returning to Mission Control will reset the current active simulation run. Any completed missions remain safely stored in your flight log.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAbortModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#193C32] hover:bg-[#193C32]/80 text-[#F1EBDD] text-xs font-mono-tech cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAbort}
                className="px-5 py-2.5 rounded-xl bg-[#D87943] hover:bg-[#c66835] text-[#F1EBDD] text-xs font-bold font-mono-tech uppercase cursor-pointer"
              >
                Confirm Abort
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
