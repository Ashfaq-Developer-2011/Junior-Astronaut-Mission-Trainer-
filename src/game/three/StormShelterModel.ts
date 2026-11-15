import * as THREE from 'three';

let cachedSignageTexture: THREE.CanvasTexture | null = null;

function getEmergencySignageTexture(): THREE.CanvasTexture {
  if (cachedSignageTexture) return cachedSignageTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Dark charcoal industrial plate
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top & bottom safety orange hazard chevron strips
    const stripeH = 26;
    ctx.save();
    ctx.fillStyle = '#f97316';
    ctx.fillRect(0, 0, canvas.width, stripeH);
    ctx.fillRect(0, canvas.height - stripeH, canvas.width, stripeH);
    ctx.fillStyle = '#111827';
    for (let x = -40; x < canvas.width + 40; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 22, 0);
      ctx.lineTo(x + 6, stripeH);
      ctx.lineTo(x - 16, stripeH);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, canvas.height - stripeH);
      ctx.lineTo(x + 22, canvas.height - stripeH);
      ctx.lineTo(x + 6, canvas.height);
      ctx.lineTo(x - 16, canvas.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Inner industrial white emblem & stencil text
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 38, 92, 116);

    // Radiation shield / shelter cross emblem in safety orange
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(64, 52);
    ctx.lineTo(96, 68);
    ctx.lineTo(90, 116);
    ctx.lineTo(64, 138);
    ctx.lineTo(38, 116);
    ctx.lineTo(32, 68);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(58, 70, 12, 42);
    ctx.fillRect(43, 85, 42, 12);

    // Stencil typography
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 40px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText('STORM SHELTER', 130, 96);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText('RAD-SAFE BUNKER // E-01', 132, 136);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  cachedSignageTexture = tex;
  return tex;
}

export interface StormShelterMaterials {
  getMat: (key: string, createFn: () => THREE.Material) => THREE.Material;
  isHologram: boolean;
}

/**
 * Builds the compact, heavily armored emergency Radiation Storm Shelter (`rad_shelter`).
 * Designed to contrast sharply with the large 20m glass-cupola Habitat Dome:
 * - Low-profile hexagonal bunker (~8.2m span, ~3.45m roof height)
 * - Partially buried regolith-berm foundation skirt (y = -0.38..0.72)
 * - Industrial white ceramic-composite hull, dark charcoal steel ribs, safety-orange markings
 * - Heavy multi-layered radiation shielding roof plates
 * - Raised armored airlock vestibule with heavy locking hatch wheel, hinges & subtle blue entrance LEDs
 * - Minimal recessed narrow slit windows (no glass dome)
 * - External life-support ventilation unit, louver fins & O2/N2 reserve canisters
 */
