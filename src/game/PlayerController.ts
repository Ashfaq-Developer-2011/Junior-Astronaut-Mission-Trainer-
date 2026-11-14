import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { AstronautCharacter } from './three/Astronaut';

export interface PlayerControllerOptions {
  walkSpeed?: number;
  sprintSpeed?: number;
  jumpForce?: number;
  gravity?: number;
  mouseSensitivity?: number;
  cameraDistance?: number;
  cameraHeight?: number;
  minPitch?: number;
  maxPitch?: number;
  enablePointerLock?: boolean;
  getGroundHeight?: (x: number, z: number) => number;
  onInteract?: () => void;
  onStateChange?: (state: PlayerMovementState) => void;
}

export interface PlayerMovementState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: number;
  isMoving: boolean;
  isSprinting: boolean;
  isGrounded: boolean;
  isJumping: boolean;
}

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
  interact: boolean;
}

/**
 * usePlayerInput Hook
 * Maps keyboard (WASD, Arrows, Space, Shift, E) and mouse movements (orbit/look & zoom).
 */
export function usePlayerInput(enablePointerLock = false) {
  const inputRef = useRef<InputState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    interact: false
  });

  const mouseDeltaRef = useRef<{ x: number; y: number; wheel: number }>({ x: 0, y: 0, wheel: 0 });
  const isMouseDownRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          inputRef.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          inputRef.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          inputRef.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          inputRef.current.right = true;
          break;
        case 'Space':
          inputRef.current.jump = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          inputRef.current.sprint = true;
          break;
        case 'KeyE':
          inputRef.current.interact = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          inputRef.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          inputRef.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          inputRef.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          inputRef.current.right = false;
          break;
        case 'Space':
          inputRef.current.jump = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          inputRef.current.sprint = false;
          break;
        case 'KeyE':
          inputRef.current.interact = false;
          break;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) {
        isMouseDownRef.current = true;
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const isLocked = document.pointerLockElement !== null;
      if (isLocked || isMouseDownRef.current || !enablePointerLock) {
        mouseDeltaRef.current.x += e.movementX || 0;
        mouseDeltaRef.current.y += e.movementY || 0;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      mouseDeltaRef.current.wheel += e.deltaY * 0.005;
    };

    const resetInputs = () => {
      inputRef.current.forward = false;
      inputRef.current.backward = false;
      inputRef.current.left = false;
      inputRef.current.right = false;
      inputRef.current.jump = false;
      inputRef.current.sprint = false;
      inputRef.current.interact = false;
      isMouseDownRef.current = false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        resetInputs();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('blur', resetInputs);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('blur', resetInputs);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enablePointerLock]);

  return { inputRef, mouseDeltaRef, isMouseDownRef };
}

/**
 * Custom Hook: usePlayerController
 * Attaches character movement and camera orbit logic to an avatar ref inside an R3F Canvas.
 */
