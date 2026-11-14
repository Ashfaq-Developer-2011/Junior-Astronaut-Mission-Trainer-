import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Move, Hand, ArrowUp, Zap } from 'lucide-react';

interface MobileVirtualJoystickProps {
  onMove: (x: number, y: number) => void;
  disabled?: boolean;
}

const OUTER_RADIUS = 46;
const MAX_TRAVEL = 32;
const DEAD_ZONE = 0.16;

export const MobileVirtualJoystick: React.FC<MobileVirtualJoystickProps> = ({
  onMove,
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  const resetStick = useCallback(() => {
    activePointerIdRef.current = null;
    setIsActive(false);
    setKnobOffset({ x: 0, y: 0 });
    onMove(0, 0);
  }, [onMove]);

  useEffect(() => {
    if (disabled) {
      resetStick();
    }
  }, [disabled, resetStick]);

  useEffect(() => {
    const handleGlobalReset = () => resetStick();
    window.addEventListener('blur', handleGlobalReset);
    const handleVis = () => {
      if (document.hidden) resetStick();
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => {
      window.removeEventListener('blur', handleGlobalReset);
      document.removeEventListener('visibilitychange', handleVis);
      onMove(0, 0);
    };
  }, [onMove, resetStick]);

  const updateFromClient = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rawDx = clientX - centerX;
    const rawDy = clientY - centerY;
    const dist = Math.hypot(rawDx, rawDy);

    const clampedDist = Math.min(dist, MAX_TRAVEL);
    const angle = Math.atan2(rawDy, rawDx);
    const clampedX = dist > 0 ? Math.cos(angle) * clampedDist : 0;
    const clampedY = dist > 0 ? Math.sin(angle) * clampedDist : 0;

    setKnobOffset({ x: clampedX, y: clampedY });

    const normMag = clampedDist / MAX_TRAVEL;
    if (normMag < DEAD_ZONE) {
      onMove(0, 0);
      return;
    }

    const scaledMag = (normMag - DEAD_ZONE) / (1 - DEAD_ZONE);
    const dirX = dist > 0 ? rawDx / dist : 0;
    const dirY = dist > 0 ? rawDy / dist : 0;

    // Screen Y down is backward (-moveY); up is forward (+moveY)
    onMove(dirX * scaledMag, -dirY * scaledMag);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || activePointerIdRef.current !== null) return;
    e.preventDefault();
    e.stopPropagation();
    activePointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsActive(true);
    updateFromClient(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    updateFromClient(e.clientX, e.clientY);
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    resetStick();
  };

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Movement joystick"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      onLostPointerCapture={() => resetStick()}
      style={{ width: OUTER_RADIUS * 2, height: OUTER_RADIUS * 2 }}
      className={`relative rounded-full touch-none select-none flex items-center justify-center transition-colors ${
        isActive
          ? 'bg-[#19232D]/90 border-2 border-[#78A9C8]'
          : 'bg-[#111820]/75 border border-[#35434E]'
      }`}
    >
      {/* Directional cross ticks */}
      <div className="absolute inset-3 rounded-full border border-[#35434E]/60 pointer-events-none" />
      <span className="absolute top-1.5 text-[9px] font-mono-tech text-[#8895A0] pointer-events-none">
        ▲
      </span>
      <span className="absolute bottom-1.5 text-[9px] font-mono-tech text-[#8895A0] pointer-events-none">
        ▼
      </span>
      <span className="absolute left-2 text-[9px] font-mono-tech text-[#8895A0] pointer-events-none">
        ◀
      </span>
      <span className="absolute right-2 text-[9px] font-mono-tech text-[#8895A0] pointer-events-none">
        ▶
      </span>

      {/* Movable thumb puck */}
      <div
        style={{
          transform: `translate3d(${knobOffset.x}px, ${knobOffset.y}px, 0)`
        }}
        className={`w-10 h-10 rounded-full border flex items-center justify-center pointer-events-none transition-transform duration-75 ${
          isActive
            ? 'bg-[#78A9C8] border-[#F0F2F3]/50 text-[#0E171F]'
            : 'bg-[#202C36] border-[#536878] text-[#AAB5BE]'
        }`}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-current opacity-80" />
      </div>
    </div>
  );
};

