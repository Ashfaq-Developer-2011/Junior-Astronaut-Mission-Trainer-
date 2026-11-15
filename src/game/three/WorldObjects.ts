import * as THREE from 'three';
import { BuildingType } from '../../types/survival';
import { buildStormShelterGroup } from './StormShelterModel';

// Shared reusable materials to avoid duplicate allocations
const materialsCache = new Map<string, THREE.Material>();

function getMaterial(key: string, createFn: () => THREE.Material): THREE.Material {
  if (!materialsCache.has(key)) {
    materialsCache.set(key, createFn());
  }
  return materialsCache.get(key)!;
}

// ==========================================
// 1. RESOURCE NODES (Procedural 3D Collectibles)
// ==========================================

export function createResourceNodeMesh(type: 'regolith' | 'ice' | 'silicon' | 'biosignature', planet: 'moon' | 'mars'): THREE.Group {
  const group = new THREE.Group();
  group.name = `node_${type}`;

  if (type === 'ice') {
    // Translucent Blue Crystal Spire Cluster
    const crystalMat = getMaterial('mat_ice_crystal', () =>
      new THREE.MeshStandardMaterial({
        color: 0x67e8f9,
        roughness: 0.15,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85,
        emissive: 0x0891b2,
        emissiveIntensity: 0.35
      })
    );

    for (let i = 0; i < 4; i++) {
      const h = 1.2 + (i % 3) * 0.4;
      const crystalGeo = new THREE.ConeGeometry(0.35 - i * 0.05, h, 6);
      const mesh = new THREE.Mesh(crystalGeo, crystalMat);
      mesh.position.set((i - 1.5) * 0.4, h / 2, ((i * 2) % 3 - 1) * 0.3);
      mesh.rotation.set((i - 1.5) * 0.15, (i * Math.PI) / 3, (i - 1) * 0.1);
      mesh.castShadow = true;
      group.add(mesh);
    }
  } else if (type === 'regolith') {
    // Mineral Boulder with sharp facets
    const boulderMat = getMaterial(`mat_boulder_${planet}`, () =>
      new THREE.MeshStandardMaterial({
        color: planet === 'mars' ? 0x9a3412 : 0x475569,
        roughness: 0.9,
        metalness: 0.2
      })
    );

    const geo = new THREE.DodecahedronGeometry(0.8, 1);
    const mesh = new THREE.Mesh(geo, boulderMat);
    mesh.position.y = 0.6;
    mesh.scale.set(1.1, 0.85, 1.0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Smaller accent pebble
    const pebble = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), boulderMat);
    pebble.position.set(0.65, 0.25, 0.4);
    pebble.castShadow = true;
    group.add(pebble);
  } else if (type === 'silicon') {
    // Dark metallic cubic crystals with blue sheen
    const siliconMat = getMaterial('mat_silicon', () =>
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.25,
        metalness: 0.85,
        emissive: 0x3b82f6,
        emissiveIntensity: 0.2
      })
    );

    for (let i = 0; i < 3; i++) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), siliconMat);
      box.position.set((i - 1) * 0.45, 0.35 + i * 0.1, (i % 2) * 0.3);
      box.rotation.set(0.3 * i, 0.5 * i, 0.2 * i);
      box.castShadow = true;
      group.add(box);
    }
  } else {
    // Biosignature Ancient Fossil Outcrop (layered strata spire)
    const strataMat1 = getMaterial('mat_strata_1', () =>
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8, metalness: 0.1 })
    );
    const strataMat2 = getMaterial('mat_strata_2', () =>
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7, metalness: 0.1, emissive: 0xd97706, emissiveIntensity: 0.15 })
    );

    const baseGeo = new THREE.CylinderGeometry(0.5, 0.75, 1.8, 7);
    const spire = new THREE.Mesh(baseGeo, strataMat1);
    spire.position.y = 0.9;
    spire.castShadow = true;
    group.add(spire);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.12, 6, 8), strataMat2);
    ring.position.y = 0.8;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }

  // Floating interaction indicator anchor
  group.position.y = 0;
  return group;
}

// ==========================================
// 2. PLACED BUILDINGS (Composite 3–12 Part Models)
// ==========================================

