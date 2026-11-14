import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import moonPreview from '../assets/images/moon_base_preview_1794585718613.jpg';
import marsPreview from '../assets/images/mars_outpost_preview_1794585719761.jpg';
import { PlanetType } from '../types/survival';
import { sound } from '../services/audio';

interface MissionLaunchScreenProps {
  planet: PlanetType;
  callsign: string;
  avatar: string;
  onFinishLoading: () => void;
}

const LAUNCH_STEPS = [
  { threshold: 25, message: 'Verifying EVA suit pressure and life-support reserves...' },
  { threshold: 55, message: 'Aligning descent trajectory to landing perimeter...' },
  { threshold: 85, message: 'Scanning surface terrain and deploying landing struts...' },
  { threshold: 100, message: 'Touchdown confirmed. Opening airlock.' }
];

export const MissionLaunchScreen: React.FC<MissionLaunchScreenProps> = ({
  planet,
  callsign,
  avatar,
  onFinishLoading
}) => {
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  const isMoon = planet === 'moon';
  const currentStep = LAUNCH_STEPS.find((s) => progress <= s.threshold) || LAUNCH_STEPS[LAUNCH_STEPS.length - 1];

  const completeOnce = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onFinishLoading();
  };

  useEffect(() => {
    sound.playLowRumble();
    const startTime = Date.now();
    const duration = 2200;

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        window.clearInterval(interval);
        sound.playSuccess();
        window.setTimeout(() => {
          completeOnce();
        }, 300);
      }
    }, 45);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-[100dvh] w-full overflow-y-auto bg-[#111820] text-[#F0F2F3] flex flex-col justify-center items-center p-4 sm:p-8 select-none hud-safe-area">
      {/* Subtle Destination Backdrop */}
      <div className="fixed inset-0 pointer-events-none">
        <img
          src={isMoon ? moonPreview : marsPreview}
          alt={isMoon ? 'Moon Base landing perimeter' : 'Mars Outpost landing perimeter'}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[#111820]/75" aria-hidden="true" />
      </div>

      {/* Centered Launch Sequence Card */}
      <div className="relative z-10 w-full max-w-lg bg-[#19232D]/95 border border-[#35434E] rounded-lg p-5 sm:p-8 my-auto">
        <div className="flex items-center gap-3.5 mb-3">
          <img
            src="/game-icon.png"
            alt="Oops! I'm an Astronaut"
            className="w-10 h-10 rounded-lg object-cover border border-[#35434E] shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 text-xs font-mono-tech text-[#78A9C8] mb-0.5">
              <span>Mission M-01 · First Landing</span>
              <span>{isMoon ? 'Moon Base' : 'Mars Outpost'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#F0F2F3] truncate">
              Launching {isMoon ? 'Moon Base' : 'Mars Outpost'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-[#AAB5BE] mb-6">
          <span>{avatar}</span>
          <span>Commander</span>
          <span className="font-mono-tech text-[#F0F2F3] font-medium">{callsign}</span>
        </div>

        {/* Clean Progress Bar & Launch Message */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 text-xs mb-2">
            <span className="text-[#AAB5BE]">{currentStep.message}</span>
            <span className="font-mono-tech text-[#78A9C8] tabular-nums shrink-0">{progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#111820] overflow-hidden">
            <div
              className="h-full bg-[#78A9C8] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              completeOnce();
            }}
            className="px-4 py-2 min-h-[40px] rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#F0F2F3] text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Enter Surface</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
