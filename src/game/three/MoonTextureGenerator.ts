import * as THREE from 'three';

export interface PlanetarySurfaceMaps {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  dispose: () => void;
}

function hash2D(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

/**
 * Generates seamless lunar regolith albedo (sRGB) + micro-crater bump map (linear).
 * Procedural regolith simulation inspired by Apollo / LRO lunar surface imagery.
 */
export function createMoonSurfaceMaps(size = 1024): PlanetarySurfaceMaps {
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  if (!cCtx || !bCtx) {
    const emptyTex = new THREE.CanvasTexture(colorCanvas);
    return {
      colorMap: emptyTex,
      bumpMap: emptyTex,
      dispose: () => emptyTex.dispose()
    };
  }

  // Base lunar regolith tone (Apollo highlands / mare titanium-grey blend)
  const baseR = 148;
  const baseG = 152;
  const baseB = 159;

  const colorImg = cCtx.createImageData(size, size);
  const bumpImg = bCtx.createImageData(size, size);
  const cData = colorImg.data;
  const bData = bumpImg.data;

  for (let y = 0; y < size; y++) {
    const ny = (y / size) * Math.PI * 2;
    const sinY = Math.sin(ny);
    const cosY = Math.cos(ny);

    for (let x = 0; x < size; x++) {
      const nx = (x / size) * Math.PI * 2;
      const sinX = Math.sin(nx);
      const cosX = Math.cos(nx);

      // Seamless multi-octave toroidal fractal variation
      let n = 0;
      n += Math.sin(sinX * 2.5 + cosY * 2.5) * 0.34;
      n += Math.cos(cosX * 4.0 - sinY * 4.0) * 0.24;
      n += Math.sin(sinX * 9.0 + sinY * 8.0) * 0.16;
      n += Math.cos(cosX * 15.0 + cosY * 14.0) * 0.10;
      n += Math.sin(sinX * 28.0 - cosY * 28.0) * 0.06;

      // Deterministic fine regolith grit
      const grit = (hash2D(x, y) - 0.5) * 0.11;
      n += grit;

      const factor = 1 + n * 0.42;
      const idx = (y * size + x) * 4;

      cData[idx] = Math.min(255, Math.max(42, Math.round(baseR * factor)));
      cData[idx + 1] = Math.min(255, Math.max(44, Math.round(baseG * factor)));
      cData[idx + 2] = Math.min(255, Math.max(46, Math.round(baseB * factor * 1.015)));
      cData[idx + 3] = 255;

      const bumpVal = Math.min(255, Math.max(0, Math.round(128 + n * 72 + grit * 90)));
      bData[idx] = bumpVal;
      bData[idx + 1] = bumpVal;
      bData[idx + 2] = bumpVal;
      bData[idx + 3] = 255;
    }
  }

  cCtx.putImageData(colorImg, 0, 0);
  bCtx.putImageData(bumpImg, 0, 0);

  // Seamless toroidally-wrapped impact micro-craters & ejecta rays
  const drawSeamlessCrater = (cx: number, cy: number, radius: number, depth: number) => {
    const offsets = [
      [0, 0], [size, 0], [-size, 0],
      [0, size], [0, -size],
      [size, size], [-size, size], [size, -size], [-size, -size]
    ];

    for (let k = 0; k < offsets.length; k++) {
      const px = cx + offsets[k][0];
      const py = cy + offsets[k][1];
      if (px + radius * 1.6 < 0 || px - radius * 1.6 > size || py + radius * 1.6 < 0 || py - radius * 1.6 > size) {
        continue;
      }

      // Albedo crater shading
      const grad = cCtx.createRadialGradient(px, py, 0, px, py, radius);
      grad.addColorStop(0, `rgba(45, 49, 58, ${0.42 * depth})`);
      grad.addColorStop(0.62, `rgba(74, 80, 90, ${0.26 * depth})`);
      grad.addColorStop(0.84, `rgba(196, 202, 214, ${0.36 * depth})`);
      grad.addColorStop(1, 'rgba(148, 152, 159, 0)');
      cCtx.fillStyle = grad;
      cCtx.beginPath();
      cCtx.arc(px, py, radius, 0, Math.PI * 2);
      cCtx.fill();

      // Paired height bump (dark depressed bowl + bright raised rim)
      const bGrad = bCtx.createRadialGradient(px, py, 0, px, py, radius);
      bGrad.addColorStop(0, `rgba(28, 28, 28, ${0.55 * depth})`);
      bGrad.addColorStop(0.68, `rgba(90, 90, 90, ${0.25 * depth})`);
      bGrad.addColorStop(0.86, `rgba(235, 235, 235, ${0.52 * depth})`);
      bGrad.addColorStop(1, 'rgba(128, 128, 128, 0)');
      bCtx.fillStyle = bGrad;
      bCtx.beginPath();
      bCtx.arc(px, py, radius, 0, Math.PI * 2);
      bCtx.fill();
    }
  };

  const largeCraters = [
    { x: size * 0.24, y: size * 0.34, r: 64, d: 0.9 },
    { x: size * 0.72, y: size * 0.68, r: 82, d: 1.0 },
    { x: size * 0.84, y: size * 0.22, r: 50, d: 0.8 },
    { x: size * 0.16, y: size * 0.81, r: 54, d: 0.85 },
    { x: size * 0.51, y: size * 0.16, r: 42, d: 0.75 }
  ];
  largeCraters.forEach(c => drawSeamlessCrater(c.x, c.y, c.r, c.d));

  for (let i = 0; i < 24; i++) {
    const cx = (Math.sin(i * 12.3) * 0.5 + 0.5) * size;
    const cy = (Math.cos(i * 7.7) * 0.5 + 0.5) * size;
    drawSeamlessCrater(cx, cy, 16 + (i % 5) * 6, 0.65);
  }

  for (let i = 0; i < 65; i++) {
    const cx = (Math.sin(i * 37.1 + 1.2) * 0.5 + 0.5) * size;
    const cy = (Math.cos(i * 19.4 + 2.3) * 0.5 + 0.5) * size;
    drawSeamlessCrater(cx, cy, 5 + (i % 4) * 3, 0.48);
  }

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(4, 4);
  colorMap.anisotropy = 8;
  colorMap.needsUpdate = true;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(4, 4);
  bumpMap.anisotropy = 8;
  bumpMap.needsUpdate = true;

  return {
    colorMap,
    bumpMap,
    dispose: () => {
      colorMap.dispose();
      bumpMap.dispose();
    }
  };
}

export function createNaturalMoonTexture(size = 1024): THREE.CanvasTexture {
  return createMoonSurfaceMaps(size).colorMap;
}
