import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export interface ArticulatedAstronautProps {
  isMoving?: boolean;
  isSprinting?: boolean;
  isJumping?: boolean;
  scale?: number;
}

/**
 * ArticulatedAstronaut: Full 3D Astronaut Avatar with Multi-Segment Joints
 * Real hierarchical joints for Shoulders, Elbows, Wrists, Hips, Knees, and Ankles.
 */
export const ArticulatedAstronaut: React.FC<ArticulatedAstronautProps> = ({
  isMoving = false,
  isSprinting = false,
  isJumping = false,
  scale = 1
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const pelvisRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);

  // Arm Joints
  const leftShoulderRef = useRef<THREE.Group>(null);
  const leftElbowRef = useRef<THREE.Group>(null);
  const leftWristRef = useRef<THREE.Group>(null);

  const rightShoulderRef = useRef<THREE.Group>(null);
  const rightElbowRef = useRef<THREE.Group>(null);
  const rightWristRef = useRef<THREE.Group>(null);

  // Leg Joints
  const leftHipRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const leftAnkleRef = useRef<THREE.Group>(null);

  const rightHipRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
  const rightAnkleRef = useRef<THREE.Group>(null);

  // Thruster Plume
  const thrusterRef = useRef<THREE.Mesh>(null);
  const animTimer = useRef(0);

  // Dynamic Joint Kinematics in Render Loop
  useFrame((_, delta) => {
    if (!rootRef.current || !pelvisRef.current) return;

    // 1. JUMP / LOW-GRAVITY FLIGHT LOCOMOTION
    if (isJumping) {
      if (thrusterRef.current) thrusterRef.current.visible = true;

      // Hips & Torso: slight backward pitch for thruster balance
      pelvisRef.current.position.y = 1.05;
      pelvisRef.current.rotation.x = -0.06;
      pelvisRef.current.rotation.z = 0;

      // Legs: Knees flex back naturally, feet dangle
      if (leftHipRef.current) leftHipRef.current.rotation.x = -0.3;
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = 0.55; // Knee bends back
      if (leftAnkleRef.current) leftAnkleRef.current.rotation.x = 0.25;

      if (rightHipRef.current) rightHipRef.current.rotation.x = -0.15;
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = 0.45; // Knee bends back
      if (rightAnkleRef.current) rightAnkleRef.current.rotation.x = 0.2;

      // Arms: Float up and outward for zero-g balance, elbows flexed
      if (leftShoulderRef.current) {
        leftShoulderRef.current.rotation.x = 0.6;
        leftShoulderRef.current.rotation.z = 0.35;
      }
      if (leftElbowRef.current) leftElbowRef.current.rotation.x = -0.75; // Elbow flexes

      if (rightShoulderRef.current) {
        rightShoulderRef.current.rotation.x = 0.65;
        rightShoulderRef.current.rotation.z = -0.35;
      }
      if (rightElbowRef.current) rightElbowRef.current.rotation.x = -0.8; // Elbow flexes
      return;
    }

    if (thrusterRef.current) thrusterRef.current.visible = false;

    // 2. RUN / WALK LOCOMOTION WITH FULL JOINT ROTATION
    if (isMoving) {
      const speed = isSprinting ? 13.5 : 8.5;
      animTimer.current += delta * speed;
      const phase = animTimer.current;

      const strideAmp = isSprinting ? 0.8 : 0.55;
      const armAmp = isSprinting ? 0.75 : 0.48;

      // Vertical bounce & forward lean
      const bounce = Math.abs(Math.sin(phase)) * (isSprinting ? 0.1 : 0.05);
      pelvisRef.current.position.y = 0.98 + bounce;
      pelvisRef.current.rotation.x = isSprinting ? 0.18 : 0.06;
      pelvisRef.current.rotation.z = Math.sin(phase) * (isSprinting ? 0.05 : 0.025);

      // --- LEGS KINEMATICS ---
      // Right Leg (Hip -> Knee -> Ankle)
      const rHipAngle = Math.sin(phase) * strideAmp;
      if (rightHipRef.current) rightHipRef.current.rotation.x = rHipAngle;
      // Knee bends backward only during the backstroke and swing phase!
      const rKneeBend = Math.max(0, -Math.sin(phase) * (isSprinting ? 1.25 : 0.9));
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = rKneeBend;
      if (rightAnkleRef.current) rightAnkleRef.current.rotation.x = -rHipAngle * 0.3;

      // Left Leg (Opposite phase)
      const lHipAngle = -Math.sin(phase) * strideAmp;
      if (leftHipRef.current) leftHipRef.current.rotation.x = lHipAngle;
      const lKneeBend = Math.max(0, Math.sin(phase) * (isSprinting ? 1.25 : 0.9));
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = lKneeBend;
      if (leftAnkleRef.current) leftAnkleRef.current.rotation.x = -lHipAngle * 0.3;

      // --- ARMS KINEMATICS ---
      // Right Arm (Shoulder -> Elbow -> Wrist) swings opposite to right leg
      const rArmAngle = -Math.sin(phase) * armAmp;
      if (rightShoulderRef.current) {
        rightShoulderRef.current.rotation.x = rArmAngle;
        rightShoulderRef.current.rotation.z = -0.12;
      }
      // Elbow flexes forward when swinging forward, straightens on backstroke
      const rElbowFlex = -0.35 - Math.max(0, -Math.sin(phase) * (isSprinting ? 0.9 : 0.6));
      if (rightElbowRef.current) rightElbowRef.current.rotation.x = rElbowFlex;

      // Left Arm (Opposite phase)
      const lArmAngle = Math.sin(phase) * armAmp;
      if (leftShoulderRef.current) {
        leftShoulderRef.current.rotation.x = lArmAngle;
        leftShoulderRef.current.rotation.z = 0.12;
      }
      const lElbowFlex = -0.35 - Math.max(0, Math.sin(phase) * (isSprinting ? 0.9 : 0.6));
      if (leftElbowRef.current) leftElbowRef.current.rotation.x = lElbowFlex;

    } else {
      // 3. IDLE: GENTLE ORGANIC BREATHING & ZERO-G NEUTRAL JOINT POSE
      animTimer.current += delta * 1.8;
      const breathe = Math.sin(animTimer.current);

      pelvisRef.current.position.y = 0.96 + breathe * 0.015;
      pelvisRef.current.rotation.x = THREE.MathUtils.lerp(pelvisRef.current.rotation.x, 0, 0.1);
      pelvisRef.current.rotation.z = THREE.MathUtils.lerp(pelvisRef.current.rotation.z, 0, 0.1);

      // Relax legs with slight natural knee flex
      if (leftHipRef.current) leftHipRef.current.rotation.x = THREE.MathUtils.lerp(leftHipRef.current.rotation.x, -0.04, 0.1);
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = THREE.MathUtils.lerp(leftKneeRef.current.rotation.x, 0.08, 0.1);
      if (leftAnkleRef.current) leftAnkleRef.current.rotation.x = 0;

      if (rightHipRef.current) rightHipRef.current.rotation.x = THREE.MathUtils.lerp(rightHipRef.current.rotation.x, 0.04, 0.1);
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = THREE.MathUtils.lerp(rightKneeRef.current.rotation.x, 0.08, 0.1);
      if (rightAnkleRef.current) rightAnkleRef.current.rotation.x = 0;

      // Relax arms with natural elbow flexion
      if (leftShoulderRef.current) {
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.05, 0.1);
        leftShoulderRef.current.rotation.z = 0.08;
      }
      if (leftElbowRef.current) leftElbowRef.current.rotation.x = -0.28;

      if (rightShoulderRef.current) {
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, -0.05, 0.1);
        rightShoulderRef.current.rotation.z = -0.08;
      }
      if (rightElbowRef.current) rightElbowRef.current.rotation.x = -0.32;
    }
  });

  return (
    <group ref={rootRef} scale={scale}>
      {/* ======================================================== */}
      {/* 1. PELVIS / HIPS ROOT */}
      {/* ======================================================== */}
      <group ref={pelvisRef} position={[0, 0.96, 0]}>
        {/* Hip Belt / Lower Torso */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.55, 0.28, 0.38]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} metalness={0.15} />
        </mesh>

        {/* Utility Belt & Tool Pouches */}
        <mesh position={[0, -0.06, 0.2]}>
          <boxGeometry args={[0.48, 0.08, 0.08]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>

        {/* ======================================================== */}
        {/* 2. UPPER TORSO, CHEST & LIFE SUPPORT BACKPACK */}
        {/* ======================================================== */}
        <group ref={torsoRef} position={[0, 0.28, 0]}>
          {/* Main TMG Suit Chest */}
          <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
            <boxGeometry args={[0.68, 0.52, 0.44]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.12} />
          </mesh>

          {/* NASA Apollo Red Commander Stripe on Chest */}
          <mesh position={[0, 0.18, 0.23]}>
            <boxGeometry args={[0.42, 0.06, 0.02]} />
            <meshStandardMaterial color="#dc2626" roughness={0.5} />
          </mesh>

          {/* NASA Chest Remote Control Unit (RCU) Box */}
          <mesh position={[0, 0.08, 0.26]} castShadow>
            <boxGeometry args={[0.32, 0.28, 0.12]} />
            <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.6} />
          </mesh>
          {/* RCU Gauge dials */}
          <mesh position={[-0.08, 0.12, 0.33]}>
            <circleGeometry args={[0.035, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[0.08, 0.12, 0.33]}>
            <circleGeometry args={[0.035, 12]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>

          {/* PLSS (Portable Life Support System) Backpack */}
          <mesh position={[0, 0.18, -0.32]} castShadow>
            <boxGeometry args={[0.58, 0.72, 0.32]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.25} />
          </mesh>
          {/* Oxygen Cylinder Caps on Top of Backpack */}
          <mesh position={[-0.15, 0.56, -0.32]}>
            <cylinderGeometry args={[0.07, 0.07, 0.12, 12]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0.15, 0.56, -0.32]}>
            <cylinderGeometry args={[0.07, 0.07, 0.12, 12]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Emergency Ion Maneuvering Thruster Nozzle */}
          <mesh ref={thrusterRef} position={[0, -0.22, -0.32]} rotation={[Math.PI, 0, 0]} visible={false}>
            <coneGeometry args={[0.1, 0.42, 12]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
          </mesh>

          {/* ======================================================== */}
          {/* 3. HELMET & GOLD VISOR */}
          {/* ======================================================== */}
          <group position={[0, 0.56, 0]}>
            {/* White Helmet Sphere */}
            <mesh castShadow>
              <sphereGeometry args={[0.3, 20, 20]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            </mesh>
            {/* Reflective Gold Extravehicular Visor */}
            <mesh position={[0, 0.02, 0.16]} rotation={[0.15, 0, 0]}>
              <sphereGeometry args={[0.22, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.08} metalness={0.96} envMapIntensity={1.8} />
            </mesh>
            {/* Visor Sun Shield Rim */}
            <mesh position={[0, 0.14, 0.18]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.36, 0.04, 0.14]} />
              <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>
          </group>

          {/* ======================================================== */}
          {/* 4. LEFT ARM HIERARCHY (Shoulder -> Elbow -> Wrist) */}
          {/* ======================================================== */}
          <group ref={leftShoulderRef} position={[-0.42, 0.36, 0]}>
            {/* Shoulder Joint Sphere */}
            <mesh castShadow>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
            </mesh>
            {/* Upper Arm / Bicep */}
            <mesh position={[0, -0.2, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.095, 0.36, 12]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.4} />
            </mesh>

            {/* --- LEFT ELBOW JOINT --- */}
            <group ref={leftElbowRef} position={[0, -0.38, 0]}>
              {/* Elbow Joint Sphere */}
              <mesh castShadow>
                <sphereGeometry args={[0.09, 12, 12]} />
                <meshStandardMaterial color="#0284c7" roughness={0.6} metalness={0.4} />
              </mesh>
              {/* Forearm */}
              <mesh position={[0, -0.18, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.085, 0.32, 12]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.4} />
              </mesh>

              {/* --- LEFT WRIST & GLOVE --- */}
              <group ref={leftWristRef} position={[0, -0.34, 0]}>
                {/* Glove Hand */}
                <mesh position={[0, -0.06, 0]} castShadow>
                  <boxGeometry args={[0.12, 0.14, 0.12]} />
                  <meshStandardMaterial color="#334155" roughness={0.8} metalness={0.2} />
                </mesh>
                {/* Thumb finger */}
                <mesh position={[0.05, -0.04, 0.04]}>
                  <boxGeometry args={[0.04, 0.06, 0.04]} />
                  <meshStandardMaterial color="#334155" />
                </mesh>
              </group>
            </group>
          </group>

          {/* ======================================================== */}
          {/* 5. RIGHT ARM HIERARCHY (Shoulder -> Elbow -> Wrist) */}
          {/* ======================================================== */}
          <group ref={rightShoulderRef} position={[0.42, 0.36, 0]}>
            {/* Shoulder Joint Sphere */}
            <mesh castShadow>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
            </mesh>
            {/* Upper Arm / Bicep with Apollo Red Stripe */}
            <mesh position={[0, -0.2, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.095, 0.36, 12]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.102, 0.102, 0.04, 12]} />
              <meshStandardMaterial color="#dc2626" />
            </mesh>

            {/* --- RIGHT ELBOW JOINT --- */}
            <group ref={rightElbowRef} position={[0, -0.38, 0]}>
              {/* Elbow Joint Sphere */}
              <mesh castShadow>
                <sphereGeometry args={[0.09, 12, 12]} />
                <meshStandardMaterial color="#0284c7" roughness={0.6} metalness={0.4} />
              </mesh>
              {/* Forearm */}
              <mesh position={[0, -0.18, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.085, 0.32, 12]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.4} />
              </mesh>

              {/* --- RIGHT WRIST & MINING TOOL --- */}
              <group ref={rightWristRef} position={[0, -0.34, 0]}>
                {/* Glove Hand */}
                <mesh position={[0, -0.06, 0]} castShadow>
                  <boxGeometry args={[0.12, 0.14, 0.12]} />
                  <meshStandardMaterial color="#334155" roughness={0.8} />
                </mesh>
                {/* Handheld EVA Laser Drill / Mining Emitter */}
                <mesh position={[0, -0.08, 0.12]}>
                  <boxGeometry args={[0.09, 0.11, 0.28]} />
                  <meshStandardMaterial color="#0284c7" metalness={0.85} roughness={0.2} emissive="#0284c7" emissiveIntensity={0.3} />
                </mesh>
                <mesh position={[0, -0.08, 0.26]}>
                  <cylinderGeometry args={[0.025, 0.025, 0.05, 8]} />
                  <meshBasicMaterial color="#38bdf8" />
                </mesh>
              </group>
            </group>
          </group>
        </group>

        {/* ======================================================== */}
        {/* 6. LEFT LEG HIERARCHY (Hip -> Knee -> Ankle & Boot) */}
        {/* ======================================================== */}
        <group ref={leftHipRef} position={[-0.2, -0.14, 0]}>
          {/* Hip Joint Socket */}
          <mesh castShadow>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
          </mesh>
          {/* Upper Leg / Thigh */}
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.115, 0.105, 0.42, 12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>

          {/* --- LEFT KNEE JOINT --- */}
          <group ref={leftKneeRef} position={[0, -0.42, 0]}>
            {/* Articulated Knee Joint & Armor Plate */}
            <mesh castShadow>
              <sphereGeometry args={[0.105, 12, 12]} />
              <meshStandardMaterial color="#64748b" roughness={0.6} metalness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.09]}>
              <boxGeometry args={[0.16, 0.14, 0.06]} />
              <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>

            {/* Lower Leg / Shin */}
            <mesh position={[0, -0.22, 0]} castShadow>
              <cylinderGeometry args={[0.105, 0.1, 0.4, 12]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.4} />
            </mesh>

            {/* --- LEFT ANKLE & LUNAR BOOT --- */}
            <group ref={leftAnkleRef} position={[0, -0.42, 0]}>
              <mesh position={[0, -0.08, 0.06]} castShadow receiveShadow>
                <boxGeometry args={[0.2, 0.16, 0.36]} />
                <meshStandardMaterial color="#1e293b" roughness={0.85} metalness={0.1} />
              </mesh>
              {/* Boot Ribbed Sole */}
              <mesh position={[0, -0.16, 0.06]}>
                <boxGeometry args={[0.22, 0.04, 0.38]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ======================================================== */}
        {/* 7. RIGHT LEG HIERARCHY (Hip -> Knee -> Ankle & Boot) */}
        {/* ======================================================== */}
        <group ref={rightHipRef} position={[0.2, -0.14, 0]}>
          {/* Hip Joint Socket */}
          <mesh castShadow>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
          </mesh>
          {/* Upper Leg / Thigh */}
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.115, 0.105, 0.42, 12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>

          {/* --- RIGHT KNEE JOINT --- */}
          <group ref={rightKneeRef} position={[0, -0.42, 0]}>
            {/* Articulated Knee Joint & Armor Plate */}
            <mesh castShadow>
              <sphereGeometry args={[0.105, 12, 12]} />
              <meshStandardMaterial color="#64748b" roughness={0.6} metalness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.09]}>
              <boxGeometry args={[0.16, 0.14, 0.06]} />
              <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>

            {/* Lower Leg / Shin */}
            <mesh position={[0, -0.22, 0]} castShadow>
              <cylinderGeometry args={[0.105, 0.1, 0.4, 12]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.4} />
            </mesh>

            {/* --- RIGHT ANKLE & LUNAR BOOT --- */}
            <group ref={rightAnkleRef} position={[0, -0.42, 0]}>
              <mesh position={[0, -0.08, 0.06]} castShadow receiveShadow>
                <boxGeometry args={[0.2, 0.16, 0.36]} />
                <meshStandardMaterial color="#1e293b" roughness={0.85} metalness={0.1} />
              </mesh>
              {/* Boot Ribbed Sole */}
              <mesh position={[0, -0.16, 0.06]}>
                <boxGeometry args={[0.22, 0.04, 0.38]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
