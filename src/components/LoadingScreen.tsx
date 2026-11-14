import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Radio } from 'lucide-react';
import { PlanetType } from '../types/survival';
import { sound } from '../services/audio';

interface LoadingScreenProps {
  planet: PlanetType;
  callsign: string;
  avatar: string;
  onFinishLoading: () => void;
}

const DESCENT_STAGES = [
  { progress: 15, text: 'PLSS Life Support Diagnostic: Suit O₂ Nominal (100%)' },
  { progress: 35, text: 'De-Orbit Trajectory Burn: Descent Retro-Thrusters Firing' },
  { progress: 60, text: 'Terrain-Relative LiDAR Scan: Surface Landing Zone Clear' },
  { progress: 85, text: 'Terminal Approach: Landing Struts Deployed & Locked' },
  { progress: 100, text: 'Touchdown Confirmed: Depressurizing EVA Airlock' }
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  planet,
  callsign,
  avatar,
  onFinishLoading
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStageText, setCurrentStageText] = useState(DESCENT_STAGES[0].text);
  const [altitudeKm, setAltitudeKm] = useState(planet === 'moon' ? 100 : 250);
  const completedRef = useRef(false);

  const isMoon = planet === 'moon';

  const completeOnce = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onFinishLoading();
  };

  useEffect(() => {
    sound.playLowRumble();

    const startTime = Date.now();
    const duration = 2800;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawPct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(rawPct);

      const initialAlt = isMoon ? 100 : 250;
      const currentAlt = Math.max(0, Math.round(initialAlt * (1 - rawPct / 100)));
      setAltitudeKm(currentAlt);

      const matching = DESCENT_STAGES.find(s => rawPct <= s.progress);
      if (matching) {
        setCurrentStageText(matching.text);
      }

      if (rawPct === 35 || rawPct === 60 || rawPct === 85) {
        sound.playBeep();
      }

      if (rawPct >= 100) {
        clearInterval(interval);
        sound.playSuccess();
        setTimeout(() => {
          completeOnce();
        }, 350);
      }
    }, 45);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMoon]);

  const handleSkip = () => {
    sound.playClick();
    completeOnce();
  };

  return (
    <div className="h-full w-full bg-[#111820] text-[#F0F2F3] flex flex-col justify-between p-4 sm:p-8 select-none overflow-y-auto">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between border-b border-[#35434E] pb-4 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/game-icon.png"
            alt="Oops! I'm an Astronaut"
            className="w-9 h-9 rounded-lg object-cover border border-[#35434E] shrink-0"
          />
          <div className="min-w-0">
            <div className="text-xs font-mono-tech text-[#AAB5BE] mb-0.5 truncate">
              Flight Trajectory &amp; Descent Telemetry
            </div>
            <h1 className="text-base sm:text-lg font-semibold text-[#F0F2F3] truncate">
              {isMoon ? 'Artemis Base Camp Descent' : 'Jezero Crater Atmospheric Entry'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-[#AAB5BE] font-mono-tech shrink-0">
          <span>{avatar}</span>
          <span className="text-[#F0F2F3] font-medium">{callsign}</span>
        </div>
      </header>

      {/* Main Mission Display */}
      <main className="max-w-3xl w-full mx-auto my-auto flex flex-col items-center py-6 sm:py-8">
        {/* Clean Planetary Reference Sphere */}
        <div className="mb-6 flex flex-col items-center">
          <div
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-[#35434E] relative overflow-hidden ${
              isMoon
                ? 'bg-[#19232D]'
                : 'bg-gradient-to-br from-[#8D5037] via-[#683724] to-[#2C1710]'
            }`}
          >
            {isMoon ? (
              <img
                src="/textures/moon-nasa.png"
                alt="NASA Lunar Surface Topography"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover contrast-110 brightness-95"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,220,195,0.22)_0%,transparent_65%)]" />
            )}
          </div>
          <div className="mt-3 text-xs font-mono-tech text-[#78A9C8] tabular-nums">
            ALT {altitudeKm} km · {progress}%
          </div>
        </div>

        {/* Destination Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#F0F2F3] mb-1">
            {isMoon ? 'Moon Base Camp' : 'Mars Jezero Outpost'}
          </h2>
          <p className="text-xs sm:text-sm font-mono-tech text-[#AAB5BE]">
            {isMoon
              ? '89.9° S (Shackleton Crater Rim) · 1/6th Earth Gravity'
              : '18.38° N, 77.58° E (Ancient River Delta) · 0.38g Gravity'}
          </p>
        </div>

        {/* Divided Environmental Telemetry Strip */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 bg-[#19232D] border border-[#35434E] rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-[#35434E] mb-6 text-left">
          <div className="p-3">
            <span className="text-[11px] text-[#8895A0] block mb-0.5">Atmosphere</span>
            <span className="text-xs font-mono-tech font-medium text-[#F0F2F3]">
              {isMoon ? 'Vacuum (0 bar)' : 'Thin CO₂ (0.006 bar)'}
            </span>
          </div>

          <div className="p-3">
            <span className="text-[11px] text-[#8895A0] block mb-0.5">Surface Gravity</span>
            <span className="text-xs font-mono-tech font-medium text-[#F0F2F3]">
              {isMoon ? '1.62 m/s² (0.16g)' : '3.72 m/s² (0.38g)'}
            </span>
          </div>

          <div className="p-3">
            <span className="text-[11px] text-[#8895A0] block mb-0.5">Temperature</span>
            <span className="text-xs font-mono-tech font-medium text-[#F0F2F3]">
              {isMoon ? '-130°C / +120°C' : '-63°C (-81°F)'}
            </span>
          </div>

          <div className="p-3">
            <span className="text-[11px] text-[#8895A0] block mb-0.5">Primary Resource</span>
            <span className="text-xs font-mono-tech font-medium text-[#78A9C8]">
              {isMoon ? 'Crater Shadow Ice' : 'Subsurface Permafrost'}
            </span>
          </div>
        </div>

        {/* Descent Progress Panel */}
        <div className="w-full bg-[#19232D] border border-[#35434E] rounded-lg p-4">
          <div className="flex items-center justify-between gap-3 text-xs font-mono-tech mb-2.5">
            <div className="flex items-center gap-2 text-[#F0F2F3] min-w-0">
              <Radio className="w-3.5 h-3.5 text-[#78A9C8] shrink-0" />
              <span className="truncate">{currentStageText}</span>
            </div>
            <span className="text-[#78A9C8] font-medium tabular-nums shrink-0">{progress}%</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[#111820] overflow-hidden">
            <div
              className="h-full bg-[#78A9C8] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3 text-xs text-[#AAB5BE] leading-relaxed">
            {isMoon
              ? 'Apollo & Artemis Context: Your landing craft is modeled from NASA’s Apollo Lunar Module (LM-5). Polar ice permanently shielded in crater darkness can be melted into water and split into propellant.'
              : 'Perseverance Context: The Jezero crater floor contains ancient delta sediments and clays that help scientists study whether microbial life once existed on Mars.'}
          </p>
        </div>
      </main>

      {/* Footer & Skip Option */}
      <footer className="max-w-4xl w-full mx-auto flex items-center justify-between text-xs text-[#8895A0] pt-4 border-t border-[#35434E]">
        <span className="font-mono-tech">EVA Suit Pressurization Nominal</span>

        <button
          type="button"
          onClick={handleSkip}
          className="px-4 py-2 min-h-[40px] rounded-lg bg-[#19232D] hover:bg-[#202C36] border border-[#35434E] text-[#F0F2F3] text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <span>Touchdown Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </footer>
    </div>
  );
};
