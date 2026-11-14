import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Info, X } from 'lucide-react';
import moonPreview from '../assets/images/moon_base_preview_1794585718613.jpg';
import marsPreview from '../assets/images/mars_outpost_preview_1794585719761.jpg';
import { PlanetType } from '../types/survival';
import { sound } from '../services/audio';

interface DestinationSelectionScreenProps {
  selectedPlanet: PlanetType;
  onSelectPlanet: (planet: PlanetType) => void;
  onBack: () => void;
  onContinue: () => void;
}

interface DestinationItem {
  id: PlanetType;
  name: string;
  tagline: string;
  image: string;
  imageAlt: string;
  characteristics: [string, string, string];
  scienceOverview: string;
  referenceContext: string;
  missionFocus: string;
}

const DESTINATIONS: DestinationItem[] = [
  {
    id: 'moon',
    name: 'Moon Base',
    tagline: 'Build your outpost on the lunar surface.',
    image: moonPreview,
    imageAlt: 'Moon Base habitat near a shadowed lunar crater with solar panels',
    characteristics: [
      'Vacuum environment',
      'Low gravity',
      'Water-ice exploration'
    ],
    scienceOverview:
      'Set in an Artemis-inspired lunar south pole basin where sunlit crater rims enable solar power and shadowed craters preserve water-ice deposits.',
    referenceContext:
      'Informed by NASA Lunar Reconnaissance Orbiter (LRO) polar mapping, RadLab spaceflight dosimetry, and NASA 3D Resources.',
    missionFocus:
      'Deploy solar power quickly, pressurize your crew habitat, harvest lunar ice for hydration and oxygen, and guard against unshielded solar particle events.'
  },
  {
    id: 'mars',
    name: 'Mars Outpost',
    tagline: 'Establish a research base on the Red Planet.',
    image: marsPreview,
    imageAlt: 'Mars Outpost dome and solar array across iron-rich Jezero Crater terrain',
    characteristics: [
      'Thin CO₂ atmosphere',
      'Iron-rich terrain',
      'Dust events'
    ],
    scienceOverview:
      'Inspired by NASA Mars Trek Jezero Crater landing sites featuring ancient delta sediments, basaltic ridges, and subsurface ice reservoirs.',
    referenceContext:
      'Informed by Mars Trek orbital terrain, NASA DONKI solar activity tracking, and CSA closed-loop greenhouse nutrition research.',
    missionFocus:
      'Balance solar and battery reserves through Martian dust storms, cultivate hydroponic crops, and analyze ancient biosignature core samples.'
  }
];

