"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useGalaxyStore } from "@/store/useGalaxyStore";
import { Project } from "@/types/project";
import * as THREE from "three";

interface PlanetProps {
  project: Project;
}

function createHoverParticles() {
  const count = 25;
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const lifespans = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2.0 * Math.random() - 1.0);
    const speed = 0.8 + Math.random() * 1.4;

    vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
    vel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
    vel[i * 3 + 2] = Math.cos(phi) * speed;

    lifespans[i] = 0.4 + Math.random() * 0.3;
  }
  return { pos, vel, lifespans, count };
}

function createNeuralNodes(id: string) {
  if (id !== "jarvis") return null;
  const count = 50;
  const pos = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const radii = new Float32Array(count);
  const thetaOffset = new Float32Array(count);
  const phiOffset = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    speeds[i] = 0.4 + Math.random() * 0.8;
    radii[i] = 0.75 + Math.random() * 0.35;
    thetaOffset[i] = Math.random() * Math.PI * 2;
    phiOffset[i] = Math.random() * Math.PI;
  }
  return { pos, speeds, radii, thetaOffset, phiOffset, count };
}



function createDataStreams(id: string) {
  if (id !== "ai-platform") return null;
  const count = 250;
  const pos = new Float32Array(count * 3);
  const angles = new Float32Array(count);
  const radii = new Float32Array(count);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = 0.65 + Math.random() * 0.35;

    pos[i * 3] = Math.cos(theta) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
    pos[i * 3 + 2] = Math.sin(theta) * r;

    angles[i] = theta;
    radii[i] = r;
    speeds[i] = 0.4 + Math.random() * 1.2;
  }
  return { pos, angles, radii, speeds, count };
}

