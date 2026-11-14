import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

export interface CameraOrbitDelta {
  yawDelta: number;
  pitchDelta: number;
}

export interface ThirdPersonCameraProps {
  target: THREE.Vector3 | [number, number, number];
  distance?: number;
  minDistance?: number;
  maxDistance?: number;
  heightOffset?: number;
  mouseSensitivity?: number;
  minPitch?: number;
  maxPitch?: number;
  damping?: number;
  cameraOrbitDeltaRef?: React.MutableRefObject<CameraOrbitDelta>;
  getGroundHeight?: (x: number, z: number) => number;
  onCameraYawChange?: (yaw: number) => void;
}

/**
 * ThirdPersonCamera: Smooth Orbiting 3rd-Person Camera for R3F
 * Tracks the player avatar, responds to mouse drag / wheel zoom / mobile touch orbit, and prevents ground clipping.
 */
export const ThirdPersonCamera: React.FC<ThirdPersonCameraProps> = ({
  target,
  distance = 8.5,
  minDistance = 3.5,
  maxDistance = 20.0,
  heightOffset = 1.4,
  mouseSensitivity = 0.003,
  minPitch = 0.06,
  maxPitch = 1.25,
  damping = 0.12,
  cameraOrbitDeltaRef,
  getGroundHeight,
  onCameraYawChange
}) => {
  const { camera, gl } = useThree();

  const yawRef = useRef(0);
  const pitchRef = useRef(0.35);
  const distRef = useRef(distance);
  const currentPosRef = useRef(new THREE.Vector3());
  const currentLookAtRef = useRef(new THREE.Vector3());
  const desiredPosScratchRef = useRef(new THREE.Vector3());
  const desiredLookAtScratchRef = useRef(new THREE.Vector3());
  const isMouseDownRef = useRef(false);

  useEffect(() => {
    const dom = gl.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      // Right click or left click drag
      if (e.button === 0 || e.button === 2) {
        isMouseDownRef.current = true;
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const isPointerLocked = document.pointerLockElement === dom;
      if (isMouseDownRef.current || isPointerLocked) {
        yawRef.current -= e.movementX * mouseSensitivity;
        pitchRef.current = THREE.MathUtils.clamp(
          pitchRef.current + e.movementY * mouseSensitivity,
          minPitch,
          maxPitch
        );
        if (onCameraYawChange) {
          onCameraYawChange(yawRef.current);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      distRef.current = THREE.MathUtils.clamp(
        distRef.current + e.deltaY * 0.005,
        minDistance,
        maxDistance
      );
    };

    // Multitouch-safe canvas drag tracking by individual touch identifier
    let activeTouchId: number | null = null;
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (activeTouchId !== null) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      activeTouchId = touch.identifier;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (activeTouchId === null) return;
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        if (touch.identifier === activeTouchId) {
          const dx = (touch.clientX - touchStartX) * mouseSensitivity * 1.45;
          const dy = (touch.clientY - touchStartY) * mouseSensitivity * 1.45;
          touchStartX = touch.clientX;
          touchStartY = touch.clientY;

          yawRef.current -= dx;
          pitchRef.current = THREE.MathUtils.clamp(pitchRef.current + dy, minPitch, maxPitch);
          if (onCameraYawChange) onCameraYawChange(yawRef.current);
          break;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (activeTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
          activeTouchId = null;
          break;
        }
      }
    };

    const handleBlur = () => {
      isMouseDownRef.current = false;
      activeTouchId = null;
    };

    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('blur', handleBlur);
    dom.addEventListener('wheel', handleWheel, { passive: true });

    dom.addEventListener('touchstart', handleTouchStart, { passive: true });
    dom.addEventListener('touchmove', handleTouchMove, { passive: true });
    dom.addEventListener('touchend', handleTouchEnd, { passive: true });
    dom.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('blur', handleBlur);
      dom.removeEventListener('wheel', handleWheel);

      dom.removeEventListener('touchstart', handleTouchStart);
      dom.removeEventListener('touchmove', handleTouchMove);
      dom.removeEventListener('touchend', handleTouchEnd);
      dom.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [gl.domElement, mouseSensitivity, minPitch, maxPitch, minDistance, maxDistance, onCameraYawChange]);

  useFrame((_, delta) => {
    // Consume external mobile camera pad deltas smoothly within the single camera system
    if (cameraOrbitDeltaRef) {
      const { yawDelta, pitchDelta } = cameraOrbitDeltaRef.current;
      if (yawDelta !== 0 || pitchDelta !== 0) {
        yawRef.current -= yawDelta;
        pitchRef.current = THREE.MathUtils.clamp(
          pitchRef.current + pitchDelta,
          minPitch,
          maxPitch
        );
        cameraOrbitDeltaRef.current.yawDelta = 0;
        cameraOrbitDeltaRef.current.pitchDelta = 0;
        if (onCameraYawChange) {
          onCameraYawChange(yawRef.current);
        }
      }
    }

    const tx = Array.isArray(target) ? target[0] : target.x;
    const ty = Array.isArray(target) ? target[1] : target.y;
    const tz = Array.isArray(target) ? target[2] : target.z;

    const yaw = yawRef.current;
    const pitch = pitchRef.current;
    const dist = distRef.current;

    // Ideal camera position in orbit
    const desiredX = tx - Math.sin(yaw) * Math.cos(pitch) * dist;
    const desiredZ = tz - Math.cos(yaw) * Math.cos(pitch) * dist;
    let desiredY = ty + Math.sin(pitch) * dist + heightOffset;

    // Ground collision prevention
    if (getGroundHeight) {
      const groundAtCam = getGroundHeight(desiredX, desiredZ);
      desiredY = Math.max(desiredY, groundAtCam + 0.8);
    }

    // Smoothly damp camera position without per-frame Vector3 allocations
    const clampedDelta = Math.min(delta, 0.1);
    const lerpFactor = 1 - Math.exp(-14 * clampedDelta);
    desiredPosScratchRef.current.set(desiredX, desiredY, desiredZ);
    currentPosRef.current.lerp(desiredPosScratchRef.current, lerpFactor);
    camera.position.copy(currentPosRef.current);

    // Target look-at
    desiredLookAtScratchRef.current.set(tx, ty + heightOffset, tz);
    currentLookAtRef.current.lerp(desiredLookAtScratchRef.current, lerpFactor);
    camera.lookAt(currentLookAtRef.current);
  });

  return null;
};
