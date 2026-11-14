import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

interface NasaAstronautAvatarProps {
  isMoving?: boolean;
  isSprinting?: boolean;
  isJumping?: boolean;
  scale?: number;
}

/**
 * NasaAstronautAvatar: Official NASA EVA Spacesuit Astronaut 3D Model
 * Source: https://science.nasa.gov/3d-resources/astronaut/
 */
export const NasaAstronautAvatar: React.FC<NasaAstronautAvatarProps> = ({
  isMoving = false,
  isSprinting = false,
  isJumping = false,
  scale = 1
}) => {
  const { scene } = useGLTF('/models/astronaut.glb', '/draco/');
  const rootRef = useRef<THREE.Group>(null);
  const thrusterRef = useRef<THREE.Mesh>(null);
  const animTimer = useRef(0);

  // Normalize model geometry, materials, and center pivot
  const clonedScene = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
          if (mat) {
            // Gold visor sheen for the astronaut helmet
            if (
              mesh.name.toLowerCase().includes('visor') ||
              (mat.name && mat.name.toLowerCase().includes('visor')) ||
              (mesh.geometry && mesh.geometry.attributes.position && mesh.geometry.attributes.position.count < 600)
            ) {
              mat.color.set('#f59e0b');
              mat.metalness = 0.96;
              mat.roughness = 0.1;
              mat.envMapIntensity = 2.0;
            } else {
              mat.roughness = Math.max(0.4, mat.roughness ?? 0.55);
              mat.metalness = Math.min(0.25, mat.metalness ?? 0.1);
            }
          }
        }
      }
    });

    // Compute bounding box and normalize scale to real human EVA suit height (~1.95 meters)
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);

    const targetHeight = 1.95;
    const targetScale = size.y > 0 ? (targetHeight / size.y) : 1;
    cloned.scale.setScalar(targetScale);

    // Recompute box after scale and center precisely on (0, 0, 0) at the boot soles
    box.setFromObject(cloned);
    const center = new THREE.Vector3();
    box.getCenter(center);

    cloned.position.x = -center.x;
    cloned.position.y = -box.min.y;
    cloned.position.z = -center.z;

    // Face forward along +Z (direction of travel)
    cloned.rotation.y = 0;

    return cloned;
  }, [scene]);

  // Dynamic EVA movement animation: low-gravity stride bounce, sprint lean, swagger, and jump thrusters
  useFrame((_, delta) => {
    if (!rootRef.current) return;

    if (isJumping) {
      if (thrusterRef.current) thrusterRef.current.visible = true;
      rootRef.current.position.y = 0.22;
      rootRef.current.rotation.x = -0.1;
      rootRef.current.rotation.z = 0.04;
      return;
    }

    if (thrusterRef.current) thrusterRef.current.visible = false;

    if (isMoving) {
      const speed = isSprinting ? 14 : 9;
      animTimer.current += delta * speed;

      // Authentic lunar EVA gait bounce
      const bounce = Math.abs(Math.sin(animTimer.current)) * (isSprinting ? 0.11 : 0.06);
      rootRef.current.position.y = bounce;

      // Sprint forward body lean into the velocity vector
      rootRef.current.rotation.x = isSprinting ? 0.18 : 0.07;

      // Subtle lateral swagger matching astronaut EVA bootfalls
      rootRef.current.rotation.z = Math.sin(animTimer.current) * (isSprinting ? 0.06 : 0.035);
    } else {
      animTimer.current += delta * 2;
      // Gentle breathing idle
      rootRef.current.position.y = Math.sin(animTimer.current) * 0.018;
      rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, 0, 0.1);
      rootRef.current.rotation.z = THREE.MathUtils.lerp(rootRef.current.rotation.z, 0, 0.1);
    }
  });

  return (
    <group ref={rootRef} scale={scale}>
      <primitive object={clonedScene} />

      {/* PLSS Low-Gravity EVA Thruster Plume */}
      <mesh ref={thrusterRef} position={[0, 1.45, -0.42]} rotation={[Math.PI, 0, 0]} visible={false}>
        <coneGeometry args={[0.09, 0.4, 8]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
      </mesh>
    </group>
  );
};

// Preload the NASA Astronaut asset
try {
  useGLTF.preload('/models/astronaut.glb', '/draco/');
} catch {
  // Graceful preload catch
}