export function buildStormShelterGroup({ getMat, isHologram }: StormShelterMaterials): THREE.Group {
  const group = new THREE.Group();
  group.name = 'storm_shelter_bunker';

  // Material Palette (varied roughness >= 0.25 and metalness contrast across adjacent parts)
  const armorWhiteMat = getMat('mat_shelter_white', () =>
    new THREE.MeshStandardMaterial({
      color: 0xe7ebf0,
      roughness: 0.44,
      metalness: 0.24,
      envMapIntensity: 1.1
    })
  );

  const charcoalSteelMat = getMat('mat_shelter_charcoal', () =>
    new THREE.MeshStandardMaterial({
      color: 0x262f3b,
      roughness: 0.58,
      metalness: 0.78,
      envMapIntensity: 1.15
    })
  );

  const roofShieldMat = getMat('mat_shelter_roof_shield', () =>
    new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.78,
      metalness: 0.22,
      envMapIntensity: 1.0
    })
  );

  const bermSkirtMat = getMat('mat_shelter_berm', () =>
    new THREE.MeshStandardMaterial({
      color: 0x333c48,
      roughness: 0.88,
      metalness: 0.14
    })
  );

  const orangeSafetyMat = getMat('mat_shelter_orange', () =>
    new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.36,
      metalness: 0.22,
      envMapIntensity: 1.1
    })
  );

  const brushedHardwareMat = getMat('mat_shelter_hardware', () =>
    new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.24,
      metalness: 0.88,
      envMapIntensity: 1.35
    })
  );

  const slitViewportMat = getMat('mat_shelter_slit_glass', () =>
    new THREE.MeshStandardMaterial({
      color: 0x0b1628,
      roughness: 0.14,
      metalness: 0.35,
      emissive: 0x0284c7,
      emissiveIntensity: 0.42
    })
  );

  const blueEntryGlowMat = getMat('mat_shelter_blue_led', () =>
    new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x0ea5e9,
      emissiveIntensity: 1.5,
      roughness: 0.2,
      metalness: 0.1
    })
  );

  const signageMat = getMat('mat_shelter_signage', () =>
    new THREE.MeshStandardMaterial({
      map: getEmergencySignageTexture(),
      roughness: 0.48,
      metalness: 0.18,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    })
  );

  const enableShadows = (obj: THREE.Object3D, cast = true, receive = true) => {
    if (isHologram) return;
    obj.castShadow = cast;
    obj.receiveShadow = receive;
  };

  // Rotate hexagonal alignment by 30 deg so flat armored facets face front (+Z) and back (-Z)
  const hexAlignY = Math.PI / 6;

  // 1. Partially Buried Sloped Regolith-Anchoring Berm Foundation (extends down to -0.38 so slopes never gap)
  const bermFoundation = new THREE.Mesh(
    new THREE.CylinderGeometry(3.85, 4.75, 1.1, 6),
    bermSkirtMat
  );
  bermFoundation.position.y = 0.17;
  bermFoundation.rotation.y = hexAlignY;
  enableShadows(bermFoundation, true, true);
  group.add(bermFoundation);

  // Heavy anchor ring collar atop berm
  const foundationCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(3.58, 3.82, 0.26, 6),
    charcoalSteelMat
  );
  foundationCollar.position.y = 0.72;
  foundationCollar.rotation.y = hexAlignY;
  enableShadows(foundationCollar, true, true);
  group.add(foundationCollar);

  // 2. Main Compact Hexagonal Armored Bulkhead (Industrial White, Opaque & Thick)
  const mainHull = new THREE.Mesh(
    new THREE.CylinderGeometry(3.25, 3.48, 1.75, 6),
    armorWhiteMat
  );
  mainHull.position.y = 1.68;
  mainHull.rotation.y = hexAlignY;
  enableShadows(mainHull, true, true);
  group.add(mainHull);

  // Safety-orange waist band around hull
  const waistBand = new THREE.Mesh(
    new THREE.CylinderGeometry(3.43, 3.46, 0.18, 6),
    orangeSafetyMat
  );
  waistBand.position.y = 1.15;
  waistBand.rotation.y = hexAlignY;
  enableShadows(waistBand, false, true);
  group.add(waistBand);

  // 3. Six External Dark-Steel Structural Corner Buttress Ribs
  for (let i = 0; i < 6; i++) {
    const cornerAngle = (i * Math.PI) / 3 + hexAlignY;
    const ribGroup = new THREE.Group();
    ribGroup.rotation.y = cornerAngle;

    const verticalRib = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 2.05, 0.56),
      charcoalSteelMat
    );
    verticalRib.position.set(0, 1.65, 3.32);
    verticalRib.rotation.x = -0.11;
    enableShadows(verticalRib, true, true);
    ribGroup.add(verticalRib);

    // Orange corner tie-down bracket at base of rib
    const bracket = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.34, 0.44),
      orangeSafetyMat
    );
    bracket.position.set(0, 0.78, 3.55);
    enableShadows(bracket, true, true);
    ribGroup.add(bracket);

    group.add(ribGroup);
  }

  // 4. Heavy Multi-Layered Radiation Shielding Roof Assembly
  // Lower dark overhang armor eave
  const roofEave = new THREE.Mesh(
    new THREE.CylinderGeometry(3.48, 3.35, 0.28, 6),
    charcoalSteelMat
  );
  roofEave.position.y = 2.66;
  roofEave.rotation.y = hexAlignY;
  enableShadows(roofEave, true, true);
  group.add(roofEave);

  // Primary sloped hexagonal shield cap
  const roofShieldCore = new THREE.Mesh(
    new THREE.CylinderGeometry(2.55, 3.38, 0.48, 6),
    roofShieldMat
  );
  roofShieldCore.position.y = 3.02;
  roofShieldCore.rotation.y = hexAlignY;
  enableShadows(roofShieldCore, true, true);
  group.add(roofShieldCore);

  // Upper heavy composite Whipple armor cap
  const topArmorCap = new THREE.Mesh(
    new THREE.CylinderGeometry(2.0, 2.52, 0.26, 6),
    armorWhiteMat
  );
  topArmorCap.position.y = 3.36;
  topArmorCap.rotation.y = hexAlignY;
  enableShadows(topArmorCap, true, true);
  group.add(topArmorCap);

  // Six radial layered radiation shielding baffle panels atop roof slope
  for (let i = 0; i < 6; i++) {
    const faceAngle = (i * Math.PI) / 3;
    const panelHolder = new THREE.Group();
    panelHolder.rotation.y = faceAngle;

    const shieldSlab = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, 0.16, 1.05),
      charcoalSteelMat
    );
    shieldSlab.position.set(0, 3.06, 2.38);
    shieldSlab.rotation.x = 0.42;
    enableShadows(shieldSlab, true, true);
    panelHolder.add(shieldSlab);

    const orangeHandle = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.08, 0.14),
      orangeSafetyMat
    );
    orangeHandle.position.set(0, 3.24, 2.15);
    orangeHandle.rotation.x = 0.42;
    enableShadows(orangeHandle, false, true);
    panelHolder.add(orangeHandle);

    group.add(panelHolder);
  }

  // Low-profile armored emergency beacon & short telemetry whip on roof center
  const beaconBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.58, 0.22, 8),
    charcoalSteelMat
  );
  beaconBase.position.y = 3.58;
  enableShadows(beaconBase, true, true);
  group.add(beaconBase);

  const beaconLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 0.18, 12),
    orangeSafetyMat
  );
  beaconLens.position.y = 3.76;
  group.add(beaconLens);

  const commStub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 0.72, 6),
    brushedHardwareMat
  );
  commStub.position.set(-0.85, 3.82, -0.5);
  enableShadows(commStub, true, false);
  group.add(commStub);

  // 5. Raised Reinforced Entrance Airlock Vestibule (+Z Front Face)
  const vestibuleGroup = new THREE.Group();
  vestibuleGroup.position.set(0, 0, 0);

  // Concrete/steel entry plinth raising threshold slightly above regolith berm
  const entryPlinth = new THREE.Mesh(
    new THREE.BoxGeometry(2.45, 0.85, 2.1),
    charcoalSteelMat
  );
  entryPlinth.position.set(0, 0.22, 3.38);
  enableShadows(entryPlinth, true, true);
  vestibuleGroup.add(entryPlinth);

  // Sloped ribbed entry ramp connecting ground (z=5.35, y=0) to hatch threshold (z=4.38, y=0.65)
  const rampMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.05, 0.24, 1.35),
    charcoalSteelMat
  );
  rampMesh.position.set(0, 0.28, 4.78);
  rampMesh.rotation.x = 0.42;
  enableShadows(rampMesh, true, true);
  vestibuleGroup.add(rampMesh);

  // Safety orange edge rails along ramp
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.16, 1.3),
      orangeSafetyMat
    );
    rail.position.set(side * 0.98, 0.39, 4.78);
    rail.rotation.x = 0.42;
    enableShadows(rail, true, true);
    vestibuleGroup.add(rail);
  }

  // Armored vestibule housing
  const vestibuleBody = new THREE.Mesh(
    new THREE.BoxGeometry(2.25, 1.95, 1.85),
    armorWhiteMat
  );
  vestibuleBody.position.set(0, 1.48, 3.35);
  enableShadows(vestibuleBody, true, true);
  vestibuleGroup.add(vestibuleBody);

  // Heavy sloped armored vestibule roof cap
  const vestibuleRoof = new THREE.Mesh(
    new THREE.BoxGeometry(2.46, 0.34, 2.15),
    charcoalSteelMat
  );
  vestibuleRoof.position.set(0, 2.52, 3.42);
  vestibuleRoof.rotation.x = 0.12;
  enableShadows(vestibuleRoof, true, true);
  vestibuleGroup.add(vestibuleRoof);

  // Safety orange brow strip on vestibule roof
  const vestibuleBrow = new THREE.Mesh(
    new THREE.BoxGeometry(2.36, 0.16, 0.18),
    orangeSafetyMat
  );
  vestibuleBrow.position.set(0, 2.48, 4.44);
  enableShadows(vestibuleBrow, false, true);
  vestibuleGroup.add(vestibuleBrow);

  // Outer heavy bulkhead frame
  const hatchFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.74, 1.72, 0.22),
    charcoalSteelMat
  );
  hatchFrame.position.set(0, 1.48, 4.24);
  enableShadows(hatchFrame, true, true);
  vestibuleGroup.add(hatchFrame);

  // Reinforced Pressure Hatch Door Leaf (recessed slightly inside frame)
  const hatchDoor = new THREE.Mesh(
    new THREE.BoxGeometry(1.36, 1.5, 0.16),
    armorWhiteMat
  );
  hatchDoor.position.set(0, 1.45, 4.3);
  enableShadows(hatchDoor, true, true);
  vestibuleGroup.add(hatchDoor);

  // Inner armored backing plate on hatch
  const hatchRecess = new THREE.Mesh(
    new THREE.BoxGeometry(1.06, 1.18, 0.06),
    charcoalSteelMat
  );
  hatchRecess.position.set(0, 1.45, 4.37);
  enableShadows(hatchRecess, false, true);
  vestibuleGroup.add(hatchRecess);

  // Twin heavy hinge barrels on left edge of hatch
  for (const hy of [1.05, 1.85]) {
    const hinge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.24, 8),
      brushedHardwareMat
    );
    hinge.position.set(-0.74, hy, 4.35);
    enableShadows(hinge, true, false);
    vestibuleGroup.add(hinge);
  }

  // Visible Central Mechanical Dogging / Locking Wheel & Spokes
  const lockHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.14, 0.14, 12),
    brushedHardwareMat
  );
  lockHub.rotation.x = Math.PI / 2;
  lockHub.position.set(0.24, 1.42, 4.42);
  enableShadows(lockHub, true, false);
  vestibuleGroup.add(lockHub);

  const lockRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.038, 8, 18),
    orangeSafetyMat
  );
  lockRim.position.set(0.24, 1.42, 4.45);
  enableShadows(lockRim, true, false);
  vestibuleGroup.add(lockRim);

  for (let s = 0; s < 3; s++) {
    const spoke = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.036, 0.036),
      brushedHardwareMat
    );
    spoke.position.set(0.24, 1.42, 4.44);
    spoke.rotation.z = (s * Math.PI) / 3;
    vestibuleGroup.add(spoke);
  }

  // Heavy latching crossbar & right-side dogging clamps
  const latchBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.62, 0.08),
    orangeSafetyMat
  );
  latchBar.position.set(0.56, 1.42, 4.41);
  vestibuleGroup.add(latchBar);

  // Subtle Blue Entrance Lighting Strips (Overhead & Flanking Guides)
  const topLightStrip = new THREE.Mesh(
    new THREE.BoxGeometry(1.42, 0.08, 0.09),
    blueEntryGlowMat
  );
  topLightStrip.position.set(0, 2.26, 4.34);
  vestibuleGroup.add(topLightStrip);

  for (const side of [-1, 1]) {
    const sideLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 1.15, 0.07),
      blueEntryGlowMat
    );
    sideLight.position.set(side * 0.82, 1.46, 4.34);
    vestibuleGroup.add(sideLight);
  }

  // Emergency Shelter Identification Plaque above/along vestibule flanks & front brow
  const frontPlaque = new THREE.Mesh(
    new THREE.BoxGeometry(1.75, 0.42, 0.05),
    signageMat
  );
  frontPlaque.position.set(0, 2.7, 4.45);
  vestibuleGroup.add(frontPlaque);

  for (const side of [-1, 1]) {
    const sidePlaque = new THREE.Mesh(
      new THREE.BoxGeometry(1.38, 0.46, 0.05),
      signageMat
    );
    sidePlaque.position.set(side * 1.14, 1.65, 3.35);
    sidePlaque.rotation.y = side * (Math.PI / 2);
    vestibuleGroup.add(sidePlaque);
  }

  group.add(vestibuleGroup);

  // 6. Minimal Narrow Armored Observation Viewport Slits (Front-Left & Front-Right Hex Facets)
  for (const sideAngle of [-Math.PI / 3, Math.PI / 3]) {
    const slitMount = new THREE.Group();
    slitMount.rotation.y = sideAngle;

    // Thick armored bezel frame
    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(1.48, 0.44, 0.24),
      charcoalSteelMat
    );
    bezel.position.set(0, 1.78, 2.94);
    enableShadows(bezel, true, true);
    slitMount.add(bezel);

    // Narrow recessed armoured glass slit
    const slitGlass = new THREE.Mesh(
      new THREE.BoxGeometry(1.18, 0.18, 0.08),
      slitViewportMat
    );
    slitGlass.position.set(0, 1.78, 3.04);
    slitMount.add(slitGlass);

    // Vertical armor divider bar across slit
    const divider = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.24, 0.12),
      charcoalSteelMat
    );
    divider.position.set(0, 1.78, 3.05);
    slitMount.add(divider);

    group.add(slitMount);
  }

  // 7. External Life-Support & Radiation-Baffled Ventilation Equipment (Side/Rear Facets)
  // Right-side HVAC / HEPA Filtration Unit
  const hvacMount = new THREE.Group();
  hvacMount.rotation.y = (2 * Math.PI) / 3;

  const hvacBox = new THREE.Mesh(
    new THREE.BoxGeometry(1.75, 1.25, 0.72),
    charcoalSteelMat
  );
  hvacBox.position.set(0, 1.48, 3.12);
  enableShadows(hvacBox, true, true);
  hvacMount.add(hvacBox);

  // Louvered intake fins (4 angled slats)
  for (let f = 0; f < 4; f++) {
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.08, 0.14),
      brushedHardwareMat
    );
    fin.position.set(0, 1.15 + f * 0.22, 3.46);
    fin.rotation.x = 0.35;
    hvacMount.add(fin);
  }

  // Side armored intake duct elbow into roof
  const duct = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.88, 10),
    brushedHardwareMat
  );
  duct.position.set(0.55, 2.28, 2.95);
  duct.rotation.x = -0.3;
  enableShadows(duct, true, true);
  hvacMount.add(duct);

  group.add(hvacMount);

  // Left-side Dual Pressurized O2/N2 Reserve Tanks & Conduit Manifold
  const tanksMount = new THREE.Group();
  tanksMount.rotation.y = -(2 * Math.PI) / 3;

  const tankCradle = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 0.28, 0.68),
    charcoalSteelMat
  );
  tankCradle.position.set(0, 0.88, 3.14);
  enableShadows(tankCradle, true, true);
  tanksMount.add(tankCradle);

  for (const offsetX of [-0.36, 0.36]) {
    const tank = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.24, 0.92, 6, 12),
      armorWhiteMat
    );
    tank.position.set(offsetX, 1.56, 3.16);
    enableShadows(tank, true, true);
    tanksMount.add(tank);

    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.252, 0.252, 0.14, 12),
      orangeSafetyMat
    );
    band.position.set(offsetX, 1.85, 3.16);
    tanksMount.add(band);

    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.45, 8),
      brushedHardwareMat
    );
    pipe.position.set(offsetX, 2.08, 2.92);
    pipe.rotation.x = Math.PI / 2;
    tanksMount.add(pipe);
  }

  group.add(tanksMount);

  return group;
}
