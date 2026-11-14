import React, { Suspense } from 'react';
import { useCustomModel } from '../../hooks/useCustomModel';
import { NasaAstronautAvatar } from './NasaAstronautAvatar';
import { ArticulatedAstronaut } from './ArticulatedAstronaut';

export interface CharacterMeshProps {
  position?: [number, number, number];
  rotation?: [number, number, number] | number;
  isMoving?: boolean;
  isSprinting?: boolean;
  isJumping?: boolean;
  scale?: number;
}

/**
 * CharacterMesh: 3D Astronaut Avatar Component for R3F
 * Renders the official NASA 3D Astronaut body (from science.nasa.gov/3d-resources/astronaut/)
 * with authentic low-gravity EVA stride kinematics, forward lean, and PLSS thruster effects.
 */
export const CharacterMesh: React.FC<CharacterMeshProps> = ({
  position = [0, 0, 0],
  rotation = 0,
  isMoving = false,
  isSprinting = false,
  isJumping = false,
  scale = 1
}) => {
  const rotY = typeof rotation === 'number' ? rotation : rotation[1];
  const { model: customAvatar, meta: avatarMeta } = useCustomModel('avatar');

  if (customAvatar) {
    const finalScale = (avatarMeta?.scale || 1.0) * scale;
    return (
      <group position={position} rotation={[0, rotY, 0]} scale={finalScale}>
        <primitive object={customAvatar.scene} />
      </group>
    );
  }

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <ArticulatedAstronaut
        isMoving={isMoving}
        isSprinting={isSprinting}
        isJumping={isJumping}
        scale={scale}
      />
    </group>
  );
};
