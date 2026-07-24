"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGalaxyStore } from "@/store/useGalaxyStore";
import * as THREE from "three";

// 1. Swirling accretion disk particle generator (pure outside component)
function createAccretionDisk() {
  const particleCount = 6000;
  const pos = new Float32Array(particleCount * 3);
  const cols = new Float32Array(particleCount * 3);
  const szs = new Float32Array(particleCount);
  const angs = new Float32Array(particleCount);
  const spds = new Float32Array(particleCount);
  const dists = new Float32Array(particleCount);

  const colorWhite = new THREE.Color("#ffffff");
  const colorCyan = new THREE.Color("#22d3ee");
  const colorBlue = new THREE.Color("#3b82f6");
  const colorPurple = new THREE.Color("#a855f7");
  const colorPink = new THREE.Color("#f472b6");

  for (let i = 0; i < particleCount; i++) {
    const branch = i % 4; // 4 swirling arms
    const angleOffset = (branch * 2 * Math.PI) / 4;
    const distance = Math.pow(Math.random(), 2.0) * 5.2 + 0.3; // concentrated at center
    const angle = Math.random() * Math.PI * 2 + angleOffset;
    
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    const y = (Math.random() - 0.5) * 0.35 * (3.0 / (distance + 0.4));

    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;

    angs[i] = angle;
    dists[i] = distance;
    spds[i] = 0.35 + Math.random() * 0.65;
    szs[i] = Math.random() * 0.08 + 0.02;

    let col = colorWhite;
    if (distance < 0.7) {
      col = colorWhite.clone().lerp(colorCyan, distance / 0.7);
    } else if (distance < 2.0) {
      col = colorCyan.clone().lerp(colorBlue, (distance - 0.7) / 1.3);
    } else if (distance < 3.5) {
      col = colorBlue.clone().lerp(colorPurple, (distance - 2.0) / 1.5);
    } else {
      col = colorPurple.clone().lerp(colorPink, Math.min(1.0, (distance - 3.5) / 1.7));
    }

    cols[i * 3] = col.r;
    cols[i * 3 + 1] = col.g;
    cols[i * 3 + 2] = col.b;
  }

  return {
    positions: pos,
    colors: cols,
    sizes: szs,
    angles: angs,
    speeds: spds,
    distances: dists,
  };
}

// 2. Radial sparks generator (pure outside component)
function createSparks(sparkCount: number) {
  const pos = new Float32Array(sparkCount * 3);
  const dirs = new Float32Array(sparkCount * 3);
  const speeds = new Float32Array(sparkCount);
  const ages = new Float32Array(sparkCount);
  const lifespans = new Float32Array(sparkCount);

  for (let i = 0; i < sparkCount; i++) {
    pos[i * 3] = 0;
    pos[i * 3 + 1] = 0;
    pos[i * 3 + 2] = 0;

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2.0 * Math.random() - 1.0);
    dirs[i * 3] = Math.sin(phi) * Math.cos(theta);
    dirs[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
    dirs[i * 3 + 2] = Math.cos(phi);

    speeds[i] = 0.3 + Math.random() * 0.7;
    ages[i] = Math.random() * 1.5;
    lifespans[i] = 1.0 + Math.random() * 1.8;
  }

  return { pos, dirs, speeds, ages, lifespans, count: sparkCount };
}

