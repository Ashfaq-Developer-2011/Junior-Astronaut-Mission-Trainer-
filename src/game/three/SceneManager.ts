import * as THREE from 'three';
import { PlanetType, BuildingType } from '../../types/survival';
import { AstronautCharacter } from './Astronaut';
import { createBuildingMesh, createLanderMesh, createResourceNodeMesh } from './WorldObjects';

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public astronaut: AstronautCharacter;

  // Environment & Lighting
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private terrainMesh: THREE.Mesh;
  private starfield: THREE.Points;
  private celestialBody: THREE.Mesh;
  private stormParticles: THREE.Points;

  // Dynamic Building & Node Objects in Scene
  public buildingObjects = new Map<string, THREE.Group>();
  public resourceObjects = new Map<string, THREE.Group>();
  public landerGroup: THREE.Group;
  public hologramPreview: THREE.Group | null = null;
  public laserBeam: THREE.Line | null = null;

  private planet: PlanetType = 'moon';
  private cameraDistance = 8.5;
  private cameraPitch = 0.35;
  private cameraYaw = 0;

  constructor(container: HTMLElement, planet: PlanetType = 'moon') {
    this.planet = planet;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera (70 deg FOV for nice cinematic perspective)
    this.camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    // 3. Renderer with physical lighting & shadows
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 4. Lighting Rig
    this.hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 0.4);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    this.dirLight.position.set(60, 90, 40);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 250;
    const d = 45;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    // 5. Build Terrain & Sky
    this.terrainMesh = this.createTerrain(planet);
    this.scene.add(this.terrainMesh);

    this.starfield = this.createStarfield();
    this.scene.add(this.starfield);

    this.celestialBody = this.createCelestialBody(planet);
    this.scene.add(this.celestialBody);

    this.stormParticles = this.createStormParticles();
    this.scene.add(this.stormParticles);

    // 6. Spawn Lander Spacecraft at Origin
    this.landerGroup = createLanderMesh();
    this.landerGroup.position.set(-6, this.getTerrainHeight(-6, -6), -6);
    this.scene.add(this.landerGroup);

    // 7. Astronaut Character
    this.astronaut = new AstronautCharacter();
    this.astronaut.group.position.set(0, this.getTerrainHeight(0, 0), 0);
    this.scene.add(this.astronaut.group);

    // Apply planet atmosphere palette
    this.setPlanetEnvironment(planet);
  }

  // Terrain height calculation with craters and dunes
  public getTerrainHeight(x: number, z: number): number {
    const distToCenter = Math.sqrt(x * x + z * z);
    // Flatten zone around landing area
    if (distToCenter < 14) {
      return 0.05 * Math.sin(x * 0.3) * Math.cos(z * 0.3);
    }

    // Organic rolling hills & craters
    const hills = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 2.2;
    const dunes = Math.sin(x * 0.1 + z * 0.08) * 0.8;
    return hills + dunes;
  }

  private createTerrain(planet: PlanetType): THREE.Mesh {
    const size = 320;
    const segments = 120;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      pos.setY(i, this.getTerrainHeight(vx, vz));
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: planet === 'mars' ? 0x9a3412 : 0x334155,
      roughness: 0.95,
      metalness: 0.15,
      flatShading: true
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    return mesh;
  }

  private createStarfield(): THREE.Points {
    const starCount = 1800;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 380 + Math.random() * 50;

      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = Math.abs(r * Math.cos(phi)) + 15; // Upper dome
      positions[i + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 0.9
    });

    return new THREE.Points(geo, mat);
  }

  private createCelestialBody(planet: PlanetType): THREE.Mesh {
    if (planet === 'moon') {
      // The Earth in the lunar sky
      const geo = new THREE.SphereGeometry(14, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.35,
        roughness: 0.4
      });
      const earth = new THREE.Mesh(geo, mat);
      earth.position.set(160, 140, -180);
      return earth;
    } else {
      // Phobos moon in Martian sky
      const geo = new THREE.DodecahedronGeometry(6, 1);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xcfd8dc,
        roughness: 0.8
      });
      const phobos = new THREE.Mesh(geo, mat);
      phobos.position.set(120, 110, -150);
      return phobos;
    }
  }

  private createStormParticles(): THREE.Points {
    const count = 600;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 80;
      pos[i + 1] = Math.random() * 30;
      pos[i + 2] = (Math.random() - 0.5) * 80;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xf43f5e,
      size: 0.8,
      transparent: true,
      opacity: 0
    });
    return new THREE.Points(geo, mat);
  }

  public setPlanetEnvironment(planet: PlanetType) {
    this.planet = planet;

    if (planet === 'moon') {
      this.scene.background = new THREE.Color(0x020617);
      this.scene.fog = new THREE.FogExp2(0x020617, 0.0035);
      (this.terrainMesh.material as THREE.MeshStandardMaterial).color.setHex(0x334155);
      this.hemiLight.color.setHex(0xdbeafe);
      this.hemiLight.groundColor.setHex(0x0f172a);
      this.dirLight.color.setHex(0xfffbeb);
      this.dirLight.intensity = 2.4;
    } else {
      // Mars Red Planet Atmosphere
      this.scene.background = new THREE.Color(0x451a03);
      this.scene.fog = new THREE.FogExp2(0x571e06, 0.007);
      (this.terrainMesh.material as THREE.MeshStandardMaterial).color.setHex(0x9a3412);
      this.hemiLight.color.setHex(0xfed7aa);
      this.hemiLight.groundColor.setHex(0x451a03);
      this.dirLight.color.setHex(0xfef08a);
      this.dirLight.intensity = 1.9;
    }
  }

  public setStormVisuals(isStorm: boolean) {
    const stormMat = this.stormParticles.material as THREE.PointsMaterial;
    if (isStorm) {
      stormMat.opacity = 0.85;
      if (this.scene.fog) {
        (this.scene.fog as THREE.FogExp2).color.setHex(0x881337);
        (this.scene.fog as THREE.FogExp2).density = 0.015;
      }
    } else {
      stormMat.opacity = 0;
      if (this.scene.fog) {
        (this.scene.fog as THREE.FogExp2).color.setHex(this.planet === 'mars' ? 0x571e06 : 0x020617);
        (this.scene.fog as THREE.FogExp2).density = this.planet === 'mars' ? 0.007 : 0.0035;
      }
    }
  }

  // Camera Third-Person Orbit & Follow
  public updateCamera(playerPos: THREE.Vector3) {
    // Calculate target camera offset from yaw and pitch
    const cx = playerPos.x - Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;
    const cz = playerPos.z - Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;
    const cy = playerPos.y + Math.sin(this.cameraPitch) * this.cameraDistance + 1.2;

    this.camera.position.set(cx, Math.max(cy, this.getTerrainHeight(cx, cz) + 0.8), cz);
    this.camera.lookAt(playerPos.x, playerPos.y + 1.4, playerPos.z);

    // Keep celestial body in distant sky follow
    this.celestialBody.position.x = playerPos.x + (this.planet === 'moon' ? 160 : 120);
    this.celestialBody.position.z = playerPos.z + (this.planet === 'moon' ? -180 : -150);

    // Animate storm particles around player
    if ((this.stormParticles.material as THREE.PointsMaterial).opacity > 0) {
      this.stormParticles.position.copy(playerPos);
      this.stormParticles.rotation.y += 0.015;
    }
  }

  public rotateCamera(deltaYaw: number, deltaPitch: number) {
    this.cameraYaw -= deltaYaw;
    this.cameraPitch = Math.max(0.08, Math.min(1.2, this.cameraPitch + deltaPitch));
  }

  public zoomCamera(deltaZoom: number) {
    this.cameraDistance = Math.max(4.0, Math.min(18.0, this.cameraDistance + deltaZoom));
  }

  public getCameraYaw(): number {
    return this.cameraYaw;
  }

  // Hologram Preview Placement
  public updateHologram(type: BuildingType | null, x: number, z: number, rotation: number, isValid: boolean) {
    if (!type) {
      if (this.hologramPreview) {
        this.scene.remove(this.hologramPreview);
        this.hologramPreview = null;
      }
      return;
    }

    if (!this.hologramPreview || this.hologramPreview.name !== `building_${type}`) {
      if (this.hologramPreview) this.scene.remove(this.hologramPreview);
      this.hologramPreview = createBuildingMesh(type, true, isValid);
      this.scene.add(this.hologramPreview);
    }

    const y = this.getTerrainHeight(x, z);
    this.hologramPreview.position.set(x, y, z);
    this.hologramPreview.rotation.y = rotation;
  }

  // Mining Laser Visual Effect
  public showMiningLaser(startX: number, startY: number, startZ: number, targetX: number, targetY: number, targetZ: number) {
    if (!this.laserBeam) {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(startX, startY, startZ),
        new THREE.Vector3(targetX, targetY, targetZ)
      ]);
      const mat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 3 });
      this.laserBeam = new THREE.Line(geo, mat);
      this.scene.add(this.laserBeam);
    } else {
      const pos = this.laserBeam.geometry.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(0, startX, startY, startZ);
      pos.setXYZ(1, targetX, targetY, targetZ);
      pos.needsUpdate = true;
      this.laserBeam.visible = true;
    }
  }

  public hideMiningLaser() {
    if (this.laserBeam) {
      this.laserBeam.visible = false;
    }
  }

  public handleResize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose() {
    this.renderer.dispose();
  }
}
