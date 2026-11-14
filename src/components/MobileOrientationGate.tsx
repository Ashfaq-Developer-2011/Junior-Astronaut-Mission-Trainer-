import React, { useState } from 'react';
import { RotateCw, Home, ArrowRight } from 'lucide-react';
import { sound } from '../services/audio';

interface MobileOrientationGateProps {
  onDismissFallback: () => void;
  onExitHome?: () => void;
}

export const MobileOrientationGate: React.FC<MobileOrientationGateProps> = ({
  onDismissFallback,
  onExitHome
}) => {
  const [lockMessage, setLockMessage] = useState<string | null>(null);

  const handleTryLandscape = async () => {
    sound.playClick();
    setLockMessage(null);
    try {
      const rootEl = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      if (!document.fullscreenElement) {
        if (rootEl.requestFullscreen) {
          await rootEl.requestFullscreen().catch(() => {});
        } else if (rootEl.webkitRequestFullscreen) {
          await rootEl.webkitRequestFullscreen().catch(() => {});
        }
      }
      const orientationApi = screen.orientation as ScreenOrientation & {
        lock?: (orientation: string) => Promise<void>;
      };
      if (orientationApi && typeof orientationApi.lock === 'function') {
        await orientationApi.lock('landscape');
        return;
      }
      setLockMessage('Turn your phone sideways, or tap Continue Anyway.');
    } catch {
      setLockMessage('Auto-rotate is controlled by your device. Turn sideways or tap Continue Anyway.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Landscape orientation recommended"
      className="fixed inset-0 z-50 bg-[#111820]/96 flex items-center justify-center p-6 select-none hud-safe-area"
    >
      <div className="w-full max-w-sm bg-[#19232D] border border-[#35434E] rounded-lg p-6 text-center">
        {/* Rotating Phone Illustration */}
        <div className="mx-auto mb-5 w-20 h-16 flex items-center justify-center">
          <svg
            viewBox="0 0 88 64"
            className="w-20 h-16 text-[#78A9C8]"
            fill="none"
            aria-hidden="true"
          >
            {/* Portrait outline (faint) */}
            <rect
              x="12"
              y="10"
              width="22"
              height="38"
              rx="4"
              stroke="#35434E"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
            {/* Arrow */}
            <path
              d="M37 16 C45 12, 51 14, 54 20"
              stroke="#78A9C8"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M50 20 L54.5 21 L55 16"
              stroke="#78A9C8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Landscape outline (target) */}
            <rect
              x="40"
              y="26"
              width="40"
              height="24"
              rx="4"
              fill="#202C36"
              stroke="#78A9C8"
              strokeWidth="2"
            />
            <circle cx="75" cy="38" r="1.5" fill="#78A9C8" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-[#F0F2F3] mb-2">
          Landscape Mode Required
        </h2>
        <p className="text-sm text-[#AAB5BE] leading-relaxed mb-5">
          Rotate your device to landscape to begin your mission.
        </p>

        {lockMessage && (
          <p className="text-xs text-[#D2A45F] mb-4 leading-snug">
            {lockMessage}
          </p>
        )}

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              void handleTryLandscape();
            }}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#78A9C8] hover:bg-[#8BB8D4] text-[#0E171F] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            <span>Switch to Landscape</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onDismissFallback();
            }}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#F0F2F3] font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors"
          >
            <span>Continue Anyway</span>
            <ArrowRight className="w-4 h-4 text-[#AAB5BE]" />
          </button>

          {onExitHome && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onExitHome();
              }}
              className="w-full min-h-[40px] px-4 py-2 rounded-lg text-[#AAB5BE] hover:text-[#F0F2F3] text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Main Menu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