interface MobileCameraPadProps {
  onOrbitDelta: (yawDelta: number, pitchDelta: number) => void;
  disabled?: boolean;
}

export const MobileCameraPad: React.FC<MobileCameraPadProps> = ({
  onOrbitDelta,
  disabled = false
}) => {
  const activePointerIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const resetPad = useCallback(() => {
    activePointerIdRef.current = null;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (disabled) resetPad();
  }, [disabled, resetPad]);

  useEffect(() => {
    window.addEventListener('blur', resetPad);
    return () => window.removeEventListener('blur', resetPad);
  }, [resetPad]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || activePointerIdRef.current !== null) return;
    e.preventDefault();
    e.stopPropagation();
    activePointerIdRef.current = e.pointerId;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    onOrbitDelta(dx * 0.0062, dy * 0.0052);
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    resetPad();
  };

  return (
    <div
      role="application"
      aria-label="Camera look drag area"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      onLostPointerCapture={() => resetPad()}
      className={`w-36 h-20 rounded-lg touch-none select-none flex flex-col items-center justify-center gap-1 transition-colors ${
        isDragging
          ? 'bg-[#19232D]/80 border border-[#78A9C8]'
          : 'bg-[#111820]/55 border border-[#35434E]/80'
      }`}
    >
      <Move className={`w-4 h-4 ${isDragging ? 'text-[#78A9C8]' : 'text-[#AAB5BE]'}`} />
      <span className="text-[10px] font-mono-tech text-[#AAB5BE]">
        Drag to Look
      </span>
    </div>
  );
};

interface MobileActionClusterProps {
  hasInteractTarget: boolean;
  sprintActive: boolean;
  onToggleSprint: () => void;
  onJump: (active: boolean) => void;
  onInteract: (active: boolean) => void;
}

export const MobileActionCluster: React.FC<MobileActionClusterProps> = ({
  hasInteractTarget,
  sprintActive,
  onToggleSprint,
  onJump,
  onInteract
}) => {
  return (
    <div className="flex items-end gap-2 touch-none select-none">
      {/* Sprint Toggle Button */}
      <button
        type="button"
        aria-pressed={sprintActive}
        aria-label={sprintActive ? 'Sprint enabled' : 'Enable sprint'}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleSprint();
        }}
        className={`w-12 h-12 rounded-full border flex flex-col items-center justify-center text-[10px] font-mono-tech transition-colors ${
          sprintActive
            ? 'bg-[#78A9C8] border-[#F0F2F3]/50 text-[#0E171F] font-semibold'
            : 'bg-[#19232D]/85 border-[#35434E] text-[#F0F2F3]'
        }`}
      >
        <Zap className="w-3.5 h-3.5 mb-0.5" />
        <span>RUN</span>
      </button>

      {/* Jump Button */}
      <button
        type="button"
        aria-label="Jump"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.setPointerCapture(e.pointerId);
          onJump(true);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          onJump(false);
        }}
        onPointerCancel={() => onJump(false)}
        onLostPointerCapture={() => onJump(false)}
        className="w-13 h-13 rounded-full bg-[#19232D]/85 active:bg-[#78A9C8] active:text-[#0E171F] border border-[#35434E] text-[#F0F2F3] flex flex-col items-center justify-center text-[10px] font-mono-tech transition-colors"
      >
        <ArrowUp className="w-4 h-4 mb-0.5" />
        <span>JUMP</span>
      </button>

      {/* Primary Interact / Mine Button */}
      <button
        type="button"
        aria-label="Interact or Mine"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.setPointerCapture(e.pointerId);
          onInteract(true);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          onInteract(false);
        }}
        onPointerCancel={() => onInteract(false)}
        onLostPointerCapture={() => onInteract(false)}
        className={`w-14 h-14 rounded-full border flex flex-col items-center justify-center text-[10px] font-mono-tech font-semibold transition-colors ${
          hasInteractTarget
            ? 'bg-[#78A9C8] active:bg-[#8BB8D4] border-[#F0F2F3]/60 text-[#0E171F]'
            : 'bg-[#202C36]/90 active:bg-[#78A9C8] active:text-[#0E171F] border-[#35434E] text-[#F0F2F3]'
        }`}
      >
        <Hand className="w-4 h-4 mb-0.5" />
        <span>USE</span>
      </button>
    </div>
  );
};
