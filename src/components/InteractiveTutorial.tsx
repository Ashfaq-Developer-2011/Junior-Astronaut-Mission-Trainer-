import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import step1Img from '../assets/images/welcome_outpost_bg_1794585718560.jpg';
import step2Img from '../assets/screenshots/step7_ready.jpg';
import step3Img from '../assets/images/moon_base_preview_1794585718613.jpg';
import step4Img from '../assets/screenshots/step7_ready.jpg';
import step5Img from '../assets/images/mars_outpost_preview_1794585719761.jpg';
import step6Img from '../assets/screenshots/step6_build.jpg';
import step7Img from '../assets/screenshots/step7_ready.jpg';
import { sound } from '../services/audio';

const TUTORIAL_COMPLETED_KEY = 'outpost_survival_tutorial_completed_v1';

export function markInteractiveTutorialCompleted() {
  try {
    window.localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
  } catch {
    // Ignore storage unavailability
  }
}

export function isInteractiveTutorialCompleted(): boolean {
  try {
    return window.localStorage.getItem(TUTORIAL_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
}

interface InteractiveTutorialProps {
  mode?: 'onboarding' | 'revisit';
  onBack?: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

interface TutorialStepDef {
  id: number;
  label: string;
  title: string;
  subtitle?: string;
  body: string;
  image: string;
  imageAlt: string;
  visualType: 'welcome' | 'wasd' | 'mouse' | 'jump_sprint' | 'interact' | 'build' | 'ready';
}

const STEPS: TutorialStepDef[] = [
  {
    id: 1,
    label: 'Meet Your Mission',
    title: 'Welcome, Commander.',
    subtitle: 'Explore. Build. Survive.',
    body: 'Step onto the lunar or Martian surface, gather vital resources, and build a self-sustaining research outpost.',
    image: step1Img,
    imageAlt: 'Third-person gameplay view of the astronaut on the lunar surface near the landing module',
    visualType: 'welcome'
  },
  {
    id: 2,
    label: 'Move Your Astronaut',
    title: 'Move Your Astronaut',
    body: 'Use WASD to explore your surroundings.',
    image: step2Img,
    imageAlt: 'Astronaut walking across cratered lunar terrain in third person',
    visualType: 'wasd'
  },
  {
    id: 3,
    label: 'Look Around',
    title: 'Look Around',
    subtitle: 'Move your mouse to look around.',
    body: 'Rotate the third-person camera freely to survey craters, landing craft, and nearby mineral veins.',
    image: step3Img,
    imageAlt: 'Third-person camera rotated across the lunar horizon and boulders',
    visualType: 'mouse'
  },
  {
    id: 4,
    label: 'Jump and Sprint',
    title: 'Jump and Sprint',
    body: 'Jump over obstacles and sprint across the terrain.',
    image: step4Img,
    imageAlt: 'Astronaut leaping across low-gravity lunar terrain',
    visualType: 'jump_sprint'
  },
  {
    id: 5,
    label: 'Interact and Collect',
    title: 'Interact and Collect',
    body: 'Collect resources and interact with objects.',
    subtitle: 'Press E near surface deposits or click glowing nodes directly.',
    image: step5Img,
    imageAlt: 'Astronaut approaching blue mineral and water-ice deposits on the surface',
    visualType: 'interact'
  },
  {
    id: 6,
    label: 'Build Your Outpost',
    title: 'Build Your Outpost',
    body: 'Build habitats and essential survival systems.',
    subtitle: 'Open the construction menu, choose a module, and click flat terrain to place it.',
    image: step6Img,
    imageAlt: 'Outpost Base Construction & Fabrication menu showing habitat and solar stations',
    visualType: 'build'
  },
  {
    id: 7,
    label: 'Ready for Your Mission',
    title: 'Your outpost is waiting, Commander.',
    body: 'On touchscreen devices, play in landscape using the on-screen analog joystick, look pad, and action buttons.',
    image: step7Img,
    imageAlt: 'Astronaut standing on the Martian surface ready to begin the mission',
    visualType: 'ready'
  }
];

const KeyCap: React.FC<{ label: string; wide?: boolean; active?: boolean }> = ({
  label,
  wide = false,
  active = false
}) => (
  <div
    className={`h-10 sm:h-11 ${
      wide ? 'px-4 min-w-[82px]' : 'w-10 sm:w-11'
    } rounded-md border flex items-center justify-center font-mono-tech text-xs sm:text-sm font-semibold shadow-inner ${
      active
        ? 'bg-[#78A9C8] border-[#9CC2DA] text-[#0E171F]'
        : 'bg-[#202C36] border-[#435563] text-[#F0F2F3]'
    }`}
  >
    {label}
  </div>
);

const StepVisualIllustration: React.FC<{ type: TutorialStepDef['visualType'] }> = ({ type }) => {
  switch (type) {
    case 'wasd':
      return (
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-3.5 rounded-lg bg-[#141D26] border border-[#35434E]">
          {/* Keyboard WASD cluster */}
          <div className="flex flex-col items-center gap-1.5 shrink-0" aria-hidden="true">
            <KeyCap label="W" active />
            <div className="flex items-center gap-1.5">
              <KeyCap label="A" />
              <KeyCap label="S" />
              <KeyCap label="D" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs w-full">
            <div className="flex items-center gap-2">
              <span className="font-mono-tech font-semibold text-[#78A9C8] w-4">W</span>
              <span className="text-[#AAB5BE]">Move forward</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono-tech font-semibold text-[#78A9C8] w-4">A</span>
              <span className="text-[#AAB5BE]">Move left</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono-tech font-semibold text-[#78A9C8] w-4">S</span>
              <span className="text-[#AAB5BE]">Move backward</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono-tech font-semibold text-[#78A9C8] w-4">D</span>
              <span className="text-[#AAB5BE]">Move right</span>
            </div>
          </div>
        </div>
      );

    case 'mouse':
      return (
        <div className="flex items-center gap-4 p-3.5 rounded-lg bg-[#141D26] border border-[#35434E]">
          <svg
            viewBox="0 0 64 56"
            className="w-14 h-12 shrink-0"
            fill="none"
            aria-hidden="true"
          >
            {/* Orbit arrows */}
            <path
              d="M12 28 C12 18, 17 13, 21 11"
              stroke="#78A9C8"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M52 28 C52 18, 47 13, 43 11"
              stroke="#78A9C8"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M15 24 L11 28 L15 32"
              stroke="#78A9C8"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M49 24 L53 28 L49 32"
              stroke="#78A9C8"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Mouse body */}
            <rect
              x="21"
              y="10"
              width="22"
              height="36"
              rx="11"
              fill="#202C36"
              stroke="#435563"
              strokeWidth="2"
            />
            <line x1="32" y1="10" x2="32" y2="25" stroke="#435563" strokeWidth="1.5" />
            <line x1="21" y1="25" x2="43" y2="25" stroke="#435563" strokeWidth="1.5" />
            <rect x="30.5" y="15" width="3" height="6" rx="1.5" fill="#78A9C8" />
          </svg>
          <div className="text-xs text-[#AAB5BE] leading-relaxed">
            <div className="text-[#F0F2F3] font-medium mb-0.5">Mouse Orbit Camera</div>
            <div>Click and drag (or move pointer) to pan and tilt your view around the astronaut.</div>
          </div>
        </div>
      );

    case 'jump_sprint':
      return (
        <div className="flex flex-wrap items-center gap-4 p-3.5 rounded-lg bg-[#141D26] border border-[#35434E]">
          <div className="flex items-center gap-2.5">
            <KeyCap label="SPACE" wide active />
            <span className="text-xs text-[#AAB5BE]">Jump</span>
          </div>
          <div className="flex items-center gap-2.5">
            <KeyCap label="SHIFT" wide />
            <span className="text-xs text-[#AAB5BE]">Sprint</span>
          </div>
        </div>
      );

    case 'interact':
      return (
        <div className="flex items-center gap-4 p-3.5 rounded-lg bg-[#141D26] border border-[#35434E]">
          <KeyCap label="E" active />
          <div className="text-xs">
            <div className="text-[#F0F2F3] font-medium">E — Interact / Mine</div>
            <div className="text-[#AAB5BE]">Harvest regolith, water-ice, silicon, and analyze samples.</div>
          </div>
        </div>
      );

    case 'build':
      return (
        <div className="flex items-center gap-4 p-3.5 rounded-lg bg-[#141D26] border border-[#35434E]">
          <KeyCap label="B" active />
          <div className="text-xs">
            <div className="text-[#F0F2F3] font-medium">B — Open Build Menu</div>
            <div className="text-[#AAB5BE]">Construct solar arrays, habitats, water recyclers, and greenhouses.</div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  mode = 'onboarding',
  onBack,
  onComplete,
  onSkip
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  const handleFinish = useCallback(() => {
    markInteractiveTutorialCompleted();
    onComplete();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    markInteractiveTutorialCompleted();
    onSkip();
  }, [onSkip]);

  const handleNext = useCallback(() => {
    sound.playClick();
    if (isLast) {
      handleFinish();
    } else {
      setStepIndex((prev) => Math.min(STEPS.length - 1, prev + 1));
    }
  }, [handleFinish, isLast]);

  const handlePrev = useCallback(() => {
    sound.playClick();
    if (isFirst) {
      if (mode === 'onboarding' && onBack) {
        onBack();
      }
    } else {
      setStepIndex((prev) => Math.max(0, prev - 1));
    }
  }, [isFirst, mode, onBack]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape' && mode === 'revisit') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handlePrev, handleSkip, mode]);

  return (
    <div className="h-[100dvh] w-full bg-[#111820] text-[#F0F2F3] flex flex-col justify-between select-none overflow-hidden hud-safe-area">
      {/* Compact Header */}
      <header className="w-full max-w-5xl mx-auto px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between gap-3 shrink-0 border-b border-[#35434E]/80">
        <div className="flex items-center gap-3 min-w-0">
          {mode === 'onboarding' && onBack && isFirst ? (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onBack();
              }}
              className="px-2.5 py-1.5 min-h-[36px] rounded-lg hover:bg-[#19232D] text-[#AAB5BE] hover:text-[#F0F2F3] text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Welcome</span>
            </button>
          ) : (
            <span className="text-xs sm:text-sm font-medium text-[#AAB5BE] truncate">
              How to Play
            </span>
          )}
        </div>

        {/* Progress Indicator (1 of 7 .. 7 of 7) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5" aria-hidden="true">
            {STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                tabIndex={-1}
                onClick={() => setStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === stepIndex
                    ? 'w-5 bg-[#78A9C8]'
                    : idx < stepIndex
                    ? 'w-2 bg-[#78A9C8]/50'
                    : 'w-2 bg-[#35434E]'
                }`}
              />
            ))}
          </div>

          <span className="text-xs font-mono-tech text-[#AAB5BE] tabular-nums">
            {stepIndex + 1} of {STEPS.length}
          </span>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              handleSkip();
            }}
            className="px-2.5 py-1.5 min-h-[34px] rounded-md bg-[#19232D] hover:bg-[#202C36] border border-[#35434E] text-[#AAB5BE] hover:text-[#F0F2F3] text-xs font-medium inline-flex items-center gap-1 transition-colors"
          >
            {mode === 'revisit' ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </>
            ) : (
              <span>Skip Tutorial</span>
            )}
          </button>
        </div>
      </header>

      {/* Main Focused Lesson Stage — Fits comfortably inside single viewport */}
      <main className="flex-1 min-h-0 w-full max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-5 flex flex-col justify-center">
        <div
          key={step.id}
          className="tutorial-step-enter bg-[#19232D] border border-[#35434E] rounded-lg overflow-hidden flex flex-col md:grid md:grid-cols-12 max-h-full"
        >
          {/* Large Actual Gameplay Screenshot */}
          <div className="md:col-span-7 bg-[#0E141B] border-b md:border-b-0 md:border-r border-[#35434E] flex items-center justify-center overflow-hidden">
            <img
              src={step.image}
              alt={step.imageAlt}
              referrerPolicy="no-referrer"
              className="w-full aspect-video object-cover max-h-[34dvh] md:max-h-[58dvh]"
            />
          </div>

          {/* Focused Single-Lesson Copy & Visual Controls */}
          <div className="md:col-span-5 p-4 sm:p-6 flex flex-col justify-between gap-4 overflow-y-auto">
            <div className="space-y-3">
              <div className="text-xs font-mono-tech text-[#78A9C8]">
                Lesson {step.id} of {STEPS.length} · {step.label}
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F0F2F3]">
                {step.title}
              </h1>

              {step.subtitle && (
                <p className="text-sm sm:text-base font-medium text-[#F0F2F3]/90">
                  {step.subtitle}
                </p>
              )}

              <p className="text-sm text-[#AAB5BE] leading-relaxed">
                {step.body}
              </p>

              <StepVisualIllustration type={step.visualType} />
            </div>

            {/* Step Navigation Controls */}
            <div className="pt-3 border-t border-[#35434E] flex items-center justify-between gap-3">
              {!isFirst ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2.5 min-h-[42px] rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#F0F2F3] text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 min-h-[44px] rounded-lg bg-[#78A9C8] hover:bg-[#8BB8D4] active:bg-[#6A99B7] text-[#0E171F] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors ml-auto"
              >
                <span>
                  {isFirst
                    ? 'Continue'
                    : isLast
                    ? mode === 'revisit'
                      ? 'Finish Tutorial'
                      : 'Choose Destination'
                    : 'Next'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