export default function Planet({ project }: PlanetProps) {
  const { id, title, tagline, theme } = project;
  const planetRef = useRef<THREE.Group>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const moonGroupRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  
  // Ref handles for visual accessories
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const nodesRef = useRef<THREE.Points>(null);
  const dot1Ref = useRef<THREE.Mesh>(null);
  const dot2Ref = useRef<THREE.Mesh>(null);
  const cube1Ref = useRef<THREE.Mesh>(null);
  const cube2Ref = useRef<THREE.Mesh>(null);
  const cube3Ref = useRef<THREE.Mesh>(null);

  // Click energy wave refs
  const waveMeshRef = useRef<THREE.Mesh>(null);
  const waveMesh2Ref = useRef<THREE.Mesh>(null);
  const waveScaleRef = useRef<number>(1.0);
  const waveScale2Ref = useRef<number>(1.0);
  const waveOpacityRef = useRef<number>(0.0);
  const waveOpacity2Ref = useRef<number>(0.0);

  // Hover particle burst refs
  const hoverPointsRef = useRef<THREE.Points>(null);
  const hoverBurstAgeRef = useRef<number>(999.0);
  const wasHovered = useRef<boolean>(false);

  // Click displacement effect ref (for nearby accessory particles)
  const clickDisplacementRef = useRef<number>(0.0);

  // Floating & Speed interpolation refs
  const floatTimeRef = useRef<number>(0);
  const speedRef = useRef<number>(theme.orbitSpeed);

  // Set random start offset for floating desynchronization (pure in useEffect)
  useEffect(() => {
    floatTimeRef.current = Math.random() * 100;
  }, []);

  const selectProject = useGalaxyStore((state) => state.selectProject);
  const hoverProject = useGalaxyStore((state) => state.hoverProject);
  const prefersReducedMotion = useGalaxyStore((state) => state.prefersReducedMotion);

  const isHovered = useGalaxyStore((state) => state.hoveredProjectId === id);
  const isSelected = useGalaxyStore((state) => state.selectedProjectId === id);
  const isAnyProjectSelected = useGalaxyStore((state) => state.selectedProjectId !== null);

  // Orbit angle state
  const angleRef = useRef<number>(theme.orbitAngleOffset);

  // Spring physics states for scale
  const scaleVel = useRef<number>(0);
  const glowVel = useRef<number>(0);

  // Set pointer cursor on hover
  useEffect(() => {
    if (isHovered) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }
    return () => {
      document.body.style.cursor = "default";
    };
  }, [isHovered]);

  // Trigger circular wave on click selection
  useEffect(() => {
    if (isSelected) {
      waveScaleRef.current = 1.0;
      waveOpacityRef.current = 0.95;

      waveScale2Ref.current = 1.0;
      waveOpacity2Ref.current = 0.75;

      // Displacement pulse for nearby particles
      clickDisplacementRef.current = 0.5;
    }
  }, [isSelected]);

  // 1. Hover particle cloud state (initialized once on mount)
  const [hoverParticles] = useState(() => createHoverParticles());

  // 2. Jarvis (Cyan) nodes state (initialized once on mount)
  const [neuralNodes] = useState(() => createNeuralNodes(id));



  // 4. AI Platform (Blue) falling matrix data rain state
  const [dataStreams] = useState(() => createDataStreams(id));

  // Trigger hover particle burst
  useEffect(() => {
    if (isHovered && !wasHovered.current && !isAnyProjectSelected && hoverParticles) {
      hoverBurstAgeRef.current = 0.0;
      if (hoverPointsRef.current) {
        const geo = hoverPointsRef.current.geometry;
        const posAttr = geo.attributes.position;
        for (let i = 0; i < hoverParticles.count; i++) {
          posAttr.setXYZ(i, 0, 0, 0);
        }
        posAttr.needsUpdate = true;
      }
    }
    wasHovered.current = isHovered;
  }, [isHovered, isAnyProjectSelected, hoverParticles]);

  // Dynamic dimming factor to make other planets quieter on active selection
  const dimFactor = isAnyProjectSelected && !isSelected ? 0.4 : 1.0;

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();

    // Limit delta to prevent crazy physics spring spikes on tab refocus
    const dt = Math.min(delta, 0.05);
    const finalDt = prefersReducedMotion ? 0 : dt;

    // 1. Smooth Orbit Speed Easing
    let targetSpeed = prefersReducedMotion ? 0 : theme.orbitSpeed;
    if (!prefersReducedMotion) {
      if (isSelected) {
        targetSpeed = 0.002; // focus inspection speed
      } else if (isAnyProjectSelected) {
        targetSpeed = theme.orbitSpeed * 0.05; // other planets slow down
      } else if (isHovered) {
        targetSpeed = theme.orbitSpeed * 0.12; // slow orbit on hover
      }
    }
    
    // Smooth frame-rate independent deceleration/acceleration (slower when landing on target)
    const speedEase = isSelected || isHovered ? 2.2 : 3.8;
    speedRef.current = THREE.MathUtils.lerp(
      speedRef.current,
      targetSpeed,
      prefersReducedMotion ? 1.0 : 1 - Math.exp(-speedEase * dt)
    );

    angleRef.current += finalDt * speedRef.current;

    // 2. Planet Scale & Selection Spring Physics
    const scaleMultiplier = 1.65;
    const baseScale = theme.planetScale * scaleMultiplier;
    let targetScale = baseScale;
    if (isSelected) {
      targetScale = baseScale * 1.38; // reduced focused scale by 14%
    } else if (isAnyProjectSelected) {
      targetScale = baseScale * 0.82; // unselected planets scale down slightly less (82% of base)
    } else if (isHovered) {
      targetScale = baseScale * 1.2; // reduced hover scale
    }

    const targetGlowSize = isHovered ? 1.32 : isSelected ? 1.45 : 1.25;
    const pulseSpeed = isHovered ? 2.2 : isSelected ? 1.8 : 1.0; // slowed pulse
    const targetPulse = prefersReducedMotion ? targetGlowSize : targetGlowSize + Math.sin(elapsed * pulseSpeed) * 0.01; // reduced pulse intensity

    if (planetRef.current) {
      const radius = theme.orbitRadius;
      planetRef.current.position.x = Math.cos(angleRef.current) * radius;
      planetRef.current.position.z = Math.sin(angleRef.current) * radius;
      
      // Floating vertical motion (breathing elevation)
      floatTimeRef.current += dt * (isHovered ? 1.1 : 0.5); // slowed float frequency
      const floatOffset = prefersReducedMotion ? 0 : Math.sin(floatTimeRef.current) * (isHovered ? 0.03 : 0.012); // dampened float offset
      planetRef.current.position.y = floatOffset;

      // Handle scale interpolation
      if (prefersReducedMotion) {
        planetRef.current.scale.set(targetScale, targetScale, targetScale);
      } else {
        const springStiffness = 150;
        const springDamping = 12;

        const scaleForce = (targetScale - planetRef.current.scale.x) * springStiffness;
        scaleVel.current += scaleForce * dt;
        scaleVel.current *= (1 - springDamping * dt);
        const nextScale = Math.max(0.05, planetRef.current.scale.x + scaleVel.current * dt);
        planetRef.current.scale.set(nextScale, nextScale, nextScale);
      }
    }

    // 3. Click circular energy wave animation (dual shockwave rings)
    if (waveOpacityRef.current > 0.001) {
      waveScaleRef.current += dt * 4.2; // expands outward rapidly
      waveOpacityRef.current = THREE.MathUtils.lerp(
        waveOpacityRef.current,
        0.0,
        prefersReducedMotion ? 1.0 : 1 - Math.exp(-4.2 * dt) // decays exponentially
      );
    } else {
      waveOpacityRef.current = 0.0;
    }

    if (waveOpacity2Ref.current > 0.001) {
      waveScale2Ref.current += dt * 3.0; // slower expansion
      waveOpacity2Ref.current = THREE.MathUtils.lerp(
        waveOpacity2Ref.current,
        0.0,
        prefersReducedMotion ? 1.0 : 1 - Math.exp(-3.0 * dt)
      );
    } else {
      waveOpacity2Ref.current = 0.0;
    }
    
    if (waveMeshRef.current) {
      waveMeshRef.current.scale.set(waveScaleRef.current, waveScaleRef.current, waveScaleRef.current);
      const mat = waveMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = waveOpacityRef.current;
        mat.visible = waveOpacityRef.current > 0.001;
      }
    }

    if (waveMesh2Ref.current) {
      waveMesh2Ref.current.scale.set(waveScale2Ref.current, waveScale2Ref.current, waveScale2Ref.current);
      const mat = waveMesh2Ref.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = waveOpacity2Ref.current;
        mat.visible = waveOpacity2Ref.current > 0.001;
      }
    }

    // Decelerate click displacement factor
    if (clickDisplacementRef.current > 0.001) {
      clickDisplacementRef.current = THREE.MathUtils.lerp(
        clickDisplacementRef.current,
        0.0,
        prefersReducedMotion ? 1.0 : 1 - Math.exp(-3.5 * dt)
      );
    } else {
      clickDisplacementRef.current = 0.0;
    }

    // Hover burst particles physics update
    if (hoverParticles && hoverBurstAgeRef.current < 0.7) {
      hoverBurstAgeRef.current += dt;
      if (hoverPointsRef.current) {
        const geo = hoverPointsRef.current.geometry;
        const posAttr = geo.attributes.position;
        for (let i = 0; i < hoverParticles.count; i++) {
          if (hoverBurstAgeRef.current < hoverParticles.lifespans[i]) {
            const px = posAttr.getX(i) + hoverParticles.vel[i * 3] * dt;
            const py = posAttr.getY(i) + hoverParticles.vel[i * 3 + 1] * dt;
            const pz = posAttr.getZ(i) + hoverParticles.vel[i * 3 + 2] * dt;
            posAttr.setXYZ(i, px, py, pz);
          }
        }
        posAttr.needsUpdate = true;

        const mat = hoverPointsRef.current.material as THREE.PointsMaterial;
        if (mat) {
          mat.opacity = Math.max(0, 1.0 - hoverBurstAgeRef.current / 0.65);
        }
      }
    }

    // 4. Planet self-rotation (dampened)
    if (coreMeshRef.current) {
      coreMeshRef.current.rotation.y += finalDt * (isHovered ? 0.08 : 0.04);
    }

    // 5. Moon orbit tracking (dampened)
    if (moonGroupRef.current) {
      moonGroupRef.current.rotation.y += finalDt * (isHovered ? 0.3 : 0.15);
    }

    // 6. Atmosphere glow spring expansion
    if (atmosphereRef.current) {
      if (prefersReducedMotion) {
        atmosphereRef.current.scale.set(targetGlowSize, targetGlowSize, targetGlowSize);
      } else {
        const glowStiffness = 120;
        const glowDamping = 10;

        const glowForce = (targetPulse - atmosphereRef.current.scale.x) * glowStiffness;
        glowVel.current += glowForce * dt;
        glowVel.current *= (1 - glowDamping * dt);
        const nextGlow = Math.max(0.1, atmosphereRef.current.scale.x + glowVel.current * dt);
        atmosphereRef.current.scale.set(nextGlow, nextGlow, nextGlow);
      }
    }

    // 7. Accessories Real-Time Animations
    // Performance optimization: skip heavy accessory updates for other quiet planets
    if (isAnyProjectSelected && !isSelected) {
      return;
    }

    // MusicFlow Concentric Equalizer Waves
    if (id === "musicflow" && ring1Ref.current && ring2Ref.current && ring3Ref.current) {
      const t = elapsed * 10;
      const pulse1 = prefersReducedMotion ? 1.0 : 1.0 + Math.sin(t) * 0.08 + Math.cos(t * 0.7) * 0.03 + clickDisplacementRef.current * 0.4;
      const pulse2 = prefersReducedMotion ? 1.2 : 1.2 + Math.cos(t * 0.8) * 0.10 + Math.sin(t * 0.4) * 0.04 + clickDisplacementRef.current * 0.6;
      const pulse3 = prefersReducedMotion ? 1.4 : 1.4 + Math.sin(t * 1.4) * 0.12 + Math.cos(t * 0.9) * 0.05 + clickDisplacementRef.current * 0.8;

      ring1Ref.current.scale.set(pulse1, pulse1, 1);
      ring2Ref.current.scale.set(pulse2, pulse2, 1);
      ring3Ref.current.scale.set(pulse3, pulse3, 1);

      ring1Ref.current.rotation.z += finalDt * 0.16;
      ring2Ref.current.rotation.z -= finalDt * 0.12;
      ring3Ref.current.rotation.z += finalDt * 0.07;
    }
 
    // RideX GPS Moving dots and navigation ring displace
    if (id === "ridex" && ring1Ref.current && ring2Ref.current && dot1Ref.current && dot2Ref.current) {
      ring1Ref.current.rotation.y += finalDt * 0.16;
      ring2Ref.current.rotation.x -= finalDt * 0.12;

      const scale = 1.0 + clickDisplacementRef.current * 0.45;
      ring1Ref.current.scale.set(scale, scale, scale);
      ring2Ref.current.scale.set(scale, scale, scale);

      const speed1 = prefersReducedMotion ? 0 : elapsed * 1.2;
      const speed2 = prefersReducedMotion ? 2.5 : elapsed * 1.6;

      const r1 = 0.81 + clickDisplacementRef.current * 0.3;
      const p1 = new THREE.Vector3(Math.cos(speed1) * r1, 0, Math.sin(speed1) * r1)
        .applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 4);
      dot1Ref.current.position.copy(p1);

      const r2 = 0.89 + clickDisplacementRef.current * 0.3;
      const p2 = new THREE.Vector3(Math.cos(speed2) * r2, Math.sin(speed2) * r2, 0)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4)
        .applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
      dot2Ref.current.position.copy(p2);
    }

    // Jarvis AI halos, cubes, and neural network
    if (id === "jarvis") {
      if (ring1Ref.current) {
        ring1Ref.current.rotation.z -= finalDt * 0.12;
        const scale = 1.0 + clickDisplacementRef.current * 0.45;
        ring1Ref.current.scale.set(scale, scale, scale);
      }
      if (ring2Ref.current) {
        ring2Ref.current.rotation.z += finalDt * 0.08;
        const scale = 1.0 + clickDisplacementRef.current * 0.45;
        ring2Ref.current.scale.set(scale, scale, scale);
      }

      if (cube1Ref.current && cube2Ref.current && cube3Ref.current) {
        const c1Time = prefersReducedMotion ? 0 : elapsed * 0.5; // slow moving
        const r1 = 0.88 + clickDisplacementRef.current * 0.4;
        cube1Ref.current.position.set(Math.cos(c1Time) * r1, Math.sin(c1Time) * 0.15, Math.sin(c1Time) * r1);
        cube1Ref.current.rotation.x += finalDt * 0.5;
        cube1Ref.current.rotation.y += finalDt * 0.25;

        const c2Time = prefersReducedMotion ? 2.5 : elapsed * 0.4 + 2.5;
        const r2 = 1.05 + clickDisplacementRef.current * 0.4;
        cube2Ref.current.position.set(Math.cos(c2Time) * r2, Math.cos(c2Time * 0.6) * 0.25, Math.sin(c2Time) * r2);
        cube2Ref.current.rotation.y += finalDt * 0.35;
        cube2Ref.current.rotation.z += finalDt * 0.5;

        const c3Time = prefersReducedMotion ? 4.0 : elapsed * 0.6 + 4.0;
        const r3 = 0.72 + clickDisplacementRef.current * 0.3;
        cube3Ref.current.position.set(Math.cos(c3Time) * r3, Math.sin(c3Time * 1.1) * 0.35, Math.sin(c3Time) * r3);
        cube3Ref.current.rotation.x += finalDt * 0.3;
        cube3Ref.current.rotation.z += finalDt * 0.4;
      }

      if (neuralNodes && nodesRef.current) {
        const geo = nodesRef.current.geometry;
        const posAttr = geo.attributes.position;

        for (let i = 0; i < neuralNodes.count; i++) {
          const speed = prefersReducedMotion ? 0 : neuralNodes.speeds[i] * (isHovered ? 1.5 : 0.6);
          const theta = elapsed * speed + neuralNodes.thetaOffset[i];
          const phi = elapsed * (speed * 0.45) + neuralNodes.phiOffset[i];
          const r = neuralNodes.radii[i] + clickDisplacementRef.current * 0.65;

          posAttr.setX(i, r * Math.sin(phi) * Math.cos(theta));
          posAttr.setY(i, r * Math.sin(phi) * Math.sin(theta));
          posAttr.setZ(i, r * Math.cos(phi));
        }
        posAttr.needsUpdate = true;
      }
    }



    // AI Platform falling matrix data rain
    if (id === "ai-platform" && dataStreams && nodesRef.current) {
      const geo = nodesRef.current.geometry;
      const posAttr = geo.attributes.position;

      for (let i = 0; i < dataStreams.count; i++) {
        const speed = prefersReducedMotion ? 0 : dataStreams.speeds[i] * (isHovered ? 1.5 : 0.8);
        let y = posAttr.getY(i) - finalDt * speed;

        if (y < -1.1) {
          y = 1.1;
        }
        posAttr.setY(i, y);

        // Displace radially on click
        const theta = dataStreams.angles[i];
        const r = dataStreams.radii[i] + clickDisplacementRef.current * 0.65;
        posAttr.setX(i, Math.cos(theta) * r);
        posAttr.setZ(i, Math.sin(theta) * r);
      }
      posAttr.needsUpdate = true;

      if (ring1Ref.current) ring1Ref.current.rotation.z += finalDt * 0.22;
      if (ring2Ref.current) ring2Ref.current.rotation.z -= finalDt * 0.14;
    }
  });

  // Custom renders for premium visual accessories (multiplied by selection dimFactor)
  const renderAccessories = () => {
    switch (id) {
      case "musicflow":
        return (
          <group rotation={[Math.PI / 2.8, 0, 0]}>
            {/* Concentric Equalizer Ring 1 */}
            <mesh ref={ring1Ref}>
              <ringGeometry args={[0.72, 0.75, 64]} />
              <meshBasicMaterial
                color="#c084fc"
                transparent
                opacity={(isHovered ? 0.95 : 0.5) * dimFactor}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                fog={false}
              />
            </mesh>
            {/* Concentric Equalizer Ring 2 */}
            <mesh ref={ring2Ref}>
              <ringGeometry args={[0.72, 0.74, 64]} />
              <meshBasicMaterial
                color="#a855f7"
                transparent
                opacity={(isHovered ? 0.75 : 0.3) * dimFactor}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                fog={false}
              />
            </mesh>
            {/* Concentric Equalizer Ring 3 */}
            <mesh ref={ring3Ref}>
              <ringGeometry args={[0.72, 0.73, 64]} />
              <meshBasicMaterial
                color="#db2777"
                transparent
                opacity={(isHovered ? 0.55 : 0.15) * dimFactor}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                fog={false}
              />
            </mesh>
          </group>
        );

      case "ridex":
        return (
          <group>
            {/* Tilted Navigation Ring 1 */}
            <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
              <ringGeometry args={[0.80, 0.82, 64]} />
              <meshBasicMaterial
                color="#f97316"
                transparent
                opacity={(isHovered ? 0.7 : 0.35) * dimFactor}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                fog={false}
              />
            </mesh>
            {/* Tilted Navigation Ring 2 */}
            <mesh ref={ring2Ref} rotation={[0, Math.PI / 4, Math.PI / 2]}>
              <ringGeometry args={[0.88, 0.90, 64]} />
              <meshBasicMaterial
                color="#fed7aa"
                transparent
                opacity={(isHovered ? 0.55 : 0.25) * dimFactor}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                fog={false}
              />
            </mesh>

            {/* GPS Vehicle Moving Dots */}
            <mesh ref={dot1Ref}>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshBasicMaterial color="#ffedd5" transparent opacity={dimFactor} blending={THREE.AdditiveBlending} toneMapped={false} />
            </mesh>
            <mesh ref={dot2Ref}>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshBasicMaterial color="#f97316" transparent opacity={dimFactor} blending={THREE.AdditiveBlending} toneMapped={false} />
            </mesh>
          </group>
        );

      case "jarvis":
        return (
          <group>
            {/* AI Concentric Dash Ring 1 */}
            <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.78, 0.81, 6]} />
              <meshBasicMaterial
                color="#22d3ee"
                transparent
                opacity={(isHovered ? 0.85 : 0.45) * dimFactor}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                fog={false}
              />
            </mesh>
            {/* AI Concentric Dash Ring 2 */}
            <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, Math.PI / 6]}>
              <ringGeometry args={[0.95, 0.97, 32]} />
              <meshBasicMaterial
                color="#0891b2"
                transparent
                opacity={(isHovered ? 0.6 : 0.25) * dimFactor}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                fog={false}
              />
            </mesh>

            {/* Orbiting micro-cubes representing AI agents */}
            <mesh ref={cube1Ref}>
              <boxGeometry args={[0.07, 0.07, 0.07]} />
              <meshStandardMaterial color="#22d3ee" transparent opacity={dimFactor} emissive="#0891b2" roughness={0.1} metalness={0.9} />
            </mesh>
            <mesh ref={cube2Ref}>
              <boxGeometry args={[0.05, 0.05, 0.05]} />
              <meshStandardMaterial color="#67e8f9" transparent opacity={dimFactor} emissive="#0e7490" roughness={0.1} metalness={0.9} />
            </mesh>
            <mesh ref={cube3Ref}>
              <boxGeometry args={[0.06, 0.06, 0.06]} />
              <meshStandardMaterial color="#06b6d4" transparent opacity={dimFactor} emissive="#06b6d4" roughness={0.1} metalness={0.9} />
            </mesh>

            {/* Neural Spark Points Cloud */}
            {neuralNodes && (
              <points ref={nodesRef}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[neuralNodes.pos, 3]}
                  />
                </bufferGeometry>
                <pointsMaterial
                  size={isHovered ? 0.07 : 0.04}
                  color="#22d3ee"
                  transparent
                  opacity={0.8 * dimFactor}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                  fog={false}
                />
              </points>
            )}
          </group>
        );



      case "ai-platform":
        return (
          <group>
            {/* Hexagonal energy cage 1 */}
            <mesh ref={ring1Ref} rotation={[Math.PI / 2.5, 0, 0]}>
              <ringGeometry args={[0.82, 0.85, 6]} />
              <meshBasicMaterial
                color="#3b82f6"
                transparent
                opacity={(isHovered ? 0.85 : 0.45) * dimFactor}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                fog={false}
              />
            </mesh>

            {/* Hexagonal energy cage 2 */}
            <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]} scale={[1.22, 1.22, 1.22]}>
              <ringGeometry args={[0.82, 0.84, 6]} />
              <meshBasicMaterial
                color="#60a5fa"
                transparent
                opacity={(isHovered ? 0.6 : 0.25) * dimFactor}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                fog={false}
              />
            </mesh>

            {/* Cyber Matrix Data Streams */}
            {dataStreams && (
              <points ref={nodesRef}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[dataStreams.pos, 3]}
                  />
                </bufferGeometry>
                <pointsMaterial
                  size={0.035}
                  color="#60a5fa"
                  transparent
                  opacity={(isHovered ? 0.9 : 0.55) * dimFactor}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                  fog={false}
                />
              </points>
            )}
          </group>
        );

      default:
        return null;
    }
  };

  return (
    <group
      ref={planetRef}
      name={`planet-group-${id}`}
      onClick={(e) => {
        e.stopPropagation();
        selectProject(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        hoverProject(id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        hoverProject(null);
      }}
    >
      {/* 1. Core Planet Body */}
      <mesh ref={coreMeshRef} castShadow receiveShadow>
        {id === "ai-platform" ? (
          <icosahedronGeometry args={[0.5, 1]} /> // Geodesic faceted blue planet
        ) : (
          <sphereGeometry args={[0.5, 32, 32]} />
        )}
        <meshPhysicalMaterial
          color={
            id === "musicflow"
              ? "#581c87" // Purple
              : id === "ridex"
              ? "#d97706" // Orange/Amber
              : id === "jarvis"
              ? "#0891b2" // Cyan
              : "#1d4ed8" // Blue
          }
          emissive={
            id === "musicflow"
              ? "#3b0764"
              : id === "ridex"
              ? "#7c2d12"
              : id === "jarvis"
              ? "#083344"
              : "#1e3a8a"
          }
          emissiveIntensity={
            isAnyProjectSelected && !isSelected 
              ? 0.04 // unselected muted
              : isHovered 
              ? 0.75 
              : 0.25
          }
          roughness={id === "ridex" ? 0.3 : id === "ai-platform" ? 0.05 : 0.15}
          metalness={id === "ridex" ? 0.95 : id === "ai-platform" ? 0.9 : 0.1}
          clearcoat={0.9}
          clearcoatRoughness={0.08}
          flatShading={id === "ai-platform"}
        />
      </mesh>

      {/* 2. Atmospheric Aura glow shell */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color={theme.accentColor}
          transparent
          opacity={
            isAnyProjectSelected && !isSelected
              ? 0.03 // unselected muted glow
              : isHovered 
              ? 0.28 
              : isSelected 
              ? 0.35 
              : 0.12
          }
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Expanding circular energy wave on selection (dual shockwaves) */}
      <mesh ref={waveMeshRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.53, 64]} />
        <meshBasicMaterial
          color={theme.accentColor}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      <mesh ref={waveMesh2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.52, 64]} />
        <meshBasicMaterial
          color={theme.accentColor}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
          fog={false}
        />
      </mesh>

      {/* Hover particle burst cloud */}
      {hoverParticles && (
        <points ref={hoverPointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[hoverParticles.pos, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.038}
            color={theme.accentColor}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            sizeAttenuation={true}
          />
        </points>
      )}

      {/* 4. Unique Planet Accessories */}
      {renderAccessories()}

      {/* 5. Orbiting Moon */}
      <group ref={moonGroupRef}>
        <mesh position={[1.18, 0.15, 0]} scale={[0.12, 0.12, 0.12]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={theme.accentColor}
            emissive={theme.accentColor}
            emissiveIntensity={0.8 * dimFactor}
            roughness={0.3}
            transparent
            opacity={dimFactor}
          />
        </mesh>
      </group>

      {/* 6. Floating Interactive UI Label on Hover */}
      <Html
        center
        distanceFactor={5.5}
        position={[0, 0.95, 0]}
        style={{
          pointerEvents: "none",
          transition: "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          opacity: isHovered && !isAnyProjectSelected ? 1 : 0,
          transform: isHovered && !isAnyProjectSelected ? "scale(1) translateY(0px)" : "scale(0.85) translateY(10px)",
        }}
      >
        <div className="flex flex-col items-center bg-black/85 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-sm shadow-[0_8px_30px_rgba(0,0,0,0.85),0_0_15px_rgba(34,211,238,0.08)] select-none text-center min-w-[170px]">
          <div className="flex items-center justify-center space-x-1.5 mb-0.5">
            <div 
              style={{
                backgroundColor: theme.accentColor,
                boxShadow: `0 0 6px ${theme.accentColor}`
              }}
              className="w-[5px] h-[5px] rounded-full animate-pulse" 
            />
            <span className="text-white text-[10px] font-black tracking-[0.25em] uppercase font-sans">
              {title}
            </span>
          </div>
          <span className="text-white/50 text-[6px] font-mono tracking-[0.15em] uppercase font-medium">
            {tagline}
          </span>
          <span 
            style={{ color: theme.accentColor }} 
            className="text-[5.5px] font-mono tracking-[0.1em] uppercase font-bold mt-1.5 block animate-pulse"
          >
            [ CLICK TO EXPLORE ]
          </span>
        </div>
      </Html>
    </group>
  );
}