export function createBuildingMesh(type: BuildingType, isHologram = false, isValidPlacement = true): THREE.Group {
  const group = new THREE.Group();
  group.name = `building_${type}`;

  // Hologram Material for Construction Preview
  const holoMat = new THREE.MeshStandardMaterial({
    color: isValidPlacement ? 0x22c55e : 0xef4444,
    transparent: true,
    opacity: 0.65,
    wireframe: true,
    emissive: isValidPlacement ? 0x15803d : 0xb91c1c,
    emissiveIntensity: 0.5
  });

  const getMat = (key: string, def: () => THREE.Material) => (isHologram ? holoMat : getMaterial(key, def));

  const metalMat = getMat('mat_bld_metal', () =>
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.32, metalness: 0.78, envMapIntensity: 1.25 })
  );
  const darkMetalMat = getMat('mat_bld_dark', () =>
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.62, metalness: 0.76, envMapIntensity: 1.1 })
  );
  const cyanGlassMat = getMat('mat_bld_glass', () =>
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.08,
      metalness: 0.15,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      emissive: 0x0284c7,
      emissiveIntensity: 0.25
    })
  );

  switch (type) {
    case 'habitat': {
      // 1. Habitat Geodesic Dome (Living Quarters)
      // Base berm foundation
      const berm = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.0, 0.6, 16), darkMetalMat);
      berm.position.y = 0.3;
      berm.receiveShadow = true;
      group.add(berm);

      // Main Pressure Dome
      const domeGeo = new THREE.SphereGeometry(3.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const dome = new THREE.Mesh(domeGeo, metalMat);
      dome.position.y = 0.5;
      dome.castShadow = true;
      group.add(dome);

      // Skylight Portals
      const skylight = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), cyanGlassMat);
      skylight.position.y = 2.6;
      group.add(skylight);

      // Airlock Entrance Tunnel
      const airlock = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 2.2), metalMat);
      airlock.position.set(0, 1.1, 3.2);
      airlock.castShadow = true;
      group.add(airlock);

      // Airlock Outer Door Frame
      const doorMat = getMat('mat_bld_door', () =>
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.5 })
      );
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.3, 0.2), doorMat);
      door.position.set(0, 1.1, 4.3);
      group.add(door);

      // Beacon on top
      const beaconMat = getMat('mat_beacon_green', () =>
        new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1 })
      );
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), beaconMat);
      beacon.position.y = 3.8;
      group.add(beacon);
      break;
    }

    case 'oxygen_gen': {
      // 2. ECLSS Sabatier Oxygen Generator
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 2.0), darkMetalMat);
      base.position.y = 0.2;
      group.add(base);

      // Dual Electrolysis Tanks
      const tankGeo = new THREE.CylinderGeometry(0.45, 0.45, 2.2, 12);
      const tankMat = getMat('mat_tank_cyan', () =>
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.6, emissive: 0x0369a1, emissiveIntensity: 0.2 })
      );
      const t1 = new THREE.Mesh(tankGeo, tankMat);
      t1.position.set(-0.5, 1.3, 0);
      t1.castShadow = true;
      group.add(t1);

      const t2 = new THREE.Mesh(tankGeo, tankMat);
      t2.position.set(0.5, 1.3, 0);
      t2.castShadow = true;
      group.add(t2);

      // Compressor Motor Box
      const comp = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.8), metalMat);
      comp.position.set(0, 0.8, 0.5);
      group.add(comp);

      // Top Vent Pipes
      const pipeGeo = new THREE.TorusGeometry(0.5, 0.08, 6, 12, Math.PI);
      const pipe = new THREE.Mesh(pipeGeo, metalMat);
      pipe.position.set(0, 2.4, 0);
      group.add(pipe);
      break;
    }

    case 'water_recycler': {
      // 3. Water Recovery System
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 1.8), darkMetalMat);
      base.position.y = 0.18;
      group.add(base);

      // Blue Reservoir Vessel
      const vesselMat = getMat('mat_water_vessel', () =>
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.85 })
      );
      const vessel = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.8, 16), vesselMat);
      vessel.position.set(-0.5, 1.1, 0);
      group.add(vessel);

      // Catalytic Filter Array
      for (let i = 0; i < 3; i++) {
        const filterTube = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.4, 8), metalMat);
        filterTube.position.set(0.4 + (i % 2) * 0.4, 0.9, -0.4 + i * 0.4);
        group.add(filterTube);
      }
      break;
    }

    case 'solar_panel': {
      // 4. Photovoltaic Solar Power Station
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 2.4, 8), darkMetalMat);
      mast.position.y = 1.2;
      mast.castShadow = true;
      group.add(mast);

      // Pivot crossbar
      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 0.15), metalMat);
      crossbar.position.set(0, 2.3, 0);
      group.add(crossbar);

      // Solar Wings (Angled at 35 degrees)
      const panelMat = getMat('mat_solar_blue', () =>
        new THREE.MeshStandardMaterial({
          color: 0x1e3a8a,
          roughness: 0.15,
          metalness: 0.8,
          emissive: 0x1d4ed8,
          emissiveIntensity: 0.2
        })
      );
      const wingGeo = new THREE.BoxGeometry(1.9, 1.3, 0.08);

      const wingL = new THREE.Mesh(wingGeo, panelMat);
      wingL.position.set(-1.05, 2.3, 0);
      wingL.rotation.x = -Math.PI / 5;
      wingL.castShadow = true;
      group.add(wingL);

      const wingR = new THREE.Mesh(wingGeo, panelMat);
      wingR.position.set(1.05, 2.3, 0);
      wingR.rotation.x = -Math.PI / 5;
      wingR.castShadow = true;
      group.add(wingR);
      break;
    }

    case 'battery': {
      // 5. Battery Power Bank
      const bank = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 1.2), darkMetalMat);
      bank.position.y = 0.8;
      bank.castShadow = true;
      group.add(bank);

      // Glowing power cells indicator strips
      const glowGreen = getMat('mat_glow_battery', () =>
        new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x22c55e, emissiveIntensity: 0.8 })
      );
      for (let i = 0; i < 4; i++) {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.8, 0.05), glowGreen);
        strip.position.set(-0.75 + i * 0.5, 0.8, 0.61);
        group.add(strip);
      }
      break;
    }

    case 'rad_shelter': {
      // 6. Radiation Storm Shelter (Compact reinforced emergency bunker)
      const shelter = buildStormShelterGroup({ getMat, isHologram });
      group.add(shelter);
      break;
    }

    case 'greenhouse': {
      // 7. Hydroponic Greenhouse Dome with visible crops
      const frame = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.4, 16), darkMetalMat);
      frame.position.y = 0.2;
      group.add(frame);

      // Glass Dome
      const greenGlass = getMat('mat_green_glass', () =>
        new THREE.MeshStandardMaterial({
          color: 0x86efac,
          roughness: 0.1,
          metalness: 0.1,
          transparent: true,
          opacity: 0.55,
          emissive: 0x22c55e,
          emissiveIntensity: 0.15
        })
      );
      const gDome = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), greenGlass);
      gDome.position.y = 0.4;
      group.add(gDome);

      // Interior hydroponic trays with plants
      const plantMat = getMat('mat_plants', () =>
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6, metalness: 0.05 })
      );
      for (let i = 0; i < 6; i++) {
        const plant = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), plantMat);
        plant.position.set(Math.cos((i * Math.PI) / 3) * 1.2, 0.6, Math.sin((i * Math.PI) / 3) * 1.2);
        group.add(plant);
      }
      break;
    }

    case 'research_lab': {
      // 8. Research Laboratory (Hexagonal module + sensor mast)
      const labBody = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 2.0, 6), metalMat);
      labBody.position.y = 1.0;
      labBody.castShadow = true;
      group.add(labBody);

      // Observation Bay Window
      const windowStrip = new THREE.Mesh(new THREE.CylinderGeometry(2.22, 2.22, 0.6, 6), cyanGlassMat);
      windowStrip.position.y = 1.3;
      group.add(windowStrip);

      // Sensor Mast
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6), darkMetalMat);
      mast.position.set(0, 2.6, 0);
      group.add(mast);

      // Revolving Radar / Scanner dish
      const scanner = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.3, 8), metalMat);
      scanner.position.set(0, 3.6, 0);
      scanner.rotation.x = Math.PI / 4;
      group.add(scanner);
      break;
    }

    case 'comm_antenna': {
      // 9. Communication Dish Antenna (Deep Space Network Earth link)
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.3, 1.6), darkMetalMat);
      base.position.y = 0.15;
      group.add(base);

      // Lattice Tower
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 3.5, 4), darkMetalMat);
      tower.position.y = 1.8;
      tower.castShadow = true;
      group.add(tower);

      // Parabolic Dish
      const dishGeo = new THREE.SphereGeometry(1.4, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.4);
      const dishMat = getMat('mat_dish_white', () =>
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.7 })
      );
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.position.set(0, 3.6, 0);
      dish.rotation.x = -Math.PI / 3;
      dish.castShadow = true;
      group.add(dish);

      // Feedhorn
      const feedhorn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6), metalMat);
      feedhorn.position.set(0, 3.9, 0.5);
      feedhorn.rotation.x = -Math.PI / 3;
      group.add(feedhorn);

      // Pulsing transmission beacon
      const txBeacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 6, 6),
        getMat('mat_red_tx', () => new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1 }))
      );
      txBeacon.position.set(0, 4.3, 0.9);
      group.add(txBeacon);
      break;
    }
  }

  return group;
}

