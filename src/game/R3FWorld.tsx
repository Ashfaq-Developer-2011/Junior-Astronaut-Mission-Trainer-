import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { BuildingType, PlacedBuilding, PlanetType, ResourceNode } from '../types/survival';
import { CharacterMesh } from './components/CharacterMesh';
import { CameraOrbitDelta, ThirdPersonCamera } from './components/ThirdPersonCamera';
import { ApolloLunarModule } from './components/ApolloLunarModule';
import { NasaHabitatModule } from './components/NasaHabitatModule';
import { StormShelterModule } from './components/StormShelterModule';
import { usePlayerInput } from './PlayerController';
import { createBuildingMesh, createResourceNodeMesh } from './three/WorldObjects';
import { createTerrainGeometry } from './three/PlanetaryTerrain';
import { createMoonSurfaceMaps } from './three/MoonTextureGenerator';
import { createMarsSurfaceMaps } from './three/MarsTextureGenerator';
import {
  createContactPadTexture,
  HorizonCraterRim,
  InstancedPlanetaryRocks,
  MarsDustParticles,
  MoonLandingFootprints,
  SceneEnvironment
} from './components/PlanetaryEffects';
import { sound } from '../services/audio';

const isSoftwareGl = (() => {
  if (typeof document === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return true;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(renderer);
  } catch {
    return false;
  }
})();

export interface VirtualInputState {
  moveX: number;
  moveY: number;
  jump: boolean;
  sprint: boolean;
  interact: boolean;
}

export interface R3FWorldProps {
  planet: PlanetType;
  playerPos: [number, number, number];
  playerRotation?: number;
  spawnToken?: number;
  isPaused?: boolean;
  virtualInputRef?: React.MutableRefObject<VirtualInputState>;
  cameraOrbitDeltaRef?: React.MutableRefObject<CameraOrbitDelta>;
  onPlayerMove: (
    delta: number,
    pos: [number, number, number],
    rotation: number,
    isMoving: boolean,
    isSprinting: boolean,
    isJumping: boolean
  ) => void;
  onInteract?: () => void;
  onBuildingClick?: (building: PlacedBuilding) => void;
  resourceNodes: ResourceNode[];
  placedBuildings: PlacedBuilding[];
  activeBuildType: BuildingType | null;
  canAffordBuild: boolean;
  onPlaceBuildingAtCoords: (type: BuildingType, x: number, z: number) => void;
  onMineNodeClick: (nodeId: string) => void;
  isStormActive: boolean;
  getTerrainHeight: (x: number, z: number) => number;
}

/**
 * Procedural Terrain Component with Pointer Raycasting for Mouse-Click Placement
 */
const Terrain: React.FC<{
  planet: PlanetType;
  onPointerMoveOnGround: (point: THREE.Vector3) => void;
  onPointerClickOnGround: (point: THREE.Vector3) => void;
}> = React.memo(({ planet, onPointerMoveOnGround, onPointerClickOnGround }) => {
  const maps = useMemo(
    () => (planet === 'moon' ? createMoonSurfaceMaps(1024) : createMarsSurfaceMaps(1024)),
    [planet]
  );

  React.useEffect(() => {
    return () => {
      maps.dispose();
    };
  }, [maps]);

  const geo = useMemo(() => createTerrainGeometry(planet, 320, 140), [planet]);

  React.useEffect(() => {
    return () => {
      geo.dispose();
    };
  }, [geo]);

  return (
    <mesh
      geometry={geo}
      receiveShadow
      onPointerMove={(e) => {
        e.stopPropagation();
        onPointerMoveOnGround(e.point);
      }}
      onClick={(e) => {
        // Place only on a genuine click, not after dragging to orbit the camera
        if (e.button === 0 && e.delta <= 6) {
          e.stopPropagation();
          onPointerClickOnGround(e.point);
        }
      }}
    >
      <meshStandardMaterial
        map={maps.colorMap}
        bumpMap={maps.bumpMap}
        bumpScale={planet === 'moon' ? 0.38 : 0.32}
        vertexColors
        color="#ffffff"
        roughness={planet === 'moon' ? 0.94 : 0.88}
        metalness={0.04}
      />
    </mesh>
  );
});

