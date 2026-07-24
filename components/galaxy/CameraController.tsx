"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGalaxyStore } from "@/store/useGalaxyStore";
import * as THREE from "three";

export default function CameraController() {
  const selectedProjectId = useGalaxyStore((state) => state.selectedProjectId);
  const transitionState = useGalaxyStore((state) => state.transitionState);
  const setTransitionState = useGalaxyStore((state) => state.setTransitionState);
  const prefersReducedMotion = useGalaxyStore((state) => state.prefersReducedMotion);
  const isMobile = useGalaxyStore((state) => state.isMobile);

  // Focus target vectors
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 6, 16));
  const lookAtTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Maintain local angles for idle orbit
  const orbitAngle = useRef<number>(0);

  // Sync transition state on selected project changes
  useEffect(() => {
    if (selectedProjectId === null) {
      if (transitionState === "FOCUSED") {
        setTransitionState("ZOOMING_OUT");
      }
    }
  }, [selectedProjectId, transitionState, setTransitionState]);

  useFrame((state, delta) => {
    const { camera } = state;
    const elapsed = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05); // cap delta to protect physics
    const persCamera = camera as THREE.PerspectiveCamera;

    // Dynamic field of view (Cinematic telephoto compression when focused)
    const targetFov = selectedProjectId ? 36 : 55;

    if (selectedProjectId) {
      // --- FOCUS MODE (Fly In & Track Planet Orbit) ---
      const planetObj = state.scene.getObjectByName(`planet-group-${selectedProjectId}`);
      
      if (planetObj) {
        const worldPos = new THREE.Vector3();
        planetObj.getWorldPosition(worldPos);

        // Vector pointing from planet to core (0,0,0)
        const dirToCore = new THREE.Vector3(0, 0, 0).sub(worldPos).normalize();
        
        // Safe cinematic distance from planet to prevent intersection and clutters (occupying ~30% viewport)
        const distance = 8.8;
        
        // Define offset vector: push camera away from the core and elevate slightly (top-down slant)
        const cameraOffset = dirToCore.clone().multiplyScalar(-distance);
        cameraOffset.y += 1.3; // elevated angle
        
        targetPos.current.copy(worldPos).add(cameraOffset);

        // Compute camera coordinate vectors for framing composition (left-side planet framing)
        const dirToPlanet = new THREE.Vector3().subVectors(worldPos, targetPos.current).normalize();
        const rightVec = new THREE.Vector3().crossVectors(dirToPlanet, new THREE.Vector3(0, 1, 0)).normalize();
        
        // Shift camera look-at target to the right on desktop, keeping the planet on the left
        const offsetRight = isMobile ? 0.0 : 2.0;
        lookAtTarget.current.copy(worldPos).addScaledVector(rightVec, offsetRight);
        if (isMobile) {
          // Frame planet in top half of the screen on mobile (clear of the bottom sheet)
          lookAtTarget.current.y -= 1.4;
        }

        // Verify focus arrival (non-reduced motion)
        const distToTarget = camera.position.distanceTo(targetPos.current);
        if (!prefersReducedMotion && transitionState === "ZOOMING_IN" && distToTarget < 0.15) {
          setTransitionState("FOCUSED");
        }
      }
    } else {
      orbitAngle.current = prefersReducedMotion ? 0 : elapsed * 0.004; // half-speed slower orbit
      
      const baseRadius = 16.5;
      const cameraY = 6.0; // stable camera horizon
      const cameraRadius = baseRadius; // stable camera radius
      
      const mouseXOffset = prefersReducedMotion ? 0 : state.pointer.x * 0.07; // further reduced parallax
      const mouseYOffset = prefersReducedMotion ? 0 : state.pointer.y * 0.05;
 
      targetPos.current.set(
        Math.cos(orbitAngle.current) * cameraRadius + mouseXOffset,
        cameraY + mouseYOffset,
        Math.sin(orbitAngle.current) * cameraRadius
      );
      
      lookAtTarget.current.set(0, -0.4, 0);

      // Verify zoom out completion (non-reduced motion)
      if (!prefersReducedMotion && transitionState === "ZOOMING_OUT") {
        const distToTarget = camera.position.distanceTo(targetPos.current);
        if (distToTarget < 0.15) {
          setTransitionState("IDLE");
        }
      }
    }

    // --- ACCESSIBILITY TRIGGER: PREFERS-REDUCED-MOTION ---
    if (prefersReducedMotion) {
      camera.position.copy(targetPos.current);
      currentLookAt.current.copy(lookAtTarget.current);
      camera.lookAt(currentLookAt.current);
      camera.up.set(0, 1, 0);
      
      if (persCamera.fov !== targetFov) {
        persCamera.fov = targetFov;
        persCamera.updateProjectionMatrix();
      }
      
      if (selectedProjectId && transitionState === "ZOOMING_IN") {
        setTransitionState("FOCUSED");
      } else if (!selectedProjectId && transitionState === "ZOOMING_OUT") {
        setTransitionState("IDLE");
      }
      return;
    }

    // --- AAA Cinematic Camera Motion (Frame-Rate Independent Easing) ---
    // Smooth cinematic decay values: slower on transition to create steady sweep (exp decay)
    const baseSpeed = selectedProjectId ? 0.8 : 0.5;
    const lerpFactor = 1 - Math.exp(-baseSpeed * dt);

    camera.position.lerp(targetPos.current, lerpFactor);
    currentLookAt.current.lerp(lookAtTarget.current, lerpFactor);
    camera.lookAt(currentLookAt.current);

    // Apply FOV telephoto compression zoom
    if (Math.abs(persCamera.fov - targetFov) > 0.05) {
      persCamera.fov = THREE.MathUtils.lerp(persCamera.fov, targetFov, lerpFactor * 1.2);
      persCamera.updateProjectionMatrix();
    }

    // --- Cinematic Camera Roll (Handheld Tilt) ---
    // Stable camera horizon, zero roll jitter
    camera.up.set(0.0, 1.0, 0.0);
  });

  return null;
}
