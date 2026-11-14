import React, { useState } from 'react';
import { X, Wind, Zap, Shield, Utensils, CheckCircle2, ArrowRight } from 'lucide-react';
import { sound } from '../services/audio';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishTutorial?: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onFinishTutorial
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [practiceChoice, setPracticeChoice] = useState<'A' | 'B' | null>(null);
  const [practicePower, setPracticePower] = useState(60);
  const [practiceWater, setPracticeWater] = useState(75);

  if (!isOpen) return null;

  const handlePracticeDecision = (choice: 'A' | 'B') => {
    sound.playSuccess();
    setPracticeChoice(choice);
    if (choice === 'A') {
      setPracticePower(85);
      setPracticeWater(60);
    } else {
      setPracticePower(70);
      setPracticeWater(75);
    }
  };

  const handleComplete = () => {
    sound.playFanfare();
    onFinishTutorial?.();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cadet Commander Training Academy"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0B1016]/80 select-none"
    >
      <div className="relative w-full max-w-2xl bg-[#19232D] border border-[#35434E] rounded-lg p-5 sm:p-6 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#35434E] pb-4 mb-5 gap-4">
          <div>
            <div className="text-xs font-mono-tech text-[#78A9C8] mb-0.5">
              Step {step} of 3 · {step === 1 ? 'Your Role' : step === 2 ? 'The 4 Survival Loops' : 'Interactive Practice'}
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#F0F2F3]">
              Outpost Engineering Handbook
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close training handbook"
            className="w-9 h-9 rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#AAB5BE] hover:text-[#F0F2F3] flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-lg bg-[#202C36] border border-[#35434E]">
              <h3 className="font-semibold text-[#F0F2F3] text-sm sm:text-base mb-1.5">
                Welcome to Mission Control
              </h3>
              <p className="text-xs sm:text-sm text-[#AAB5BE] leading-relaxed">
                On Earth, breathable air, liquid water, food supply, and a magnetic shield protect you automatically.
              </p>
              <p className="text-xs sm:text-sm text-[#F0F2F3] mt-2 leading-relaxed">
                On the Moon and Mars, there is no breathable atmosphere, no surface liquid water, and minimal radiation protection. Every system inside your outpost must be engineered and balanced.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#141D26] border border-[#35434E]">
              <h4 className="font-semibold text-[#D2A45F] text-xs mb-1.5">
                Engineering Trade-Offs
              </h4>
              <p className="text-xs sm:text-sm text-[#AAB5BE] leading-relaxed">
                Every design choice carries a cost. Routing electrical power to science instruments leaves less margin for life-support heaters; thicker shielding reduces payload capacity for rations. Keep all vital reserves above zero while completing research goals.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-3 mb-6">
            <p className="text-xs sm:text-sm text-[#AAB5BE]">
              Monitor these four coupled survival systems on your HUD at all times:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg bg-[#202C36] border border-[#35434E] flex items-start gap-3">
                <Wind className="w-4 h-4 text-[#78A9C8] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#F0F2F3] text-xs sm:text-sm">1. Life Support (ECLSS)</h4>
                  <p className="text-xs text-[#AAB5BE] mt-1 leading-relaxed">
                    Recovers water and scrubs CO₂ so crew members maintain breathable oxygen.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#202C36] border border-[#35434E] flex items-start gap-3">
                <Zap className="w-4 h-4 text-[#D2A45F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#F0F2F3] text-xs sm:text-sm">2. Energy &amp; Power</h4>
                  <p className="text-xs text-[#AAB5BE] mt-1 leading-relaxed">
                    Solar arrays and battery storage keep heaters, life support, and labs online.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#202C36] border border-[#35434E] flex items-start gap-3">
                <Shield className="w-4 h-4 text-[#78A9C8] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#F0F2F3] text-xs sm:text-sm">3. Radiation Protection</h4>
                  <p className="text-xs text-[#AAB5BE] mt-1 leading-relaxed">
                    Regolith shielding and pressurized habitats protect crew during solar storms.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#202C36] border border-[#35434E] flex items-start gap-3">
                <Utensils className="w-4 h-4 text-[#79A88B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#F0F2F3] text-xs sm:text-sm">4. Food &amp; Hydration</h4>
                  <p className="text-xs text-[#AAB5BE] mt-1 leading-relaxed">
                    Hydroponic crops and melted crater ice sustain crew stamina during EVA traverses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-lg bg-[#202C36] border border-[#35434E]">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-mono-tech text-[#78A9C8]">
                  Practice Scenario · Dust on Solar Arrays
                </span>
                <span className="text-xs font-mono-tech text-[#D2A45F]">Power Alert</span>
              </div>
              <p className="text-xs sm:text-sm text-[#AAB5BE] leading-relaxed mb-4">
                A surface dust event coated your photovoltaic panels and output is dropping. Select a maintenance response to see how the meters react:
              </p>

              {/* Practice Telemetry Bars */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 rounded-md bg-[#111820] border border-[#35434E]">
                <div>
                  <div className="flex justify-between text-xs font-mono-tech text-[#F0F2F3] mb-1.5 tabular-nums">
                    <span className="text-[#AAB5BE]">Power Grid</span>
                    <span className="text-[#D2A45F]">{practicePower}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#202C36] overflow-hidden">
                    <div
                      className="h-full bg-[#D2A45F] transition-all duration-300"
                      style={{ width: `${practicePower}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono-tech text-[#F0F2F3] mb-1.5 tabular-nums">
                    <span className="text-[#AAB5BE]">Water Reserves</span>
                    <span className="text-[#78A9C8]">{practiceWater}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#202C36] overflow-hidden">
                    <div
                      className="h-full bg-[#78A9C8] transition-all duration-300"
                      style={{ width: `${practiceWater}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handlePracticeDecision('A')}
                  className={`p-3.5 rounded-lg border text-left transition-colors ${
                    practiceChoice === 'A'
                      ? 'bg-[#19232D] border-[#78A9C8]'
                      : 'bg-[#141D26] border-[#35434E] hover:border-[#4F6270]'
                  }`}
                >
                  <div className="font-semibold text-xs sm:text-sm text-[#F0F2F3] mb-1">
                    Option A: High-Pressure Steam Wash
                  </div>
                  <div className="text-xs text-[#79A88B] font-mono-tech">+25% Power Restored</div>
                  <div className="text-xs text-[#C97979] font-mono-tech">-15% Water Consumed</div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePracticeDecision('B')}
                  className={`p-3.5 rounded-lg border text-left transition-colors ${
                    practiceChoice === 'B'
                      ? 'bg-[#19232D] border-[#78A9C8]'
                      : 'bg-[#141D26] border-[#35434E] hover:border-[#4F6270]'
                  }`}
                >
                  <div className="font-semibold text-xs sm:text-sm text-[#F0F2F3] mb-1">
                    Option B: Mechanical Wiper Brush
                  </div>
                  <div className="text-xs text-[#79A88B] font-mono-tech">+10% Power Restored</div>
                  <div className="text-xs text-[#AAB5BE] font-mono-tech">0% Water Consumed</div>
                </button>
              </div>

              {practiceChoice && (
                <div className="mt-3 p-3 rounded-md bg-[#141D26] border border-[#35434E] text-xs text-[#AAB5BE] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#79A88B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#F0F2F3]">Observation:</span>{' '}
                    {practiceChoice === 'A'
                      ? 'Option A restored maximum power immediately, at the cost of drinking water reserves—useful in emergencies, risky when water is scarce.'
                      : 'Option B conserved 100% of your water reserves while partially recovering solar output. Every operational decision involves trade-offs.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-[#35434E] pt-4 mt-auto">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setStep((s) => (s - 1) as 1 | 2);
              }}
              className="px-4 py-2 min-h-[40px] rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#F0F2F3] text-xs sm:text-sm font-medium transition-colors"
            >
              Previous
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setStep((s) => (s + 1) as 2 | 3);
              }}
              className="px-5 py-2 min-h-[40px] rounded-lg bg-[#78A9C8] hover:bg-[#8BB8D4] text-[#0E171F] font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              className="px-5 py-2 min-h-[40px] rounded-lg bg-[#79A88B] hover:bg-[#8AB59B] text-[#0E171F] font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <span>Complete Handbook</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
