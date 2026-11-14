import * as THREE from 'three';

export class AstronautCharacter {
  public group: THREE.Group;
  public rootMesh: THREE.Group;

  // Articulated Limbs for Animation
  private head: THREE.Group;
  private torso: THREE.Group;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private backpack: THREE.Mesh;
  private thrusterGlow: THREE.Mesh;

  private animTimer = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'player_astronaut';

    this.rootMesh = new THREE.Group();
    this.group.add(this.rootMesh);

    // Materials
    const suitWhite = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.45,
      metalness: 0.1
    });

    const suitJoints = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
      metalness: 0.2
    });

    const goldVisorMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.05,
      metalness: 0.95,
      emissive: 0xd97706,
      emissiveIntensity: 0.25
    });

    const chestPackMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.3,
      metalness: 0.6
    });

    // 1. Torso & Chest Pack
    this.torso = new THREE.Group();
    this.torso.position.y = 1.05;

    const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.75, 0.45), suitWhite);
    chestMesh.castShadow = true;
    this.torso.add(chestMesh);

    // NASA Chest Remote Control Unit (RCU)
    const rcu = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.12), chestPackMat);
    rcu.position.set(0, 0.05, 0.26);
    this.torso.add(rcu);

    // 2. Life-Support EVA Backpack (PLSS - Portable Life Support System)
    const backpackMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.3 });
    this.backpack = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 0.35), backpackMat);
    this.backpack.position.set(0, 0.1, -0.38);
    this.backpack.castShadow = true;
    this.torso.add(this.backpack);

    // Oxygen Tank Cylinders on top of backpack
    const o2Tank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7 })
    );
    o2Tank.rotation.z = Math.PI / 2;
    o2Tank.position.set(0, 0.45, -0.38);
    this.torso.add(o2Tank);

    // Thruster micro-nozzle (lights up during jump)
    const thrusterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
    });
    this.thrusterGlow = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 8), thrusterMat);
    this.thrusterGlow.rotation.x = Math.PI;
    this.thrusterGlow.position.set(0, -0.4, -0.38);
    this.thrusterGlow.visible = false;
    this.torso.add(this.thrusterGlow);

    // 3. Head & Gold Visor Helmet
    this.head = new THREE.Group();
    this.head.position.y = 0.55;

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 14), suitWhite);
    helmet.castShadow = true;
    this.head.add(helmet);

    // Gold Apollo/Artemis reflective visor
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI, 0, Math.PI * 0.7), goldVisorMat);
    visor.position.set(0, 0.02, 0.12);
    visor.rotation.x = -Math.PI / 8;
    this.head.add(visor);

    this.torso.add(this.head);

    // 4. Arms & Gloves
    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.48, 0.28, 0);

    const lArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.6, 8), suitWhite);
    lArmMesh.position.y = -0.3;
    lArmMesh.castShadow = true;
    this.leftArm.add(lArmMesh);

    const lGlove = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), suitJoints);
    lGlove.position.y = -0.65;
    this.leftArm.add(lGlove);
    this.torso.add(this.leftArm);

    // Right Arm (mining laser arm)
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.48, 0.28, 0);

    const rArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.6, 8), suitWhite);
    rArmMesh.position.y = -0.3;
    rArmMesh.castShadow = true;
    this.rightArm.add(rArmMesh);

    const rGlove = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), suitJoints);
    rGlove.position.y = -0.65;
    this.rightArm.add(rGlove);

    // Mining Laser Tool mounted on right wrist
    const laserTool = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.14, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, emissive: 0x0ea5e9, emissiveIntensity: 0.3 })
    );
    laserTool.position.set(0, -0.65, 0.15);
    this.rightArm.add(laserTool);

    this.torso.add(this.rightArm);

    this.rootMesh.add(this.torso);

    // 5. Legs & Boots
    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.22, 0.72, 0);

    const lLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.65, 8), suitWhite);
    lLegMesh.position.y = -0.32;
    lLegMesh.castShadow = true;
    this.leftLeg.add(lLegMesh);

    const lBoot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.38), suitJoints);
    lBoot.position.set(0, -0.68, 0.08);
    this.leftLeg.add(lBoot);
    this.rootMesh.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.22, 0.72, 0);

    const rLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.65, 8), suitWhite);
    rLegMesh.position.y = -0.32;
    rLegMesh.castShadow = true;
    this.rightLeg.add(rLegMesh);

    const rBoot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.38), suitJoints);
    rBoot.position.set(0, -0.68, 0.08);
    this.rightLeg.add(rBoot);
    this.rootMesh.add(this.rightLeg);
  }

  // Update Animation Cycle based on player movement state
  public updateAnimation(delta: number, isMoving: boolean, isSprinting: boolean, isJumping: boolean) {
    if (isJumping) {
      // In-flight low-gravity pose
      this.thrusterGlow.visible = true;
      this.leftLeg.rotation.x = -0.4;
      this.rightLeg.rotation.x = 0.3;
      this.leftArm.rotation.x = 0.6;
      this.rightArm.rotation.x = 0.8;
      this.torso.position.y = 1.1;
      return;
    }

    this.thrusterGlow.visible = false;

    if (isMoving) {
      const speedMult = isSprinting ? 14 : 9;
      this.animTimer += delta * speedMult;

      const swing = Math.sin(this.animTimer) * (isSprinting ? 0.75 : 0.5);

      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
      this.leftArm.rotation.x = -swing * 0.9;
      this.rightArm.rotation.x = swing * 0.9;

      // Slight body bounce & tilt
      this.torso.position.y = 1.05 + Math.abs(Math.sin(this.animTimer)) * 0.08;
      this.rootMesh.rotation.x = isSprinting ? 0.15 : 0.05;
    } else {
      // Idle breathing cycle
      this.animTimer += delta * 2;
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 0.1);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 0.1);
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.1);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.1);
      this.rootMesh.rotation.x = 0;
      this.torso.position.y = 1.05 + Math.sin(this.animTimer) * 0.02;
    }
  }

  public setRotation(angleY: number) {
    this.rootMesh.rotation.y = angleY;
  }
}