export function usePlayerController(
  avatarRef: React.RefObject<THREE.Object3D | null>,
  options: PlayerControllerOptions = {}
) {
  const {
    walkSpeed = 5.2,
    sprintSpeed = 9.5,
    jumpForce = 5.2,
    gravity = -5.8,
    mouseSensitivity = 0.003,
    cameraDistance = 8.5,
    cameraHeight = 1.4,
    minPitch = 0.08,
    maxPitch = 1.25,
    enablePointerLock = false,
    getGroundHeight = (x: number, z: number) => 0,
    onInteract,
    onStateChange
  } = options;

  const { camera } = useThree();
  const { inputRef, mouseDeltaRef } = usePlayerInput(enablePointerLock);

  // Kinematic state
  const posRef = useRef(new THREE.Vector3(0, 0, 0));
  const velRef = useRef(new THREE.Vector3(0, 0, 0));
  const rotationRef = useRef(0);
  const isGroundedRef = useRef(true);

  // Camera angles
  const cameraYawRef = useRef(0);
  const cameraPitchRef = useRef(0.35);
  const camDistRef = useRef(cameraDistance);

  // Sync initial position if avatar already has position
  useEffect(() => {
    if (avatarRef.current) {
      posRef.current.copy(avatarRef.current.position);
    }
  }, [avatarRef]);

  useFrame((_, delta) => {
    const input = inputRef.current;
    const mouseDelta = mouseDeltaRef.current;

    // 1. Mouse Orbit Look (Yaw and Pitch)
    if (mouseDelta.x !== 0 || mouseDelta.y !== 0) {
      cameraYawRef.current -= mouseDelta.x * mouseSensitivity;
      cameraPitchRef.current = THREE.MathUtils.clamp(
        cameraPitchRef.current + mouseDelta.y * mouseSensitivity,
        minPitch,
        maxPitch
      );
      mouseDelta.x = 0;
      mouseDelta.y = 0;
    }

    if (mouseDelta.wheel !== 0) {
      camDistRef.current = THREE.MathUtils.clamp(camDistRef.current + mouseDelta.wheel, 3.5, 18.0);
      mouseDelta.wheel = 0;
    }

    // 2. WASD Keyboard Movement relative to camera heading
    let forward = 0;
    let right = 0;
    if (input.forward) forward += 1;
    if (input.backward) forward -= 1;
    if (input.left) right -= 1;
    if (input.right) right += 1;

    const isMoving = forward !== 0 || right !== 0;
    const isSprinting = input.sprint && isMoving;
    const currentSpeed = isSprinting ? sprintSpeed : walkSpeed;
    const yaw = cameraYawRef.current;

    if (isMoving) {
      const len = Math.sqrt(forward * forward + right * right);
      const normF = forward / len;
      const normR = right / len;

      const fX = Math.sin(yaw);
      const fZ = Math.cos(yaw);
      const rX = -Math.cos(yaw);
      const rZ = Math.sin(yaw);

      const dirX = fX * normF + rX * normR;
      const dirZ = fZ * normF + rZ * normR;

      posRef.current.x += dirX * currentSpeed * delta;
      posRef.current.z += dirZ * currentSpeed * delta;

      const targetAngle = Math.atan2(dirX, dirZ);
      rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetAngle, 0.2);
    }

    // 3. Jump and Gravity
    const groundY = getGroundHeight(posRef.current.x, posRef.current.z);

    if (input.jump && isGroundedRef.current) {
      velRef.current.y = jumpForce;
      isGroundedRef.current = false;
    }

    if (!isGroundedRef.current) {
      velRef.current.y += gravity * delta;
      posRef.current.y += velRef.current.y * delta;

      if (posRef.current.y <= groundY) {
        posRef.current.y = groundY;
        velRef.current.y = 0;
        isGroundedRef.current = true;
      }
    } else {
      posRef.current.y = groundY;
    }

    // 4. Update Avatar 3D Mesh
    if (avatarRef.current) {
      avatarRef.current.position.copy(posRef.current);
      avatarRef.current.rotation.y = rotationRef.current;
    }

    // 5. Update Orbiting Third-Person Camera
    const px = posRef.current.x;
    const py = posRef.current.y;
    const pz = posRef.current.z;

    const dist = camDistRef.current;
    const pitch = cameraPitchRef.current;

    const cx = px - Math.sin(yaw) * Math.cos(pitch) * dist;
    const cz = pz - Math.cos(yaw) * Math.cos(pitch) * dist;
    const cy = py + Math.sin(pitch) * dist + cameraHeight;

    const minCamY = getGroundHeight(cx, cz) + 0.6;
    camera.position.set(cx, Math.max(cy, minCamY), cz);
    camera.lookAt(px, py + cameraHeight, pz);

    // 6. Action Pulse (Key E)
    if (input.interact) {
      input.interact = false;
      if (onInteract) onInteract();
    }

    // 7. State Callback
    if (onStateChange) {
      onStateChange({
        position: posRef.current.clone(),
        velocity: velRef.current.clone(),
        rotation: rotationRef.current,
        isMoving,
        isSprinting,
        isGrounded: isGroundedRef.current,
        isJumping: !isGroundedRef.current
      });
    }
  });

  return {
    position: posRef,
    velocity: velRef,
    rotation: rotationRef,
    isGrounded: isGroundedRef,
    cameraYaw: cameraYawRef
  };
}

export interface PlayerControllerProps {
  position?: [number, number, number];
  options?: PlayerControllerOptions;
  children?: React.ReactNode;
}

/**
 * PlayerController Component for R3F scenes
 * Instantiates the 3D astronaut avatar and updates movement/camera every frame.
 */
export const PlayerController: React.FC<PlayerControllerProps> = ({
  position = [0, 0, 0],
  options = {},
  children
}) => {
  const avatarGroupRef = useRef<THREE.Group>(null);
  const astronautInstanceRef = useRef<AstronautCharacter | null>(null);

  if (!astronautInstanceRef.current) {
    astronautInstanceRef.current = new AstronautCharacter();
  }

  // Hook driving movement & camera
  const { isGrounded } = usePlayerController(avatarGroupRef, {
    ...options,
    onStateChange: (state) => {
      if (astronautInstanceRef.current) {
        astronautInstanceRef.current.updateAnimation(
          0.016,
          state.isMoving,
          state.isSprinting,
          !state.isGrounded
        );
      }
      if (options.onStateChange) {
        options.onStateChange(state);
      }
    }
  });

  // Set initial position
  useEffect(() => {
    if (avatarGroupRef.current) {
      avatarGroupRef.current.position.set(...position);
    }
  }, [position]);

  return React.createElement(
    'group',
    { ref: avatarGroupRef },
    children
      ? children
      : React.createElement('primitive', { object: astronautInstanceRef.current.group })
  );
};