export const DestinationSelectionScreen: React.FC<DestinationSelectionScreenProps> = ({
  selectedPlanet,
  onSelectPlanet,
  onBack,
  onContinue
}) => {
  const [learnMoreId, setLearnMoreId] = useState<PlanetType | null>(null);
  const learnMoreDest = DESTINATIONS.find((d) => d.id === learnMoreId) || null;

  return (
    <div className="h-[100dvh] w-full overflow-y-auto bg-[#111820] text-[#F0F2F3] flex flex-col justify-between select-none">
      {/* Top Bar */}
      <header className="w-full border-b border-[#35434E] bg-[#111820] shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="px-3 py-2 min-h-[40px] rounded-lg hover:bg-[#19232D] text-[#AAB5BE] hover:text-[#F0F2F3] text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono-tech text-[#AAB5BE]">
            <img
              src="/game-icon.png"
              alt="Oops! I'm an Astronaut"
              className="w-6 h-6 rounded-md object-cover border border-[#35434E]"
            />
            <span>Destination Selection</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 my-auto">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F0F2F3] mb-1">
            Choose Your Destination
          </h1>
          <p className="text-sm text-[#AAB5BE]">
            Select where your crew will establish their outpost.
          </p>
        </div>

        {/* Two Large Visual Destination Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-5 sm:mb-6">
          {DESTINATIONS.map((dest) => {
            const isSelected = selectedPlanet === dest.id;
            return (
              <div
                key={dest.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => {
                  sound.playClick();
                  onSelectPlanet(dest.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    sound.playClick();
                    onSelectPlanet(dest.id);
                  }
                }}
                className={`group rounded-lg border text-left overflow-hidden flex flex-col cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#78A9C8] ${
                  isSelected
                    ? 'bg-[#202C36] border-[#78A9C8]'
                    : 'bg-[#19232D] border-[#35434E] hover:border-[#536878]'
                }`}
              >
                <div className="relative w-full aspect-[16/9] bg-[#111820] overflow-hidden border-b border-[#35434E]">
                  <img
                    src={dest.image}
                    alt={dest.imageAlt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  {isSelected && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111820]/90 border border-[#78A9C8] text-xs font-medium text-[#78A9C8]">
                      <Check className="w-3.5 h-3.5" />
                      Selected
                    </span>
                  )}
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h2 className="text-lg sm:text-xl font-semibold text-[#F0F2F3]">
                        {dest.name}
                      </h2>
                    </div>

                    <p className="text-sm text-[#AAB5BE] mb-3">
                      {dest.tagline}
                    </p>

                    <ul className="space-y-1.5 text-sm text-[#AAB5BE]">
                      {dest.characteristics.map((trait) => (
                        <li key={trait} className="flex items-center gap-2.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isSelected ? 'bg-[#78A9C8]' : 'bg-[#778590]'
                            }`}
                            aria-hidden="true"
                          />
                          <span>{trait}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-[#35434E]/80 flex items-center justify-between">
                    <span className="text-xs font-mono-tech text-[#8895A0]">
                      {isSelected ? 'Active Selection' : 'Click card to select'}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        setLearnMoreId(dest.id);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#78A9C8] hover:text-[#9FC6DE] py-1 px-2 -mr-2 rounded hover:bg-[#111820]/60 transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Learn More</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Action */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="px-5 py-3 min-h-[46px] rounded-lg bg-[#19232D] hover:bg-[#202C36] border border-[#35434E] text-[#F0F2F3] text-sm font-medium inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onContinue();
            }}
            className="px-7 py-3 min-h-[46px] rounded-lg bg-[#78A9C8] hover:bg-[#8BB8D4] active:bg-[#6A99B7] text-[#0E171F] font-semibold text-sm sm:text-base inline-flex items-center gap-2 transition-colors"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Optional Destination Details Modal */}
      {learnMoreDest && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${learnMoreDest.name} Environmental Details`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1016]/85"
          onClick={() => setLearnMoreId(null)}
        >
          <div
            className="w-full max-w-lg bg-[#19232D] border border-[#35434E] rounded-lg p-5 sm:p-6 text-left max-h-[88dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#35434E] pb-3.5 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-[#F0F2F3]">
                  {learnMoreDest.name}
                </h2>
                <p className="text-xs text-[#AAB5BE]">{learnMoreDest.tagline}</p>
              </div>
              <button
                type="button"
                onClick={() => setLearnMoreId(null)}
                aria-label="Close destination details"
                className="w-9 h-9 rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#AAB5BE] hover:text-[#F0F2F3] flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm text-[#AAB5BE] leading-relaxed">
              <div>
                <div className="text-xs font-medium text-[#78A9C8] mb-1">
                  Environment Overview
                </div>
                <p>{learnMoreDest.scienceOverview}</p>
              </div>

              <div>
                <div className="text-xs font-medium text-[#78A9C8] mb-1">
                  Outpost Strategy
                </div>
                <p>{learnMoreDest.missionFocus}</p>
              </div>

              <div className="pt-2 border-t border-[#35434E] text-xs text-[#8895A0]">
                {learnMoreDest.referenceContext}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#35434E] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setLearnMoreId(null)}
                className="px-4 py-2 min-h-[40px] rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#F0F2F3] text-sm font-medium transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSelectPlanet(learnMoreDest.id);
                  setLearnMoreId(null);
                }}
                className="px-4 py-2 min-h-[40px] rounded-lg bg-[#78A9C8] hover:bg-[#8BB8D4] text-[#0E171F] text-sm font-semibold transition-colors"
              >
                Select {learnMoreDest.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
