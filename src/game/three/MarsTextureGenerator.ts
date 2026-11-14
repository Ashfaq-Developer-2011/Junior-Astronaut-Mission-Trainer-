import * as THREE from 'three';
import { PlanetarySurfaceMaps } from './MoonTextureGenerator';

function hash2D(x: number, y: number): number {
  const s = Math.sin(x * 91.7 + y * 243.3) * 29431.4321;
  return s - Math.floor(s);
}

/**
 * Generates Martian Jezero-inspired iron-oxide dust, basaltic sand ripples, and pebble grit maps.
 * Progressively overlays verified NASA Mars Trek Jezero CTX orbital texture contrast when reachable
 * via our server proxy, while keeping 100% procedural fallback offline.
 */
export function createMarsSurfaceMaps(size = 1024): PlanetarySurfaceMaps {
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

  // Iron-oxide ochre & warm rusty regolith palette
  const baseR = 178;
  const baseG = 88;
  const baseB = 52;

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

      // Large mineralogical patches (bright ferric dust vs dark basaltic gravel)
      let strata = 0;
      strata += Math.sin(sinX * 2.2 + cosY * 2.0) * 0.32;
      strata += Math.cos(cosX * 4.5 + sinY * 3.8) * 0.22;

      // Seamless aeolian wind-blown sand ripples
      const ripplePhase = (x / size) * Math.PI * 2 * 18 + Math.sin(ny * 3) * 1.4;
      const ripple = Math.sin(ripplePhase) * 0.14;

      const grit = (hash2D(x, y) - 0.5) * 0.14;
      const combined = strata + ripple + grit;
      const factor = 1 + combined * 0.42;

      const idx = (y * size + x) * 4;
      cData[idx] = Math.min(245, Math.max(58, Math.round(baseR * factor)));
      cData[idx + 1] = Math.min(180, Math.max(30, Math.round(baseG * (factor - strata * 0.1))));
      cData[idx + 2] = Math.min(130, Math.max(18, Math.round(baseB * (factor - strata * 0.15))));
      cData[idx + 3] = 255;

      const bumpVal = Math.min(255, Math.max(0, Math.round(128 + ripple * 165 + grit * 140 + strata * 45)));
      bData[idx] = bumpVal;
      bData[idx + 1] = bumpVal;
      bData[idx + 2] = bumpVal;
      bData[idx + 3] = 255;
    }
  }

  cCtx.putImageData(colorImg, 0, 0);
  bCtx.putImageData(bumpImg, 0, 0);

  // Subtle wind-eroded shallow Martian craters & dark sand streaks
  for (let i = 0; i < 22; i++) {
    const cx = (Math.sin(i * 19.7 + 0.5) * 0.5 + 0.5) * size;
    const cy = (Math.cos(i * 11.3 + 1.1) * 0.5 + 0.5) * size;
    const radius = 14 + (i % 5) * 8;

    const grad = cCtx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, 'rgba(92, 42, 24, 0.35)');
    grad.addColorStop(0.75, 'rgba(130, 62, 34, 0.2)');
    grad.addColorStop(0.9, 'rgba(216, 130, 82, 0.22)');
    grad.addColorStop(1, 'rgba(178, 88, 52, 0)');
    cCtx.fillStyle = grad;
    cCtx.beginPath();
    cCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    cCtx.fill();
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

  // Progressive enhancement: blend verified NASA Mars Trek Jezero Crater CTX tile contrast onto base canvas
  let disposed = false;
  const trekImg = new Image();
  trekImg.onload = () => {
    if (disposed || !cCtx) return;
    cCtx.save();
    cCtx.globalAlpha = 0.22;
    cCtx.globalCompositeOperation = 'multiply';
    cCtx.drawImage(trekImg, 0, 0, size, size);
    cCtx.restore();
    colorMap.needsUpdate = true;
  };
  trekImg.onerror = () => {
    // Graceful fallback: procedural Martian regolith remains active
  };
  trekImg.src = '/api/nasa/mars/tile?layer=jezero_ctx&z=6&row=25&col=91';

  return {
    colorMap,
    bumpMap,
    dispose: () => {
      disposed = true;
      trekImg.onload = null;
      trekImg.onerror = null;
      colorMap.dispose();
      bumpMap.dispose();
    }
  };
}