// ==========================================
// 3. LANDER SPACECRAFT (Touchdown Module)
// ==========================================

export function createLanderMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'lander_spacecraft';

  const goldFoilMat = getMaterial('mat_gold_foil', () =>
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.35,
      metalness: 0.9
    })
  );

  const whiteTitaniumMat = getMaterial('mat_white_titanium', () =>
    new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.4
    })
  );

  // Descent Stage (Octagonal gold foil body)
  const descentStage = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.4, 1.8, 8), goldFoilMat);
  descentStage.position.y = 1.6;
  descentStage.castShadow = true;
  group.add(descentStage);

  // Ascent Crew Cabin (White cylinder + conical cockpit)
  const cabin = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 2.0, 12), whiteTitaniumMat);
  cabin.position.y = 3.5;
  cabin.castShadow = true;
  group.add(cabin);

  const noseCone = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.2, 12), whiteTitaniumMat);
  noseCone.position.y = 5.1;
  group.add(noseCone);

  // 4 Landing Strut Legs with footpads
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 3.2, 6),
      getMaterial('mat_bld_dark', () => new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 }))
    );
    leg.position.set(Math.cos(angle) * 3.2, 1.2, Math.sin(angle) * 3.2);
    leg.rotation.z = Math.cos(angle) * 0.4;
    leg.rotation.x = Math.sin(angle) * -0.4;
    group.add(leg);

    // Footpad dish
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.15, 8), goldFoilMat);
    pad.position.set(Math.cos(angle) * 4.2, 0.1, Math.sin(angle) * 4.2);
    group.add(pad);
  }

  return group;
}
