import * as THREE from 'three';
import { PlanetType } from '../../types/survival';

interface CraterSpec {
  x: number;
  z: number;
  radius: number;
  depth: number;
  rimHeight: number;
}

// Deterministic simulated lunar impact craters (placed clear of the 15m central landing apron)
const LUNAR_CRATERS: CraterSpec[] = [
  { x: 34, z: -26, radius: 14, depth: 2.3, rimHeight: 0.95 },
  { x: -38, z: 28, radius: 17, depth: 2.8, rimHeight: 1.1 },
  { x: 52, z: 32, radius: 12, depth: 1.9, rimHeight: 0.75 },
  { x: -48, z: -42, radius: 20, depth: 3.1, rimHeight: 1.25 },
  { x: 18, z: 46, radius: 10, depth: 1.5, rimHeight: 0.65 },
  { x: -24, z: -55, radius: 13, depth: 2.1, rimHeight: 0.85 },
  { x: 82, z: -48, radius: 24, depth: 3.6, rimHeight: 1.45 },
  { x: -86, z: 54, radius: 26, depth: 3.8, rimHeight: 1.5 },
  { x: 74, z: 76, radius: 18, depth: 2.6, rimHeight: 1.05 }
];

// Deterministic simulated Martian craters (shallower, wind-eroded rims)
const MARS_CRATERS: CraterSpec[] = [
  { x: -42, z: 30, radius: 18, depth: 1.8, rimHeight: 0.65 },
  { x: 38, z: -34, radius: 15, depth: 1.5, rimHeight: 0.55 },
  { x: -58, z: -46, radius: 22, depth: 2.2, rimHeight: 0.8 },
  { x: 88, z: -52, radius: 25, depth: 2.4, rimHeight: 0.9 }
];

function evaluateCraters(x: number, z: number, craters: CraterSpec[]): { height: number; craterFactor: number } {
  let height = 0;
  let craterFactor = 0;

  for (let i = 0; i < craters.length; i++) {
    const c = craters[i];
    const dx = x - c.x;
    const dz = z - c.z;
    const distSq = dx * dx + dz * dz;
    const outerLimit = c.radius * 1.65;
    if (distSq >= outerLimit * outerLimit) continue;

    const r = Math.sqrt(distSq) / c.radius;
    if (r < 0.88) {
      // Parabolic crater bowl
      const t = r / 0.88;
      const bowl = -(1 - t * t) * c.depth;
      height += bowl;
      craterFactor -= (1 - t) * 0.45;
    } else if (r < 1.15) {
      // Raised crater rim peak around r = 1.0
      const rimPhase = (r - 0.88) / (1.15 - 0.88);
      const rim = Math.sin(rimPhase * Math.PI) * c.rimHeight;
      height += rim;
      craterFactor += Math.sin(rimPhase * Math.PI) * 0.35;
    } else {
      // Smooth outer ejecta apron blending back to 0
      const apronT = 1 - (r - 1.15) / (1.65 - 1.15);
      const apron = apronT * apronT * (c.rimHeight * 0.28);
      height += apron;
    }
  }

  return { height, craterFactor };
}

/**
 * Deterministic procedural surface relief per planet.
 * Note: Uses procedural simulation for local playable geometry (not claiming real DEM resolution).
 */
export function getPlanetTerrainHeight(planet: PlanetType, x: number, z: number): number {
  const distToCenter = Math.sqrt(x * x + z * z);

  // Smooth blend out from the 15m flat touchdown & base-building apron
  const apronBlend = THREE.MathUtils.smoothstep(distToCenter, 12.5, 22.0);
  if (apronBlend <= 0.0001) {
    return 0.03 * Math.sin(x * 0.25) * Math.cos(z * 0.25);
  }

  if (planet === 'moon') {
    const mareUndulation =
      Math.sin(x * 0.032) * Math.cos(z * 0.035) * 1.9 +
      Math.sin(x * 0.075 + z * 0.055) * 0.65 +
      Math.cos(x * 0.14 - z * 0.11) * 0.22;
    const { height: craterH } = evaluateCraters(x, z, LUNAR_CRATERS);
    return (mareUndulation + craterH) * apronBlend;
  }

  // Mars: Jezero Crater-inspired alluvial delta steps, wind dunes, and basin rim rising in distance
  const deltaTerrace =
    Math.tanh(Math.sin(x * 0.028 + 0.4) * Math.cos(z * 0.026) * 1.8) * 1.65;
  const windRipples =
    Math.sin(x * 0.095 + z * 0.04) * 0.55 +
    Math.cos(x * 0.17 - z * 0.12) * 0.18;
  const basinWall = distToCenter > 85 ? Math.pow((distToCenter - 85) / 45, 1.45) * 3.8 : 0;
  const { height: craterH } = evaluateCraters(x, z, MARS_CRATERS);

  // Keep NE biosignature outcrop ridge slightly elevated and reachable
  const bioDx = x - 65;
  const bioDz = z - 55;
  const bioDist = Math.sqrt(bioDx * bioDx + bioDz * bioDz);
  const outcropStep = bioDist < 12 ? (1 - bioDist / 12) * 0.85 : 0;

  return (deltaTerrace + windRipples + basinWall + craterH + outcropStep) * apronBlend;
}

/**
 * Creates optimized planetary terrain BufferGeometry with geological vertex tinting.
 */
export function createTerrainGeometry(planet: PlanetType, size = 320, segments = 140): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const craters = planet === 'moon' ? LUNAR_CRATERS : MARS_CRATERS;

  const baseColor = new THREE.Color(planet === 'moon' ? '#cbd5e1' : '#d97745');
  const darkFloorColor = new THREE.Color(planet === 'moon' ? '#475569' : '#6b2714');
  const ridgeColor = new THREE.Color(planet === 'moon' ? '#f1f5f9' : '#e89968');
  const workColor = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vz = pos.getZ(i);
    const vy = getPlanetTerrainHeight(planet, vx, vz);
    pos.setY(i, vy);

    const { craterFactor } = evaluateCraters(vx, vz, craters);
    const heightTint = THREE.MathUtils.clamp(vy / 3.5, -1, 1);

    workColor.copy(baseColor);
    if (craterFactor < 0 || heightTint < -0.15) {
      const darkT = THREE.MathUtils.clamp(Math.abs(Math.min(craterFactor, heightTint)) * 0.65, 0, 0.72);
      workColor.lerp(darkFloorColor, darkT);
    } else if (craterFactor > 0 || heightTint > 0.25) {
      const brightT = THREE.MathUtils.clamp(Math.max(craterFactor, heightTint * 0.45) * 0.65, 0, 0.55);
      workColor.lerp(ridgeColor, brightT);
    }

    colors[i * 3] = workColor.r;
    colors[i * 3 + 1] = workColor.g;
    colors[i * 3 + 2] = workColor.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}
