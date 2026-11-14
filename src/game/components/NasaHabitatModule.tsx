import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { createBuildingMesh } from '../three/WorldObjects';
import { createContactPadTexture } from './PlanetaryEffects';

interface NasaHabitatModuleProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/**
 * Inner component that loads NASA's official Habitat Demonstration Unit (HDU) GLBs
 * Source: https://science.nasa.gov/3d-resources/habitat-demonstration-unit/
 */
const NasaHabitatModelInner: React.FC<NasaHabitatModuleProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1
}) => {
  // Load official NASA HDU Part 1 (Pressurized core cylinder, airlock & docking)
  const part1 = useGLTF('/models/habitat-hdu.glb', '/draco/');
  // Load official NASA HDU Part 2 (Upper observation cupola, communications mast)
  const part2 = useGLTF('/models/habitat-hdu-part2.glb', '/draco/');

  const rootRef = useRef<THREE.Group>(null);
  const settleScaleRef = useRef(0.84);
  const contactPadTex = useMemo(() => createContactPadTexture(256, '12, 16, 24'), []);
  useEffect(() => () => contactPadTex.dispose(), [contactPadTex]);

  const combinedGroup = useMemo(() => {
    const root = new THREE.Group();

    const clone1 = part1.scene.clone(true);
    const clone2 = part2.scene.clone(true);

    const configureMeshes = (scene: THREE.Group) => {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          if (mesh.material) {
            const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
            if (mat) {
              mat.roughness = Math.max(0.28, mat.roughness ?? 0.45);
              mat.metalness = Math.min(0.75, mat.metalness ?? 0.35);
              mat.envMapIntensity = 1.25;
            }
          }
        }
      });
    };

    configureMeshes(clone1);
    configureMeshes(clone2);

    root.add(clone1);
    root.add(clone2);

    // Compute bounding box and normalize scale to ~20.0 meters wide (large expedition base dome)
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.z);
    const targetScale = maxDim > 0 ? (20.0 / maxDim) : 1;
    root.scale.setScalar(targetScale);

    // Pivot at bottom
    box.setFromObject(root);
    root.position.y = -box.min.y;

    return root;
  }, [part1.scene, part2.scene]);

  useFrame((_, rawDelta) => {
    if (!rootRef.current || settleScaleRef.current >= 0.999) return;
    const dt = Math.min(Math.max(rawDelta, 0), 0.1);
    settleScaleRef.current = THREE.MathUtils.damp(settleScaleRef.current, 1, 9, dt);
    rootRef.current.scale.setScalar(scale * settleScaleRef.current);
  });

  return (
    <group ref={rootRef} position={position} rotation={rotation} scale={scale * 0.84}>
      <primitive object={combinedGroup} />

      {/* Airlock Entry Portal Beacon */}
      <pointLight position={[0, 4.5, 9.8]} intensity={2.6} distance={18} color="#34d399" />

      {/* Cupola Observation Illumination */}
      <pointLight position={[0, 11.8, 0]} intensity={2.2} distance={26} color="#7dd3fc" />

      {/* Compacted Foundation Pad Ring & Contact Shadow */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[12.5, 48]} />
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

/**
 * Fallback procedural habitat while GLBs load
 */
const FallbackHabitat: React.FC<NasaHabitatModuleProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1
}) => {
  const mesh = useMemo(() => createBuildingMesh('habitat', false), []);
  return (
    <group position={position} rotation={rotation} scale={scale * 2.6}>
      <primitive object={mesh} />
    </group>
  );
};

/**
 * NasaHabitatModule: Official NASA Habitat Demonstration Unit (HDU)
 * Replaces the procedural astronaut habitat with real NASA deep-space architecture.
 */
export const NasaHabitatModule: React.FC<NasaHabitatModuleProps> = (props) => {
  return (
    <Suspense fallback={<FallbackHabitat {...props} />}>
      <NasaHabitatModelInner {...props} />
    </Suspense>
  );
};

// Preload the NASA HDU assets
try {
  useGLTF.preload('/models/habitat-hdu.glb', '/draco/');
  useGLTF.preload('/models/habitat-hdu-part2.glb', '/draco/');
} catch {
  // Graceful preload catch
}