export default function GalaxyCore() {
  const coreRef = useRef<THREE.Group>(null);
  const layer1Ref = useRef<THREE.Mesh>(null);
  const layer2Ref = useRef<THREE.Mesh>(null);
  const layer3Ref = useRef<THREE.Mesh>(null);
  
  // Accretion disk refs
  const particlesRef = useRef<THREE.Points>(null);
  
  // Rotating energy ring refs
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  
  // Point lights & sparks refs
  const lightRef = useRef<THREE.PointLight>(null);
  const sparksRef = useRef<THREE.Points>(null);

  // 1. Create a procedural soft-glowing circular particle texture
  const particleGlowTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.2, "rgba(34, 211, 238, 0.8)"); // Cyan center
      grad.addColorStop(0.55, "rgba(124, 58, 237, 0.3)"); // Purple halo
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  const particleCount = 6000;
  const [accretionDisk] = useState(() => createAccretionDisk());
  const { positions, colors, speeds, distances } = accretionDisk;
  const anglesRef = useRef<Float32Array>(accretionDisk.angles);

  const sparkCount = 100;
  const [sparks] = useState(() => createSparks(sparkCount));
  const sparkAgesRef = useRef<Float32Array>(sparks.ages);
  const sparkDirsRef = useRef<Float32Array>(sparks.dirs);

  const prefersReducedMotion = useGalaxyStore((state) => state.prefersReducedMotion);
  const selectedProjectId = useGalaxyStore((state) => state.selectedProjectId);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);

    const finalElapsed = prefersReducedMotion ? 0.0 : elapsed;
    const finalDt = prefersReducedMotion ? 0 : dt;

    // Subtle breathing animation on the central core group (organic multi-frequency)
    const breathingFactor = prefersReducedMotion 
      ? 1.0 
      : 1.0 + Math.sin(finalElapsed * 0.75) * 0.012 + Math.cos(finalElapsed * 0.45) * 0.004;
    if (coreRef.current) {
      coreRef.current.scale.set(breathingFactor, breathingFactor, breathingFactor);
    }

    // Soft organic bloom pulse every 7 seconds (exponential decay)
    const pulseCycle = 7.0;
    const timeInCycle = finalElapsed % pulseCycle;
    const bloomPulse = prefersReducedMotion ? 0.0 : Math.max(0.0, Math.exp(-timeInCycle * 2.2) * 0.24);

    // Swirl layers and pulsate sizes/opacities organically
    if (layer1Ref.current) {
      const pulse1 = prefersReducedMotion ? 1.0 : (1.0 + Math.sin(finalElapsed * 1.5) * 0.02) * (1.0 + bloomPulse);
      layer1Ref.current.scale.set(pulse1, pulse1, pulse1);
    }
    if (layer2Ref.current) {
      layer2Ref.current.rotation.y = finalElapsed * 0.05;
      const pulse2 = prefersReducedMotion ? 1.0 : (1.0 + Math.cos(finalElapsed * 1.1) * 0.03) * (1.0 + bloomPulse * 0.8);
      layer2Ref.current.scale.set(pulse2, pulse2, pulse2);
      const mat = layer2Ref.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = 0.35 + bloomPulse * 0.15;
    }
    if (layer3Ref.current) {
      layer3Ref.current.rotation.z = -finalElapsed * 0.03;
      const pulse3 = prefersReducedMotion ? 1.0 : (1.0 + Math.sin(finalElapsed * 0.7) * 0.02) * (1.0 + bloomPulse * 0.6);
      layer3Ref.current.scale.set(pulse3, pulse3, pulse3);
      const mat = layer3Ref.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = 0.18 + bloomPulse * 0.1;
    }

    // Swirl Energy Rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = finalElapsed * 0.12;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -finalElapsed * 0.09;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = finalElapsed * 0.06;
    }

    // Core point light pulsates and spikes during bloom pulse
    if (lightRef.current) {
      const baseIntensity = 5 + Math.sin(finalElapsed * 1.5) * 1;
      lightRef.current.intensity = prefersReducedMotion ? 5 : baseIntensity + bloomPulse * 15;
    }

    // Accretion Disk Physics (Spiral inward swirl, smoothed out speed)
    if (selectedProjectId === null && particlesRef.current && accretionDisk && anglesRef.current) {
      const geo = particlesRef.current.geometry;
      const posAttr = geo.attributes.position;
      const angles = anglesRef.current;

      for (let i = 0; i < particleCount; i++) {
        // Smooth deceleration towards the center gravity
        const speed = prefersReducedMotion ? 0 : speeds[i] * 0.016 * (1.2 / (distances[i] + 0.25));
        angles[i] += speed;

        const dist = distances[i];
        const ang = angles[i];

        posAttr.setX(i, Math.cos(ang) * dist);
        posAttr.setY(i, posAttr.getY(i) + (prefersReducedMotion ? 0 : Math.sin(finalElapsed * 1.5 + dist * 2.0) * 0.0004));
        posAttr.setZ(i, Math.sin(ang) * dist);
      }
      posAttr.needsUpdate = true;
    }
    
    if (particlesRef.current) {
      particlesRef.current.rotation.y = finalElapsed * 0.005;
    }

    // Spark Particles Outward Ejections
    if (selectedProjectId === null && sparksRef.current) {
      const geo = sparksRef.current.geometry;
      const posAttr = geo.attributes.position;
      const ages = sparkAgesRef.current;

      for (let i = 0; i < sparks.count; i++) {
        ages[i] += finalDt;

        if (ages[i] >= sparks.lifespans[i]) {
          // Reset to origin
          ages[i] = 0;
          posAttr.setXYZ(i, 0, 0, 0);

          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2.0 * Math.random() - 1.0);
          sparkDirsRef.current[i * 3] = Math.sin(phi) * Math.cos(theta);
          sparkDirsRef.current[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
          sparkDirsRef.current[i * 3 + 2] = Math.cos(phi);
        } else {
          // Fly outward
          const speed = sparks.speeds[i] * finalDt;
          const px = posAttr.getX(i) + sparkDirsRef.current[i * 3] * speed;
          const py = posAttr.getY(i) + sparkDirsRef.current[i * 3 + 1] * speed;
          const pz = posAttr.getZ(i) + sparkDirsRef.current[i * 3 + 2] * speed;

          posAttr.setXYZ(i, px, py, pz);
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={coreRef}>
      {/* Intense Point Light Core */}
      <pointLight
        ref={lightRef}
        position={[0, 0, 0]}
        color="#a855f7" // Purple glow core
        distance={20}
        decay={1.5}
      />
      <pointLight
        position={[0, 0, 0]}
        color="#06b6d4" // Cyan halo core
        intensity={6}
        distance={12}
        decay={1.2}
      />

      {/* Layer 1: Bright White Energy Center Core */}
      <mesh ref={layer1Ref}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={1.0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Layer 2: Glowing Cyan Plasma Shell */}
      <mesh ref={layer2Ref} scale={[1.45, 1.45, 1.45]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Layer 3: Purple Accretion Disk Corona */}
      <mesh ref={layer3Ref} scale={[2.3, 0.65, 2.3]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshBasicMaterial
          color="#7c3aed"
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Rotating Technical Energy Ring 1 (Cyan Hex) */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, Math.PI / 6]}>
        <ringGeometry args={[0.92, 0.94, 6]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Rotating Technical Energy Ring 2 (Purple Hex) */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 5, 0]}>
        <ringGeometry args={[1.22, 1.25, 6]} />
        <meshBasicMaterial
          color="#7c3aed"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Rotating Technical Energy Ring 3 (Outer Cyan Circle) */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 2.2, Math.PI / 12, 0]}>
        <ringGeometry args={[1.5, 1.52, 64]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 6,000 Particle Accretion Disk Point Clouds */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.09}
          vertexColors
          transparent
          opacity={0.3}
          map={particleGlowTexture || undefined}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>

      {/* Radial Ejecting Sparks */}
      <points ref={sparksRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[sparks.pos, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#38bdf8"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