/**
 * 3D Hologram Structure Preview that snaps to mouse coordinates
 */
const HologramPreview: React.FC<{
  type: BuildingType;
  position: [number, number, number];
  isValid: boolean;
}> = ({ type, position, isValid }) => {
  const isLargeHabitat = type === 'habitat';
  const previewMesh = useMemo(() => createBuildingMesh(type, true, isValid), [type, isValid]);
  return (
    <primitive
      object={previewMesh}
      position={position}
      scale={isLargeHabitat ? [2.6, 2.6, 2.6] : [1, 1, 1]}
    />
  );
};

/**
 * Standard Procedural Building Mesh (isolates useMemo cleanly for Hook safety)
 */
const StandardBuildingMesh: React.FC<{
  building: PlacedBuilding;
  y: number;
  onClick?: () => void;
}> = ({ building, y, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const settleScaleRef = useRef(0.82);

  const mesh = useMemo(() => {
    const m = createBuildingMesh(building.type, false);
    m.rotation.y = building.rotation;
    return m;
  }, [building.type, building.rotation]);

  const contactPadTex = useMemo(() => createContactPadTexture(128, '10, 14, 22'), []);

  React.useEffect(() => {
    return () => {
      contactPadTex.dispose();
    };
  }, [contactPadTex]);

  useFrame((_, rawDelta) => {
    if (!groupRef.current) return;
    const dt = Math.min(Math.max(rawDelta, 0), 0.1);
    if (Math.abs(1 - settleScaleRef.current) > 0.001) {
      settleScaleRef.current = THREE.MathUtils.damp(settleScaleRef.current, 1, 10, dt);
      groupRef.current.scale.setScalar(settleScaleRef.current);
    }
  });

  const isInteractive = building.type === 'greenhouse' || building.type === 'research_lab';

  return (
    <group
      ref={groupRef}
      position={[building.x, y, building.z]}
      scale={[0.82, 0.82, 0.82]}
      onClick={
        isInteractive && onClick
          ? (e) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
      onPointerOver={
        isInteractive
          ? () => {
              document.body.style.cursor = 'pointer';
            }
          : undefined
      }
      onPointerOut={
        isInteractive
          ? () => {
              document.body.style.cursor = 'default';
            }
          : undefined
      }
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[5.2, 5.2]} />
        <meshBasicMaterial
          map={contactPadTex}
          transparent
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
      <primitive object={mesh} />
    </group>
  );
};

/**
 * 3D Placed Building Item Wrapper (Strict Hook-Order Safe)
 */
const BuildingItem: React.FC<{
  building: PlacedBuilding;
  y: number;
  onClick?: () => void;
}> = ({ building, y, onClick }) => {
  if (building.type === 'habitat') {
    return (
      <NasaHabitatModule
        position={[building.x, y, building.z]}
        rotation={[0, building.rotation, 0]}
      />
    );
  }

  if (building.type === 'rad_shelter') {
    return (
      <StormShelterModule
        position={[building.x, y, building.z]}
        rotation={[0, building.rotation, 0]}
      />
    );
  }

  return <StandardBuildingMesh building={building} y={y} onClick={onClick} />;
};

/**
 * 3D Collectible Resource Node
 */
const ResourceNodeItem: React.FC<{
  node: ResourceNode;
  y: number;
  planet: PlanetType;
  onClick: () => void;
}> = ({ node, y, planet, onClick }) => {
  const mesh = useMemo(() => createResourceNodeMesh(node.type, planet), [node.type, planet]);

  return (
    <group
      position={[node.x, y, node.z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <primitive object={mesh} />
    </group>
  );
};

/**
 * Official NASA Apollo Lunar Module Touchdown Lander
 */
const LanderCraft: React.FC<{ y: number }> = ({ y }) => {
  return <ApolloLunarModule position={[-6, y, -6]} />;
};

/**
 * Celestial Sky & Stars
 */
const SkyAndStars: React.FC<{ planet: PlanetType }> = React.memo(({ planet }) => {
  const starGeo = useMemo(() => {
    const starCount = 1500;
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 320 + Math.random() * 45;
      pos[i] = r * Math.sin(phi) * Math.cos(theta);
      pos[i + 1] = Math.abs(r * Math.cos(phi)) + 10;
      pos[i + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  React.useEffect(() => {
    return () => {
      starGeo.dispose();
    };
  }, [starGeo]);

  return (
    <group>
      <points geometry={starGeo}>
        <pointsMaterial
          size={planet === 'moon' ? 1.45 : 1.1}
          color="#ffffff"
          transparent
          opacity={planet === 'moon' ? 0.94 : 0.38}
        />
      </points>

      {planet === 'moon' ? (
        // The Earth in the lunar sky with subtle atmospheric glow rim
        <group position={[160, 140, -180]}>
          <mesh>
            <sphereGeometry args={[14, 28, 28]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#1d4ed8"
              emissiveIntensity={0.42}
              roughness={0.42}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[15.1, 24, 24]} />
            <meshBasicMaterial
              color="#60a5fa"
              transparent
              opacity={0.2}
              depthWrite={false}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      ) : (
        // Phobos moon in Martian sky
        <mesh position={[120, 110, -150]}>
          <dodecahedronGeometry args={[6, 1]} />
          <meshStandardMaterial color="#cfd8dc" roughness={0.85} />
        </mesh>
      )}
    </group>
  );
});

/**
 * Controlled Avatar & Physics in the R3F Loop
 */
const PlayerAvatarScene: React.FC<{
  initialPos: [number, number, number];
  initialRotation: number;
  spawnToken: number;
  isPaused: boolean;
  planet: PlanetType;
  placedBuildings: PlacedBuilding[];
  getTerrainHeight: (x: number, z: number) => number;
  virtualInputRef?: React.MutableRefObject<VirtualInputState>;
  cameraOrbitDeltaRef?: React.MutableRefObject<CameraOrbitDelta>;
  onCameraYawChange: (yaw: number) => void;
  onUpdateMovement: (
    delta: number,
    pos: [number, number, number],
    rot: number,
    moving: boolean,
    sprinting: boolean,
    jumping: boolean
  ) => void;
  onInteract?: () => void;
}> = ({
  initialPos,
  initialRotation,
  spawnToken,
  isPaused,
  planet,
  placedBuildings,
  getTerrainHeight,
  virtualInputRef,
  cameraOrbitDeltaRef,
  onCameraYawChange,
  onUpdateMovement,
  onInteract
}) => {
  const { inputRef } = usePlayerInput(false);

  const avatarGroupRef = useRef<THREE.Group>(null);
  const posRef = useRef(new THREE.Vector3(...initialPos));
  const velYRef = useRef(0);
  const rotRef = useRef(initialRotation);
  const isGroundedRef = useRef(true);
  const cameraYawRef = useRef(0);
  const prevInteractRef = useRef(false);

  const [animState, setAnimState] = useState({
    isMoving: false,
    isSprinting: false,
    isJumping: false
  });
  const stepTimerRef = useRef(0);

  // Reset active inputs whenever game pauses so movement never gets stuck
  React.useEffect(() => {
    if (isPaused) {
      inputRef.current.forward = false;
      inputRef.current.backward = false;
      inputRef.current.left = false;
      inputRef.current.right = false;
      inputRef.current.jump = false;
      inputRef.current.sprint = false;
      inputRef.current.interact = false;
      if (virtualInputRef?.current) {
        virtualInputRef.current.moveX = 0;
        virtualInputRef.current.moveY = 0;
        virtualInputRef.current.jump = false;
        virtualInputRef.current.interact = false;
      }
      setAnimState(prev =>
        prev.isMoving || prev.isSprinting
          ? { ...prev, isMoving: false, isSprinting: false }
          : prev
      );
    }
  }, [isPaused, inputRef, virtualInputRef]);

  // Reset position cleanly on resume, respawn, or planet switch
  React.useEffect(() => {
    const startY = getTerrainHeight(initialPos[0], initialPos[2]);
    posRef.current.set(initialPos[0], startY, initialPos[2]);
    velYRef.current = 0;
    isGroundedRef.current = true;
    rotRef.current = initialRotation;
    if (avatarGroupRef.current) {
      avatarGroupRef.current.position.copy(posRef.current);
      avatarGroupRef.current.rotation.y = initialRotation;
    }
  }, [spawnToken, initialPos, initialRotation, getTerrainHeight]);

  const walkSpeed = 5.2;
  const sprintSpeed = 9.5;
  const gravity = planet === 'moon' ? -5.5 : -9.8;
  const jumpForce = planet === 'moon' ? 5.2 : 4.4;

  useFrame((_, rawDelta) => {
    const dt = Math.min(Math.max(rawDelta, 0), 0.1);
    const input = inputRef.current;
    const vInput = virtualInputRef?.current;

    if (isPaused) {
      if (avatarGroupRef.current) {
        avatarGroupRef.current.position.copy(posRef.current);
        avatarGroupRef.current.rotation.y = rotRef.current;
      }
      return;
    }

    const yaw = cameraYawRef.current;

    // Rising-edge interaction trigger ([E] key or mobile USE button)
    const interactActive = input.interact || Boolean(vInput?.interact);
    if (interactActive && !prevInteractRef.current) {
      onInteract?.();
    }
    prevInteractRef.current = interactActive;

    // 1. WASD + Virtual Stick Calculations relative to Camera Yaw
    let forward = (input.forward ? 1 : 0) - (input.backward ? 1 : 0) + (vInput?.moveY || 0);
    let right = (input.right ? 1 : 0) - (input.left ? 1 : 0) + (vInput?.moveX || 0);
    forward = THREE.MathUtils.clamp(forward, -1, 1);
    right = THREE.MathUtils.clamp(right, -1, 1);

    const moveMag = Math.sqrt(forward * forward + right * right);
    const isMoving = moveMag > 0.05;
    const isSprinting = (input.sprint || Boolean(vInput?.sprint)) && isMoving;
    const speed = isSprinting ? sprintSpeed : walkSpeed;

    if (isMoving) {
      const normScale = moveMag > 1 ? 1 / moveMag : 1;
      const normF = forward * normScale;
      const normR = right * normScale;

      const fX = Math.sin(yaw);
      const fZ = Math.cos(yaw);
      const rX = -Math.cos(yaw);
      const rZ = Math.sin(yaw);

      const dirX = fX * normF + rX * normR;
      const dirZ = fZ * normF + rZ * normR;

      posRef.current.x = THREE.MathUtils.clamp(posRef.current.x + dirX * speed * dt, -145, 145);
      posRef.current.z = THREE.MathUtils.clamp(posRef.current.z + dirZ * speed * dt, -145, 145);

      // Keep astronaut from clipping through compact armored Storm Shelter walls
      for (const bld of placedBuildings) {
        if (bld.type !== 'rad_shelter') continue;
        const bldGroundY = getTerrainHeight(bld.x, bld.z);
        if (posRef.current.y > bldGroundY + 3.2) continue;
        const dx = posRef.current.x - bld.x;
        const dz = posRef.current.z - bld.z;
        const minDist = 3.75;
        const distSq = dx * dx + dz * dz;
        if (distSq > 0.0001 && distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq);
          posRef.current.x = bld.x + (dx / dist) * minDist;
          posRef.current.z = bld.z + (dz / dist) * minDist;
        } else if (distSq <= 0.0001) {
          posRef.current.z = bld.z + minDist;
        }
      }

      const targetAngle = Math.atan2(dirX, dirZ);
      let angleDiff = targetAngle - rotRef.current;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      rotRef.current += angleDiff * Math.min(1, 12 * dt);
    }

    // 2. Jump and Ground Collision & Audio
    const groundY = getTerrainHeight(posRef.current.x, posRef.current.z);
    const jumpPressed = input.jump || Boolean(vInput?.jump);

    if (jumpPressed && isGroundedRef.current) {
      velYRef.current = jumpForce;
      isGroundedRef.current = false;
      sound.playJump();
    }

    if (!isGroundedRef.current) {
      velYRef.current += gravity * dt;
      posRef.current.y += velYRef.current * dt;

      if (posRef.current.y <= groundY) {
        posRef.current.y = groundY;
        velYRef.current = 0;
        isGroundedRef.current = true;
        sound.playLand();
      }
    } else {
      posRef.current.y = groundY;
      if (isMoving) {
        stepTimerRef.current += dt * (isSprinting ? 9.5 : 5.5);
        if (stepTimerRef.current > Math.PI) {
          stepTimerRef.current = 0;
          sound.playFootstep(planet);
        }
      }
    }

    // Apply transform directly to Three.js group at full framerate without React re-renders
    if (avatarGroupRef.current) {
      avatarGroupRef.current.position.copy(posRef.current);
      avatarGroupRef.current.rotation.y = rotRef.current;
    }

    // 3. Sync discrete animation booleans only when they transition
    const isJumping = !isGroundedRef.current;
    setAnimState(prev => {
      if (prev.isMoving !== isMoving || prev.isSprinting !== isSprinting || prev.isJumping !== isJumping) {
        return { isMoving, isSprinting, isJumping };
      }
      return prev;
    });

    onUpdateMovement(
      dt,
      [posRef.current.x, posRef.current.y, posRef.current.z],
      rotRef.current,
      isMoving,
      isSprinting,
      isJumping
    );
  });

  return (
    <>
      {/* 3D Character Avatar transformed smoothly via ref */}
      <group ref={avatarGroupRef} position={initialPos}>
        <CharacterMesh
          isMoving={animState.isMoving}
          isSprinting={animState.isSprinting}
          isJumping={animState.isJumping}
        />
      </group>

      {/* Orbiting Third Person Camera tracking player */}
      <ThirdPersonCamera
        target={posRef.current}
        distance={8.5}
        heightOffset={1.4}
        cameraOrbitDeltaRef={cameraOrbitDeltaRef}
        getGroundHeight={getTerrainHeight}
        onCameraYawChange={(y) => {
          cameraYawRef.current = y;
          onCameraYawChange(y);
        }}
      />
    </>
  );
};

/**
 * Main R3FWorld Canvas Experience
 */
export const R3FWorld: React.FC<R3FWorldProps> = ({
  planet,
  playerPos,
  playerRotation = 0,
  spawnToken = 0,
  isPaused = false,
  virtualInputRef,
  cameraOrbitDeltaRef,
  onPlayerMove,
  onInteract,
  onBuildingClick,
  resourceNodes,
  placedBuildings,
  activeBuildType,
  canAffordBuild,
  onPlaceBuildingAtCoords,
  onMineNodeClick,
  isStormActive,
  getTerrainHeight
}) => {
  const [hoverGroundPos, setHoverGroundPos] = useState<[number, number, number] | null>(null);
  const cameraYawRef = useRef(0);

  React.useEffect(() => {
    if (!activeBuildType) {
      setHoverGroundPos(null);
    }
  }, [activeBuildType]);

  const handlePointerMoveOnGround = React.useCallback((point: THREE.Vector3) => {
    if (activeBuildType) {
      const y = getTerrainHeight(point.x, point.z);
      setHoverGroundPos([point.x, y, point.z]);
    }
  }, [activeBuildType, getTerrainHeight]);

  const handlePointerClickOnGround = React.useCallback((point: THREE.Vector3) => {
    if (activeBuildType) {
      onPlaceBuildingAtCoords(activeBuildType, point.x, point.z);
    }
  }, [activeBuildType, onPlaceBuildingAtCoords]);

  const handleCameraYawChange = React.useCallback((yaw: number) => {
    cameraYawRef.current = yaw;
  }, []);

  const skyColor = planet === 'mars' ? (isStormActive ? '#6e280f' : '#52220d') : '#01040d';
  const fogColor = planet === 'mars' ? (isStormActive ? '#7c2d12' : '#5e230c') : '#020617';
  const fogDensity = planet === 'mars' ? (isStormActive ? 0.0115 : 0.0058) : 0.0022;

  return (
    <Canvas
      dpr={isSoftwareGl ? 1 : [1, 2]}
      shadows={!isSoftwareGl}
      camera={{ fov: 65, near: 0.1, far: 1000 }}
      gl={{
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: planet === 'moon' ? 1.12 : 1.08,
        preserveDrawingBuffer: true
      }}
      className="w-full h-full cursor-crosshair"
    >
      <color attach="background" args={[skyColor]} />
      <fogExp2 attach="fog" args={[fogColor, fogDensity]} />
      <SceneEnvironment planet={planet} />

      {/* Lighting Rig: crisp low-angle shadows on Moon; warm dusty hemisphere fill on Mars */}
      <hemisphereLight
        args={[
          planet === 'mars' ? '#fed7aa' : '#dbeafe',
          planet === 'mars' ? '#451a03' : '#090d16',
          planet === 'mars' ? 0.55 : 0.22
        ]}
      />
      <directionalLight
        position={planet === 'moon' ? [85, 58, 45] : [75, 65, 45]}
        intensity={planet === 'moon' ? 2.7 : 2.15}
        color={planet === 'moon' ? '#fffdf5' : '#fde68a'}
        castShadow
        shadow-mapSize={isSoftwareGl ? [1024, 1024] : [2048, 2048]}
        shadow-camera-near={10}
        shadow-camera-far={260}
        shadow-camera-left={-75}
        shadow-camera-right={75}
        shadow-camera-top={75}
        shadow-camera-bottom={-75}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
      />

      {/* Celestial Sky and Starfield */}
      <SkyAndStars planet={planet} />

      {/* Distant Basin / Crater Massif Horizon Rim */}
      <HorizonCraterRim planet={planet} />

      {/* Geological Boulders (Single InstancedMesh Draw Call) */}
      <InstancedPlanetaryRocks planet={planet} />

      {/* Mars Atmospheric Dust (Never mounted on Moon vacuum) */}
      {planet === 'mars' && <MarsDustParticles isStormActive={isStormActive} isPaused={isPaused} />}

      {/* Touchdown Lander Craft */}
      <LanderCraft y={getTerrainHeight(-6, -6)} />

      {/* Authentic Lunar Bootprints at the Moon Landing Spot */}
      {planet === 'moon' && <MoonLandingFootprints getTerrainHeight={getTerrainHeight} />}

      {/* Procedural Terrain with Pointer Click Placement Detection */}
      <Terrain
        planet={planet}
        onPointerMoveOnGround={handlePointerMoveOnGround}
        onPointerClickOnGround={handlePointerClickOnGround}
      />

      {/* Placed Base Buildings */}
      {placedBuildings.map((bld) => (
        <BuildingItem
          key={bld.id}
          building={bld}
          y={getTerrainHeight(bld.x, bld.z)}
          onClick={onBuildingClick ? () => onBuildingClick(bld) : undefined}
        />
      ))}

      {/* Collectible Resource Nodes (Clickable for Mining) */}
      {resourceNodes.map((node) => (
        <ResourceNodeItem
          key={node.id}
          node={node}
          planet={planet}
          y={getTerrainHeight(node.x, node.z)}
          onClick={() => onMineNodeClick(node.id)}
        />
      ))}

      {/* Hologram Building Preview following Mouse on Ground */}
      {activeBuildType && hoverGroundPos && (
        <HologramPreview
          type={activeBuildType}
          position={hoverGroundPos}
          isValid={canAffordBuild}
        />
      )}

      {/* Player Avatar Controlled via WASD & Orbiting Camera */}
      <PlayerAvatarScene
        initialPos={playerPos}
        initialRotation={playerRotation}
        spawnToken={spawnToken}
        isPaused={isPaused}
        planet={planet}
        placedBuildings={placedBuildings}
        getTerrainHeight={getTerrainHeight}
        virtualInputRef={virtualInputRef}
        cameraOrbitDeltaRef={cameraOrbitDeltaRef}
        onCameraYawChange={handleCameraYawChange}
        onUpdateMovement={onPlayerMove}
        onInteract={onInteract}
      />
    </Canvas>
  );
};
