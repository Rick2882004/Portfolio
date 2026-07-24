"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { projectsData } from "@/data/projects";
import Planet from "./Planet";
import { useGalaxyStore } from "@/store/useGalaxyStore";
import * as THREE from "three";

export default function OrbitSystem() {
  const selectedProjectId = useGalaxyStore((state) => state.selectedProjectId);
  const prefersReducedMotion = useGalaxyStore((state) => state.prefersReducedMotion);
  const groupRef = useRef<THREE.Group>(null);
  const currentOpacityRef = useRef<number>(0.08);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    // Soft breathing opacity oscillation (between 0.04 and 0.08) in idle mode
    const breathingOpacity = prefersReducedMotion ? 0.08 : 0.06 + Math.sin(elapsed * 1.2) * 0.02;
    const targetOpacity = selectedProjectId !== null ? 0.0 : breathingOpacity;
    const dt = Math.min(delta, 0.05);

    // Fade out quickly to avoid clipping, fade back in slowly and softly
    const fadeSpeed = selectedProjectId !== null ? 8 : 2.0;
    currentOpacityRef.current = THREE.MathUtils.lerp(
      currentOpacityRef.current,
      targetOpacity,
      prefersReducedMotion ? 1.0 : 1 - Math.exp(-fadeSpeed * dt)
    );

    if (groupRef.current) {
      groupRef.current.children.forEach((inclinationGroup) => {
        // The first child is the orbit path mesh
        const ringMesh = inclinationGroup.children[0] as THREE.Mesh;
        if (ringMesh && ringMesh.material) {
          const mat = ringMesh.material as THREE.MeshBasicMaterial;
          mat.opacity = currentOpacityRef.current;
          mat.visible = currentOpacityRef.current > 0.001; // prevent drawing when fully transparent
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {projectsData.map((project, idx) => {
        const { theme } = project;
        const radius = theme.orbitRadius;

        // Custom inclination angles per planet orbit
        const tiltX = 0.12 + idx * 0.04; 
        const tiltZ = -0.06 + idx * 0.035;

        return (
          <group key={project.id} rotation={[tiltX, 0, tiltZ]}>
            {/* Elegant, thin glowing orbit path ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[radius - 0.004, radius + 0.004, 128]} />
              <meshBasicMaterial
                color={theme.accentColor}
                transparent
                opacity={0.08}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            {/* Orbiting Planet (rendered locally inside the tilted group) */}
            <Planet project={project} />
          </group>
        );
      })}
    </group>
  );
}
