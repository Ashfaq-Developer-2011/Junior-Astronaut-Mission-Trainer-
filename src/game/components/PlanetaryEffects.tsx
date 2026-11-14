import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PlanetType } from '../../types/survival';
import { getPlanetTerrainHeight } from '../three/PlanetaryTerrain';

/**
 * Generates RoomEnvironment reflections for metallic gold foil, astronaut visors, and solar arrays.
 */
export const SceneEnvironment: React.FC<{ planet: PlanetType }> = ({ planet }) => {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    return () => {
      if (scene.environment === envTarget.texture) {
        scene.environment = null;
      }
      envTarget.dispose();
    };
  }, [gl, scene]);

  useEffect(() => {
    // Low fill on Moon preserves crisp lunar shadows; slightly warmer fill on Mars dust atmosphere
    scene.environmentIntensity = planet === 'moon' ? 0.28 : 0.44;
  }, [planet, scene]);

  return null;
};

/**
 * Shared soft radial contact shadow texture for grounding habitats, structures, and landers.
 */
export function createContactPadTexture(size = 256, tintRgb = '8, 12, 20'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const c = size / 2;
    const grad = ctx.createRadialGradient(c, c, size * 0.05, c, c, size * 0.48);
    grad.addColorStop(0, `rgba(${tintRgb}, 0.58)`);
    grad.addColorStop(0.55, `rgba(${tintRgb}, 0.28)`);
    grad.addColorStop(1, `rgba(${tintRgb}, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Single-draw-call InstancedMesh of geological surface rocks & crater boulders.
 */
export const InstancedPlanetaryRocks: React.FC<{ planet: PlanetType }> = ({ planet }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 140;

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(0.65, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const crag = 0.86 + Math.sin(vx * 5.2 + vy * 3.7 + vz * 4.3) * 0.16;
      pos.setXYZ(i, vx * crag, vy * 0.72 * crag, vz * crag);
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: planet === 'moon' ? 0.92 : 0.88,
      metalness: 0.08
    });
    return { geometry: geo, material: mat };
  }, [planet]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const paletteMoon = ['#64748b', '#788292', '#475569', '#94a3b8'];
    const paletteMars = ['#9a3412', '#7c2d12', '#b45309', '#573228'];
    const palette = planet === 'moon' ? paletteMoon : paletteMars;

    for (let i = 0; i < count; i++) {
      const angle = i * 2.399963 + (planet === 'mars' ? 0.5 : 0);
      const radius = 17.5 + ((i * 19.7) % 108);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = getPlanetTerrainHeight(planet, x, z);

      const scaleXZ = 0.48 + ((Math.sin(i * 17.3) * 0.5 + 0.5) * 1.45);
      const scaleY = scaleXZ * (0.55 + ((Math.cos(i * 9.1) * 0.5 + 0.5) * 0.55));

      dummy.position.set(x, y - 0.14 * scaleY, z);
      dummy.rotation.set(
        (Math.sin(i * 3.1) * 0.35),
        i * 1.1,
        (Math.cos(i * 4.7) * 0.35)
      );
      dummy.scale.set(scaleXZ, scaleY, scaleXZ * (0.85 + (i % 3) * 0.12));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      color.set(palette[i % palette.length]);
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();

    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [planet, geometry, material]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow
      receiveShadow
    />
  );
};

/**
 * Low-poly distant crater / massif rim bordering the 320m arena so the world never terminates abruptly.
 */
export const HorizonCraterRim: React.FC<{ planet: PlanetType }> = ({ planet }) => {
  const { geometry, material } = useMemo(() => {
    const radialSegs = 72;
    const g = new THREE.CylinderGeometry(148, 168, 22, radialSegs, 3, true);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      if (vy > 0) {
        const angle = Math.atan2(vz, vx);
        const ridge =
          Math.sin(angle * 7 + (planet === 'mars' ? 1.2 : 0)) * 5.2 +
          Math.cos(angle * 13) * 2.8 +
          Math.sin(angle * 23) * 1.4;
        pos.setY(i, vy + ridge);
      }
    }
    g.computeVertexNormals();

    const m = new THREE.MeshStandardMaterial({
      color: planet === 'moon' ? '#3f4756' : '#6c2d17',
      roughness: 0.96,
      metalness: 0.04,
      side: THREE.BackSide
    });
    return { geometry: g, material: m };
  }, [planet]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <mesh geometry={geometry} material={material} position={[0, 4.5, 0]} receiveShadow />;
};

/**
 * Simulated Martian atmospheric dust motes (intensifies cleanly during dust/solar storms).
 * Never mounted on the Moon, where vacuum conditions preclude wind-borne dust weather.
 */
export const MarsDustParticles: React.FC<{ isStormActive: boolean; isPaused: boolean }> = ({
  isStormActive,
  isPaused
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 360;

  const { geometry, material, spriteTex } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = 0.6 + Math.random() * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 1, 16, 16, 15);
      grad.addColorStop(0, 'rgba(255, 226, 185, 0.95)');
      grad.addColorStop(0.5, 'rgba(234, 158, 108, 0.45)');
      grad.addColorStop(1, 'rgba(234, 158, 108, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    const m = new THREE.PointsMaterial({
      map: tex,
      size: isStormActive ? 0.65 : 0.38,
      transparent: true,
      opacity: isStormActive ? 0.58 : 0.3,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    return { geometry: g, material: m, spriteTex: tex };
  }, []);

  useEffect(() => {
    material.size = isStormActive ? 0.68 : 0.36;
    material.opacity = isStormActive ? 0.55 : 0.28;
    material.needsUpdate = true;
  }, [isStormActive, material]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      spriteTex.dispose();
    };
  }, [geometry, material, spriteTex]);

  useFrame((state, rawDelta) => {
    if (isPaused || !pointsRef.current) return;
    const dt = Math.min(Math.max(rawDelta, 0), 0.1);
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const windX = isStormActive ? 14.5 : 2.1;
    const windZ = isStormActive ? 5.2 : 0.7;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      arr[idx] += windX * dt;
      arr[idx + 1] += Math.sin(t * 0.9 + i) * 0.18 * dt;
      arr[idx + 2] += windZ * dt;

      if (arr[idx] > 75) arr[idx] = -75;
      if (arr[idx + 2] > 75) arr[idx + 2] = -75;
      if (arr[idx + 1] < 0.4) arr[idx + 1] = 12;
    }
    posAttr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
};
