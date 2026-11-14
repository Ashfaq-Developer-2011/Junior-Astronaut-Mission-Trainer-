import React, { Suspense, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { createLanderMesh } from '../three/WorldObjects';
import { createContactPadTexture } from './PlanetaryEffects';

interface ApolloLunarModuleProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/**
 * Inner component that loads the official NASA Apollo Lunar Module GLB
 */
const NasaLunarModuleModel: React.FC<ApolloLunarModuleProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1
}) => {
  // Load official NASA 3D resource model with local Draco decoder fallback
  const { scene } = useGLTF('/models/apollo-lunar-module.glb', '/draco/');

  const contactPadTex = useMemo(() => createContactPadTexture(256, '10, 12, 16'), []);
  useEffect(() => () => contactPadTex.dispose(), [contactPadTex]);

  // Clone and normalize model geometry and materials
  const clonedScene = useMemo(() => {
    const cloned = scene.clone(true);
    
    // Enable shadows and enhance NASA PBR materials
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
          if (mat) {
            mat.roughness = Math.max(0.24, mat.roughness ?? 0.38);
            mat.metalness = Math.max(0.65, mat.metalness ?? 0.8);
            mat.envMapIntensity = 1.35;
          }
        }
      }
    });

    // Compute bounding box to sit exactly on the surface
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Auto-scale to real human proportion (~6.5 meters high)
    const maxDim = Math.max(size.x, size.y, size.z);
    const normalizedScale = maxDim > 0 ? (6.5 / maxDim) : 1;
    cloned.scale.setScalar(normalizedScale);

    // Center pivot at footpad base
    box.setFromObject(cloned);
    cloned.position.y = -box.min.y;

    return cloned;
  }, [scene]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} />

      {/* NASA Mission Cabin Beacon Light */}
      <pointLight position={[0, 4.5, 0]} intensity={1.3} distance={14} color="#bae6fd" />

      {/* Grounded Engine Blast / Contact Shadow Pad */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.2, 32]} />
        <meshBasicMaterial
          map={contactPadTex}
          transparent
          opacity={0.72}
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
 * Fallback procedural lander while GLB loads or if network fails
 */
const FallbackLander: React.FC<ApolloLunarModuleProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1
}) => {
  const mesh = useMemo(() => createLanderMesh(), []);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={mesh} />
    </group>
  );
};

/**
 * ApolloLunarModule: Official NASA 3D Apollo Lunar Module Lander
 * Rendered at the player landing site with Suspense resilience.
 */
export const ApolloLunarModule: React.FC<ApolloLunarModuleProps> = (props) => {
  return (
    <Suspense fallback={<FallbackLander {...props} />}>
      <NasaLunarModuleModel {...props} />
    </Suspense>
  );
};

// Preload the NASA model asset
try {
  useGLTF.preload('/models/apollo-lunar-module.glb', '/draco/');
} catch {
  // Graceful preload catch
}
