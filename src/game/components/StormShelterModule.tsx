import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createBuildingMesh } from '../three/WorldObjects';
import { createContactPadTexture } from './PlanetaryEffects';

interface StormShelterModuleProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/**
 * StormShelterModule: Dedicated compact, heavily armored emergency radiation bunker.
 * Distinct silhouette, opaque metallic-ceramic walls, layered shielding roof, and subtle
 * blue airlock entrance lighting — visually unmistakable from the glass-cupola Habitat Dome.
 */
export const StormShelterModule: React.FC<StormShelterModuleProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const settleScaleRef = useRef(0.84);

  const shelterGroup = useMemo(() => createBuildingMesh('rad_shelter', false), []);
  const contactPadTex = useMemo(() => createContactPadTexture(256, '12, 16, 24'), []);

  useEffect(() => () => contactPadTex.dispose(), [contactPadTex]);

  useFrame((_, rawDelta) => {
    if (!rootRef.current || settleScaleRef.current >= 0.999) return;
    const dt = Math.min(Math.max(rawDelta, 0), 0.1);
    settleScaleRef.current = THREE.MathUtils.damp(settleScaleRef.current, 1, 9, dt);
    rootRef.current.scale.setScalar(scale * settleScaleRef.current);
  });

  return (
    <group ref={rootRef} position={position} rotation={rotation} scale={scale * 0.84}>
      <primitive object={shelterGroup} />

      {/* Subtle cool-blue illumination right outside the raised airlock hatch */}
      <pointLight position={[0, 2.35, 5.05]} intensity={1.75} distance={10.5} color="#38bdf8" />

      {/* Grounded contact shadow & compacted pad skirt */}
      <mesh position={[0, 0.03, 0.35]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.4, 36]} />
        <meshBasicMaterial
          map={contactPadTex}
          transparent
          opacity={0.78}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>
    </group>
  );
};
