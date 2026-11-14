import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Hammer,
  Package,
  Database,
  Pause,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  X,
  Save,
  Zap
} from 'lucide-react';
import { CampaignMission, PlayerVitals, ScienceFieldBrief, SpaceWeatherEvent } from '../../types/survival';
import {
  MobileActionCluster,
  MobileCameraPad,
  MobileVirtualJoystick
} from '../../components/MobileTouchControls';

interface HudScienceSummary {
  reconTitle: string;
  reconDetail: string;
  radlabLine: string;
  donkiLine: string;
  osdrLine: string;
  csaLine: string;
}

interface GameHUDProps {
  vitals: PlayerVitals;
  activeMission: CampaignMission;
  gridPower: { generated: number; consumed: number; battery: number; maxBattery: number };
  sciencePoints: number;
  cargoCount?: number;
  interactPrompt: string | null;
  actionFeedback?: { text: string; tone?: 'info' | 'success' | 'warning' } | null;
  weatherEvent: SpaceWeatherEvent;
  planet: 'moon' | 'mars';
  activeScienceBrief?: ScienceFieldBrief | null;
  onDismissScienceBrief?: () => void;
  scienceSummary?: HudScienceSummary;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt?: string | null;
  showQuickGuide?: boolean;
  onDismissQuickGuide?: () => void;
  onOpenBuild: () => void;
  onOpenInventory: () => void;
  onOpenScience: () => void;
  onOpenPause: () => void;
  isMobileTouch?: boolean;
  isBuildPlacementActive?: boolean;
  mobileSprintActive?: boolean;
  onToggleMobileSprint?: () => void;
  onVirtualMove?: (x: number, y: number) => void;
  onVirtualOrbit?: (yawDelta: number, pitchDelta: number) => void;
  onVirtualAction?: (action: 'jump' | 'interact' | 'sprint', active: boolean) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  vitals,
  activeMission,
  gridPower,
  cargoCount = 0,
  interactPrompt,
  actionFeedback,
  weatherEvent,
  planet,
  activeScienceBrief = null,
  onDismissScienceBrief,
  scienceSummary,
  saveStatus = 'idle',
  lastSavedAt = null,
  showQuickGuide = false,
  onDismissQuickGuide,
  onOpenBuild,
  onOpenInventory,
  onOpenScience,
  onOpenPause,
  isMobileTouch = false,
  isBuildPlacementActive = false,
  mobileSprintActive = false,
  onToggleMobileSprint,
  onVirtualMove,
  onVirtualOrbit,
  onVirtualAction
}) => {
  const [showAllObjectives, setShowAllObjectives] = useState(false);
  const [showVitalDetails, setShowVitalDetails] = useState(false);

  const isO2Low = vitals.oxygen <= 25;
  const isHealthLow = vitals.health <= 30;
  const isWaterLow = vitals.water <= 25;
  const isFoodLow = vitals.food <= 25;
  const netPower = Math.round(gridPower.generated - gridPower.consumed);

  const activeObj = activeMission.objectives.find(o => !o.isCompleted);
  const completedCount = activeMission.objectives.filter(o => o.isCompleted).length;
  const totalCount = activeMission.objectives.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  let survivalStatusLabel = 'Nominal';
  let survivalStatusTone = 'text-[#79A88B]';
  if (isO2Low || isHealthLow) {
    survivalStatusLabel = isO2Low ? 'Low O₂' : 'Low Health';
    survivalStatusTone = 'text-[#C97979]';
  } else if (weatherEvent.isActive && !vitals.isInsideShelter) {
    survivalStatusLabel = 'Exposed';
    survivalStatusTone = 'text-[#D2A45F]';
  } else if (vitals.isInsideShelter) {
    survivalStatusLabel = 'Sheltered';
    survivalStatusTone = 'text-[#79A88B]';
  }

  // Dedicated Mobile Landscape HUD
  if (isMobileTouch) {
    return (
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex flex-col justify-between hud-safe-area">
        {/* TOP ROW: Compact Left Vitals · Center Objective · Right Summary & Pause */}
        <div className="flex items-start justify-between gap-2">
          {/* Top-Left: Compact Planet, HP, O2, Energy */}
          <div className="pointer-events-auto relative">
            <button
              type="button"
              onClick={() => setShowVitalDetails(prev => !prev)}
              aria-expanded={showVitalDetails}
              className="min-h-[34px] bg-[#111820]/85 border border-[#35434E] rounded-lg px-2.5 py-1 flex items-center gap-2 text-[11px] font-mono-tech tabular-nums"
            >
              <span className="font-sans font-medium text-[#F0F2F3]">
                {planet === 'moon' ? 'Moon' : 'Mars'}
              </span>
              <span className="text-[#35434E]">·</span>
              <span className={isHealthLow ? 'text-[#C97979] font-semibold' : 'text-[#F0F2F3]'}>
                HP {Math.round(vitals.health)}
              </span>
              <span className={isO2Low ? 'text-[#C97979] font-semibold' : 'text-[#78A9C8]'}>
                O₂ {Math.round(vitals.oxygen)}
              </span>
              <span className="text-[#AAB5BE] hidden sm:inline">
                EN {Math.round(vitals.energy)}
              </span>
              {showVitalDetails ? (
                <ChevronUp className="w-3 h-3 text-[#8895A0]" />
              ) : (
                <ChevronDown className="w-3 h-3 text-[#8895A0]" />
              )}
            </button>

            {showVitalDetails && (
              <div className="absolute left-0 top-10 z-30 bg-[#19232D]/95 border border-[#35434E] rounded-lg px-3 py-2 text-[11px] font-mono-tech tabular-nums space-y-1 min-w-[175px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#AAB5BE]">Status</span>
                  <span className={survivalStatusTone}>{survivalStatusLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#AAB5BE]">Suit Energy</span>
                  <span className="text-[#F0F2F3]">{Math.round(vitals.energy)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#AAB5BE]">H₂O</span>
                  <span className={isWaterLow ? 'text-[#D2A45F]' : 'text-[#F0F2F3]'}>
                    {Math.round(vitals.water)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#AAB5BE]">Nutrition</span>
                  <span className={isFoodLow ? 'text-[#D2A45F]' : 'text-[#F0F2F3]'}>
                    {Math.round(vitals.food)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Top-Center: Compact Mission Objective & Progress */}
          <div className="pointer-events-auto relative flex-1 max-w-xs sm:max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => setShowAllObjectives(prev => !prev)}
              aria-expanded={showAllObjectives}
              className="w-full min-h-[34px] bg-[#111820]/85 border border-[#35434E] rounded-lg px-2.5 py-1 text-left"
            >
              <div className="flex items-center justify-between gap-1.5 text-[11px]">
                <span className="font-mono-tech text-[#78A9C8] shrink-0">
                  {activeMission.code}
                </span>
                <span className="text-[#F0F2F3] truncate flex-1">
                  {activeObj ? activeObj.text : 'Objectives Complete'}
                </span>
                <span className="font-mono-tech text-[#AAB5BE] tabular-nums shrink-0">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="mt-1 w-full h-1 rounded-full bg-[#202C36] overflow-hidden">
                <div
                  className="h-full bg-[#78A9C8] transition-all duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </button>

            {showAllObjectives && (
              <div className="absolute left-0 right-0 top-10 z-30 bg-[#19232D]/95 border border-[#35434E] rounded-lg p-3 space-y-1 text-[11px] max-h-[55dvh] overflow-y-auto">
                <div className="font-semibold text-[#F0F2F3] pb-1 border-b border-[#35434E]">
                  {activeMission.title}
                </div>
                {activeMission.objectives.map(obj => (
                  <div
                    key={obj.id}
                    className={`flex items-center gap-1.5 py-0.5 ${
                      obj.isCompleted ? 'text-[#79A88B] line-through' : 'text-[#F0F2F3]'
                    }`}
                  >
                    {obj.isCompleted ? (
                      <CheckCircle2 className="w-3 h-3 text-[#79A88B] shrink-0" />
                    ) : (
                      <Circle className="w-3 h-3 text-[#778590] shrink-0" />
                    )}
                    <span className="truncate">{obj.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top-Right: Cargo / Power / Save / Pause */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            <div className="min-h-[34px] bg-[#111820]/85 border border-[#35434E] rounded-lg px-2.5 py-1 flex items-center gap-2 font-mono-tech text-[11px] tabular-nums">
              <span className={netPower >= 0 ? 'text-[#79A88B]' : 'text-[#C97979]'}>
                {netPower >= 0 ? `+${netPower}` : netPower}kW
              </span>
              <span className="text-[#35434E]">|</span>
              <span className="text-[#F0F2F3]">C:{cargoCount}</span>
              {saveStatus !== 'idle' && (
                <span
                  className={`inline-flex items-center ${
                    saveStatus === 'saving'
                      ? 'text-[#78A9C8]'
                      : saveStatus === 'error'
                      ? 'text-[#D2A45F]'
                      : 'text-[#79A88B]'
                  }`}
                  title={lastSavedAt ? `Saved ${lastSavedAt}` : 'Save Status'}
                >
                  <Save className="w-3 h-3" />
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenPause}
              aria-label="Pause mission"
              className="min-h-[34px] min-w-[34px] px-2 rounded-lg bg-[#111820]/85 border border-[#35434E] text-[#F0F2F3] flex items-center justify-center"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CENTER STACK: Compact Alerts, Prompts, Dismissible Field Brief */}
        <div className="flex flex-col items-center justify-center gap-1.5 my-auto pointer-events-none px-4">
          {weatherEvent.isActive && (
            <div className="pointer-events-auto px-3 py-1 rounded-md bg-[#2B191B]/95 border border-[#C97979] text-[#F0F2F3] text-[11px] font-mono-tech flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[#C97979] shrink-0" />
              <span>Solar Storm · Seek Shelter · {Math.round(weatherEvent.timeRemainingSec)}s</span>
            </div>
          )}

          {interactPrompt && (
            <div className="px-3 py-1 rounded-md bg-[#111820]/85 border border-[#78A9C8] text-[#F0F2F3] text-[11px] font-medium">
              Tap USE or tap target
            </div>
          )}

          {actionFeedback && (
            <div
              className={`px-3 py-1 rounded-md border text-[11px] font-medium bg-[#19232D]/95 ${
                actionFeedback.tone === 'success'
                  ? 'border-[#79A88B] text-[#79A88B]'
                  : actionFeedback.tone === 'warning'
                  ? 'border-[#D2A45F] text-[#D2A45F]'
                  : 'border-[#35434E] text-[#F0F2F3]'
              }`}
            >
              {actionFeedback.text}
            </div>
          )}

          {activeScienceBrief && (
            <div className="pointer-events-auto max-w-sm w-full bg-[#19232D]/95 border border-[#35434E] rounded-lg p-3 text-left">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-[10px] font-mono-tech text-[#78A9C8]">
                  Field Brief · {activeScienceBrief.dataOrigin}
                </span>
                {onDismissScienceBrief && (
                  <button
                    type="button"
                    onClick={onDismissScienceBrief}
                    aria-label="Dismiss Field Brief"
                    className="text-[#AAB5BE] hover:text-[#F0F2F3] p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="text-xs font-semibold text-[#F0F2F3] mb-0.5">
                {activeScienceBrief.title}
              </div>
              <p className="text-[11px] text-[#AAB5BE] leading-snug line-clamp-2 mb-2">
                {activeScienceBrief.explanation}
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onOpenScience}
                  className="px-2.5 py-1 rounded bg-[#202C36] border border-[#35434E] text-[#F0F2F3] text-[11px]"
                >
                  Data Center
                </button>
                {onDismissScienceBrief && (
                  <button
                    type="button"
                    onClick={onDismissScienceBrief}
                    className="px-2.5 py-1 rounded bg-[#78A9C8] text-[#0E171F] text-[11px] font-semibold"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS: Left Analog Joystick · Center Utility Strip · Right Look Pad & Action Buttons */}
        <div className="flex items-end justify-between gap-2">
          {/* Bottom-Left: True Pointer-Event Analog Joystick */}
          <div className="pointer-events-auto shrink-0">
            {onVirtualMove && <MobileVirtualJoystick onMove={onVirtualMove} />}
          </div>

          {/* Bottom-Center: Compact Utility Dock */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-[#111820]/85 border border-[#35434E] rounded-lg p-1 mb-1">
            <button
              type="button"
              onClick={onOpenBuild}
              className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-md bg-[#78A9C8] text-[#0E171F] font-semibold text-xs whitespace-nowrap"
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>Build</span>
            </button>

            <button
              type="button"
              onClick={onOpenInventory}
              aria-label="Open Cargo Inventory"
              className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-md bg-[#19232D] border border-[#35434E] text-[#F0F2F3] font-medium text-xs whitespace-nowrap"
            >
              <Package className="w-3.5 h-3.5 text-[#AAB5BE]" />
              <span className="hidden md:inline">Cargo</span>
            </button>

            <button
              type="button"
              onClick={onOpenScience}
              aria-label="Open NASA Science Data"
              className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-md bg-[#19232D] border border-[#35434E] text-[#F0F2F3] font-medium text-xs whitespace-nowrap"
            >
              <Database className="w-3.5 h-3.5 text-[#AAB5BE]" />
              <span className="hidden md:inline">Science</span>
            </button>
          </div>

          {/* Bottom-Right: Dedicated Camera Drag Pad + Sprint/Jump/Use Cluster */}
          <div className="pointer-events-auto flex flex-col items-end gap-1.5 shrink-0">
            {onVirtualOrbit && !isBuildPlacementActive && (
              <MobileCameraPad onOrbitDelta={onVirtualOrbit} />
            )}

            <MobileActionCluster
              hasInteractTarget={Boolean(interactPrompt)}
              sprintActive={mobileSprintActive}
              onToggleSprint={() => onToggleMobileSprint?.()}
              onJump={(active) => onVirtualAction?.('jump', active)}
              onInteract={(active) => onVirtualAction?.('interact', active)}
            />
          </div>
        </div>
      </div>
    );
  }

  // Standard Desktop HUD
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex flex-col justify-between p-3 sm:p-4">
      {/* TOP BAR: COMPACT LEFT VITALS · CENTER OBJECTIVE · RIGHT POWER / INVENTORY / SAVE */}
      <div className="flex flex-wrap lg:flex-nowrap items-start justify-between gap-2.5">
        {/* TOP LEFT: Planet, Survival Indicator, Essential Vitals */}
        <div className="pointer-events-auto flex flex-col items-start">
          <button
            type="button"
            onClick={() => setShowVitalDetails(prev => !prev)}
            aria-expanded={showVitalDetails}
            title="Click for full suit vitals"
            className="min-h-[38px] bg-[#111820]/85 hover:bg-[#19232D]/95 border border-[#35434E] rounded-lg px-3 py-1.5 flex items-center gap-3 text-left transition-colors"
          >
            <span className="text-xs font-medium text-[#F0F2F3]">
              {planet === 'moon' ? 'Moon' : 'Mars'}
            </span>

            <span className="text-[#35434E]" aria-hidden="true">·</span>

            <span className={`inline-flex items-center gap-1 text-xs font-medium ${survivalStatusTone}`}>
              {vitals.isInsideShelter && <Shield className="w-3.5 h-3.5" />}
              <span>{survivalStatusLabel}</span>
            </span>

            <span className="text-[#35434E]" aria-hidden="true">·</span>

            <div className="flex items-center gap-2.5 text-xs font-mono-tech tabular-nums">
              <span className={isHealthLow ? 'text-[#C97979] font-semibold' : 'text-[#F0F2F3]'}>
                HP {Math.round(vitals.health)}%
              </span>
              <span className={isO2Low ? 'text-[#C97979] font-semibold' : 'text-[#78A9C8]'}>
                O₂ {Math.round(vitals.oxygen)}%
              </span>
            </div>

            {showVitalDetails ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#8895A0]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#8895A0]" />
            )}
          </button>

          {showVitalDetails && (
            <div className="mt-1.5 bg-[#19232D]/95 border border-[#35434E] rounded-lg px-3.5 py-2.5 text-xs font-mono-tech tabular-nums space-y-1.5 min-w-[210px]">
              <div className="flex items-center justify-between">
                <span className="text-[#AAB5BE]">Suit Energy</span>
                <span className="text-[#F0F2F3]">{Math.round(vitals.energy)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#AAB5BE]">Hydration (H₂O)</span>
                <span className={isWaterLow ? 'text-[#D2A45F]' : 'text-[#F0F2F3]'}>
                  {Math.round(vitals.water)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#AAB5BE]">Nutrition</span>
                <span className={isFoodLow ? 'text-[#D2A45F]' : 'text-[#F0F2F3]'}>
                  {Math.round(vitals.food)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* TOP CENTER: Current Mission Objective & Expandable Checklist */}
        <div className="pointer-events-auto flex flex-col items-center max-w-md w-full order-3 lg:order-2 mx-auto">
          <button
            type="button"
            onClick={() => setShowAllObjectives(prev => !prev)}
            aria-expanded={showAllObjectives}
            className="w-full min-h-[38px] bg-[#111820]/85 hover:bg-[#19232D]/95 border border-[#35434E] rounded-lg px-3 py-1.5 text-left transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono-tech font-medium text-[#78A9C8] shrink-0">
                  {activeMission.code}
                </span>
                <span className="text-xs text-[#F0F2F3] truncate">
                  {activeObj ? (
                    <>
                      {activeObj.text}
                      {activeObj.target && (
                        <span className="text-[#AAB5BE] font-mono-tech ml-1.5">
                          ({activeObj.current || 0}/{activeObj.target})
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[#79A88B]">All Mission Objectives Complete</span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 text-[#AAB5BE]">
                <span className="text-xs font-mono-tech tabular-nums">
                  {completedCount}/{totalCount}
                </span>
                {showAllObjectives ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </div>

            <div className="mt-1.5 w-full h-1 rounded-full bg-[#202C36] overflow-hidden">
              <div
                className="h-full bg-[#78A9C8] transition-all duration-200"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </button>

          {showAllObjectives && (
            <div className="mt-1.5 w-full bg-[#19232D]/95 border border-[#35434E] rounded-lg p-3.5 space-y-1.5 text-xs text-left">
              <div className="font-semibold text-[#F0F2F3] pb-1.5 border-b border-[#35434E]">
                {activeMission.title}
              </div>
              {activeMission.objectives.map(obj => (
                <div
                  key={obj.id}
                  className={`flex items-center gap-2 py-0.5 ${
                    obj.isCompleted ? 'text-[#79A88B] line-through' : 'text-[#F0F2F3]'
                  }`}
                >
                  {obj.isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#79A88B] shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-[#778590] shrink-0" />
                  )}
                  <span className="truncate">
                    {obj.text}
                    {obj.target && !obj.isCompleted && (
                      <span className="font-mono-tech text-[#AAB5BE] ml-1">
                        ({obj.current || 0}/{obj.target})
                      </span>
                    )}
                  </span>
                </div>
              ))}

              {scienceSummary && (
                <div className="mt-2 pt-2.5 border-t border-[#35434E] space-y-1 text-[11px] font-mono-tech text-[#AAB5BE]">
                  <div className="text-[#78A9C8] font-medium">
                    Verified Telemetry Context
                  </div>
                  <div className="text-[#F0F2F3]">{scienceSummary.reconTitle}</div>
                  <div>{scienceSummary.reconDetail}</div>
                  <div className="text-[#D2A45F]">{scienceSummary.radlabLine}</div>
                  <div>{scienceSummary.donkiLine}</div>
                  <div className="text-[#79A88B]">
                    {scienceSummary.osdrLine} · {scienceSummary.csaLine}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TOP RIGHT: Essential Power, Inventory Summary, Save Status */}
        <div className="pointer-events-auto min-h-[38px] bg-[#111820]/85 border border-[#35434E] rounded-lg px-3 py-1.5 flex items-center gap-3 font-mono-tech text-xs tabular-nums order-2 lg:order-3">
          <div className="flex items-center gap-1" title="Net Outpost Power">
            <Zap className={`w-3.5 h-3.5 ${netPower >= 0 ? 'text-[#79A88B]' : 'text-[#C97979]'}`} />
            <span className={netPower >= 0 ? 'text-[#79A88B]' : 'text-[#C97979] font-semibold'}>
              {netPower >= 0 ? `+${netPower}` : netPower} kW
            </span>
          </div>

          <span className="text-[#35434E]" aria-hidden="true">|</span>

          <button
            type="button"
            onClick={onOpenInventory}
            className="text-[#F0F2F3] hover:text-[#78A9C8] transition-colors"
            title="Total Cargo Units (Open Inventory [I])"
          >
            Cargo {cargoCount}
          </button>

          {saveStatus !== 'idle' && (
            <>
              <span className="text-[#35434E] hidden sm:inline" aria-hidden="true">|</span>
              <div
                className={`hidden sm:flex items-center gap-1 text-[11px] font-medium ${
                  saveStatus === 'saving'
                    ? 'text-[#78A9C8]'
                    : saveStatus === 'error'
                    ? 'text-[#D2A45F]'
                    : 'text-[#79A88B]'
                }`}
                title={lastSavedAt ? `Last Saved: ${lastSavedAt}` : 'Checkpoint Autosave Active'}
                aria-live="polite"
              >
                <Save className="w-3 h-3" />
                <span>
                  {saveStatus === 'saving' ? 'Saving' : saveStatus === 'error' ? 'Retry' : 'Saved'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CENTER STACK: ALERTS, PROMPTS & DISMISSIBLE FIELD BRIEFS */}
      <div className="flex flex-col items-center justify-center gap-2.5 my-auto pointer-events-none">
        {weatherEvent.isActive && (
          <div className="pointer-events-auto px-4 py-2 rounded-lg bg-[#2B191B]/95 border border-[#C97979] text-[#F0F2F3] text-xs font-mono-tech flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#C97979] shrink-0" />
            <span>
              <strong className="font-semibold text-[#C97979]">Solar Storm Active</strong>
              {weatherEvent.donkiEventId ? ` (${weatherEvent.donkiEventId})` : ''} · Seek Shelter ·{' '}
              {Math.round(weatherEvent.timeRemainingSec)}s
            </span>
          </div>
        )}

        {interactPrompt && (
          <div className="pointer-events-auto px-3.5 py-2 rounded-lg bg-[#111820]/90 border border-[#78A9C8] text-[#F0F2F3] text-xs flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-[#78A9C8] text-[#0E171F] font-mono-tech font-semibold text-[11px]">
              E
            </span>
            <span className="font-medium">{interactPrompt}</span>
          </div>
        )}

        {actionFeedback && (
          <div
            className={`px-3.5 py-1.5 rounded-lg border text-xs font-medium bg-[#19232D]/95 ${
              actionFeedback.tone === 'success'
                ? 'border-[#79A88B] text-[#79A88B]'
                : actionFeedback.tone === 'warning'
                ? 'border-[#D2A45F] text-[#D2A45F]'
                : 'border-[#35434E] text-[#F0F2F3]'
            }`}
          >
            {actionFeedback.text}
          </div>
        )}

        {activeScienceBrief && (
          <div className="pointer-events-auto max-w-md w-full bg-[#19232D]/95 border border-[#35434E] rounded-lg p-4 text-left">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-mono-tech text-[#78A9C8]">
                Field Brief · {activeScienceBrief.dataOrigin}
              </span>
              {onDismissScienceBrief && (
                <button
                  type="button"
                  onClick={onDismissScienceBrief}
                  aria-label="Dismiss Field Brief"
                  className="text-[#AAB5BE] hover:text-[#F0F2F3] p-1 rounded hover:bg-[#202C36]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="text-sm font-semibold text-[#F0F2F3] mb-1">
              {activeScienceBrief.title}
            </div>
            <p className="text-xs text-[#AAB5BE] leading-relaxed mb-2">
              {activeScienceBrief.explanation}
            </p>
            <div className="text-[11px] font-mono-tech text-[#78A9C8] mb-1">
              {activeScienceBrief.scientificReference}
            </div>
            <div className="text-[11px] text-[#D2A45F] mb-3">
              {activeScienceBrief.simulatedNote}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onOpenScience}
                className="px-3 py-1.5 rounded-md bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#F0F2F3] text-xs font-medium transition-colors"
              >
                Explore Data Center
              </button>
              {onDismissScienceBrief && (
                <button
                  type="button"
                  onClick={onDismissScienceBrief}
                  className="px-3 py-1.5 rounded-md bg-[#78A9C8] hover:bg-[#8BB8D4] text-[#0E171F] text-xs font-semibold transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        )}

        {showQuickGuide && (
          <div
            role="region"
            aria-label="Cadet Quick-Start Mission Guide"
            className="pointer-events-auto max-w-lg w-full bg-[#19232D]/95 border border-[#35434E] rounded-lg p-4 text-left"
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-xs font-semibold text-[#F0F2F3]">
                Quick-Start Controls
              </span>
              {onDismissQuickGuide && (
                <button
                  type="button"
                  onClick={onDismissQuickGuide}
                  aria-label="Dismiss quick-start guide"
                  className="p-1 rounded text-[#AAB5BE] hover:text-[#F0F2F3] hover:bg-[#202C36]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#AAB5BE] leading-snug mb-3">
              <div>
                <span className="font-medium text-[#F0F2F3]">Move:</span>{' '}
                <span className="font-mono-tech text-[#78A9C8]">WASD</span> · Jump{' '}
                <span className="font-mono-tech text-[#78A9C8]">Space</span>
              </div>
              <div>
                <span className="font-medium text-[#F0F2F3]">Mine &amp; Use:</span>{' '}
                <span className="font-mono-tech text-[#78A9C8]">E</span> or click node
              </div>
              <div>
                <span className="font-medium text-[#F0F2F3]">Build:</span>{' '}
                <span className="font-mono-tech text-[#78A9C8]">B</span> then click terrain
              </div>
              <div>
                <span className="font-medium text-[#F0F2F3]">Inventory:</span>{' '}
                <span className="font-mono-tech text-[#78A9C8]">I</span> · Pause{' '}
                <span className="font-mono-tech text-[#78A9C8]">Esc</span>
              </div>
            </div>
            {onDismissQuickGuide && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onDismissQuickGuide}
                  className="px-3.5 py-1.5 rounded-md bg-[#78A9C8] hover:bg-[#8BB8D4] text-[#0E171F] text-xs font-semibold transition-colors"
                >
                  Got It
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM CENTER: MINIMAL ACTION BAR */}
      <div className="flex flex-wrap items-end justify-between gap-2 sm:gap-3">
        <div className="pointer-events-auto mx-auto flex items-center gap-1.5 bg-[#111820]/85 border border-[#35434E] rounded-lg p-1.5">
          <button
            type="button"
            onClick={onOpenBuild}
            className="flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-md bg-[#78A9C8] hover:bg-[#8BB8D4] active:bg-[#6A99B7] text-[#0E171F] font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors"
            title="Build Menu (B)"
          >
            <Hammer className="w-4 h-4" />
            <span>Build</span>
          </button>

          <button
            type="button"
            onClick={onOpenInventory}
            className="flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-md bg-[#19232D] hover:bg-[#202C36] border border-[#35434E] text-[#F0F2F3] font-medium text-xs sm:text-sm whitespace-nowrap transition-colors"
            title="Inventory (I)"
          >
            <Package className="w-4 h-4 text-[#AAB5BE]" />
            <span>Inventory</span>
          </button>

          <button
            type="button"
            onClick={onOpenScience}
            className="flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-md bg-[#19232D] hover:bg-[#202C36] border border-[#35434E] text-[#F0F2F3] font-medium text-xs sm:text-sm whitespace-nowrap transition-colors"
            title="NASA Science Data"
          >
            <Database className="w-4 h-4 text-[#AAB5BE]" />
            <span className="hidden sm:inline">NASA Science</span>
          </button>

          <button
            type="button"
            onClick={onOpenPause}
            aria-label="Open pause menu"
            className="flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-md bg-[#19232D] hover:bg-[#202C36] border border-[#35434E] text-[#AAB5BE] hover:text-[#F0F2F3] font-medium text-xs sm:text-sm whitespace-nowrap transition-colors"
            title="Pause (Esc)"
          >
            <Pause className="w-4 h-4" />
            <span className="hidden sm:inline">Pause</span>
          </button>
        </div>
      </div>
    </div>
  );
};
