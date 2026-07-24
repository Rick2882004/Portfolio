"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGalaxyStore } from "@/store/useGalaxyStore";
import * as THREE from "three";

interface DistantGalaxy {
  positions: Float32Array;
  colors: Float32Array;
}

// Custom Twinkling Stars Shaders
const starsVertexShader = `
  uniform float uTime;
  varying vec3 vColor;
  varying float vTwinkle;
  attribute vec2 aTwinkle; // x: speed, y: phase/delay
  void main() {
    vColor = color;
    // Twinkle factor oscillates between 0.25 and 1.0 organically
    vTwinkle = 0.625 + 0.375 * sin(uTime * aTwinkle.x + aTwinkle.y);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // Size attenuation
    gl_PointSize = 45.0 * (1.0 / -mvPosition.z);
  }
`;

const starsFragmentShader = `
  varying vec3 vColor;
  varying float vTwinkle;
  uniform float uOpacity;
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    // Smooth circular glowing soft particle border
    float alpha = smoothstep(0.5, 0.12, dist) * uOpacity * vTwinkle;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// Faint Volumetric 3D Light Rays Shaders
const lightRayVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const lightRayFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    // Fade out at boundaries of the open cylinder
    float fadeY = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.65, vUv.y);
    float fadeX = sin(vUv.x * 3.14159);
    // Slow sweeping glow pulsation
    float pulse = 0.55 + 0.45 * sin(uTime * 0.16 + vUv.y * 3.0);
    gl_FragColor = vec4(uColor, fadeY * fadeX * uOpacity * pulse);
  }
`;

export default function CinematicStarfield() {
  const nebulaeRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Points>(null);
  const starsNearRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);
  const ray1Ref = useRef<THREE.Mesh>(null);
  const ray2Ref = useRef<THREE.Mesh>(null);
  
  // Ref array for shooting stars
  const starStreak1Ref = useRef<THREE.Mesh>(null);
  const starStreak2Ref = useRef<THREE.Mesh>(null);
  const starStreak3Ref = useRef<THREE.Mesh>(null);

  // 1. Procedural Nebula Textures (created dynamically on client)
  const nebulaTextures = useMemo(() => {
    if (typeof window === "undefined") return [];

    const createNebulaCanvas = (coreColor: string, outerColor: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
        grad.addColorStop(0.2, coreColor);
        grad.addColorStop(0.6, outerColor);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
      }
      return new THREE.CanvasTexture(canvas);
    };

    return [
      createNebulaCanvas("rgba(99, 102, 241, 0.35)", "rgba(6, 182, 212, 0.08)"),  // Indigo/Cyan
      createNebulaCanvas("rgba(139, 92, 246, 0.3)", "rgba(236, 72, 153, 0.06)"),  // Purple/Pink
      createNebulaCanvas("rgba(249, 115, 22, 0.25)", "rgba(139, 92, 246, 0.05)"), // Orange/Purple
    ];
  }, []);

  // Volumetric Stacked Nebulae Cloud Configuration
  const nebulae = useMemo(() => {
    return [
      // Stack 1: Left Deep Purple-Blue Nebula
      { pos: new THREE.Vector3(-24, 8, -35), scale: 35, textureIdx: 0, rotSpeed: 0.006 },
      { pos: new THREE.Vector3(-26, 6, -34), scale: 28, textureIdx: 1, rotSpeed: -0.008 },
      // Stack 2: Right Magenta-Indigo Nebula
      { pos: new THREE.Vector3(26, -8, -40), scale: 38, textureIdx: 1, rotSpeed: -0.005 },
      { pos: new THREE.Vector3(24, -10, -38), scale: 30, textureIdx: 0, rotSpeed: 0.007 },
      // Stack 3: Bottom Centered Orange-Purple Cloud
      { pos: new THREE.Vector3(-6, -16, -28), scale: 32, textureIdx: 2, rotSpeed: 0.003 },
      // Stack 4: Top Glowing Cyan-Indigo Cloud
      { pos: new THREE.Vector3(18, 18, -45), scale: 45, textureIdx: 0, rotSpeed: -0.005 },
    ];
  }, []);

// Procedural Starfield Generators (defined outside the component for purity)
function createStarfield(count: number) {
  const pos = new Float32Array(count * 3);
  const cols = new Float32Array(count * 3);
  const twinkle = new Float32Array(count * 2);

  const colors = [
    new THREE.Color("#ffffff"),
    new THREE.Color("#cbd5e1"), // Silver
    new THREE.Color("#a5f3fc"), // Cyan
    new THREE.Color("#fed7aa"), // Amber
    new THREE.Color("#ddd6fe"), // Purple
    new THREE.Color("#f472b6"), // Pink
  ];

  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 135 + Math.random() * 55; // distant shell boundary

    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);

    const color = colors[Math.floor(Math.random() * colors.length)];
    cols[i * 3] = color.r;
    cols[i * 3 + 1] = color.g;
    cols[i * 3 + 2] = color.b;

    twinkle[i * 2] = 0.5 + Math.random() * 2.5; // speed
    twinkle[i * 2 + 1] = Math.random() * 2.0 * Math.PI; // delay
  }

  return { starPositions: pos, starColors: cols, starTwinkle: twinkle };
}

function createNearStarfield(count: number) {
  const pos = new Float32Array(count * 3);
  const cols = new Float32Array(count * 3);
  const twinkle = new Float32Array(count * 2);

  const colors = [
    new THREE.Color("#ffffff"),
    new THREE.Color("#fed7aa"), // Warm amber star
    new THREE.Color("#a5f3fc"), // Cyan star
    new THREE.Color("#fbcfe8"), // Soft pink star
  ];

  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 50 + Math.random() * 60; // closer shell for parallax

    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);

    const color = colors[Math.floor(Math.random() * colors.length)];
    cols[i * 3] = color.r;
    cols[i * 3 + 1] = color.g;
    cols[i * 3 + 2] = color.b;

    twinkle[i * 2] = 0.8 + Math.random() * 2.2; // speed
    twinkle[i * 2 + 1] = Math.random() * 2.0 * Math.PI; // delay
  }

  return { nearStarPositions: pos, nearStarColors: cols, nearStarTwinkle: twinkle };
}

function createSpaceDust(count: number) {
  const pos = new Float32Array(count * 3);
  const spds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 50;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 35;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 30; // close to camera

    spds[i] = 0.03 + Math.random() * 0.1;
  }

  return { dustPositions: pos, dustSpeeds: spds };
}

function createDistantGalaxies() {
  const generateCluster = (center: THREE.Vector3, pCount: number, scale: number, baseColor: string) => {
    const pos = new Float32Array(pCount * 3);
    const cols = new Float32Array(pCount * 3);
    const cObj = new THREE.Color(baseColor);

    for (let i = 0; i < pCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const rad = Math.pow(Math.random(), 1.5) * scale;
      const dispersion = (Math.random() - 0.5) * scale * 0.15;

      const armsCount = 2;
      const armIndex = i % armsCount;
      const spiralAngle = theta + (rad * 1.5) + (armIndex * Math.PI);

      pos[i * 3] = center.x + Math.cos(spiralAngle) * rad;
      pos[i * 3 + 1] = center.y + dispersion;
      pos[i * 3 + 2] = center.z + Math.sin(spiralAngle) * rad;

      const lerpVal = rad / scale;
      const col = cObj.clone().lerp(new THREE.Color("#02040a"), lerpVal);
      cols[i * 3] = col.r;
      cols[i * 3 + 1] = col.g;
      cols[i * 3 + 2] = col.b;
    }
    return { positions: pos, colors: cols };
  };

  return [
    generateCluster(new THREE.Vector3(-60, 22, -75), 1000, 10, "#22d3ee"),  // Cyan spiral galaxy
    generateCluster(new THREE.Vector3(65, -28, -85), 1200, 12, "#ec4899"),  // Pink/Rose spiral
    generateCluster(new THREE.Vector3(12, -45, -95), 700, 7, "#a855f7"),    // Purple cluster
  ];
}

// 2. Background Starfield Layer (9,500 particles in deep shell)
const starCount = 9500;
const nearStarCount = 1500;
const dustCount = 200;

  // Inside Component: Initialize state once on mount using useState initializers
  const [starfield] = useState(() => createStarfield(starCount));
  const [nearStarfield] = useState(() => createNearStarfield(nearStarCount));
  const [spaceDust] = useState(() => createSpaceDust(dustCount));
  const [distantGalaxies] = useState(() => createDistantGalaxies());

  const starPositions = starfield.starPositions;
  const starColors = starfield.starColors;
  const starTwinkle = starfield.starTwinkle;

  const nearStarPositions = nearStarfield.nearStarPositions;
  const nearStarColors = nearStarfield.nearStarColors;
  const nearStarTwinkle = nearStarfield.nearStarTwinkle;

  const dustPositions = spaceDust.dustPositions;
  const dustSpeeds = spaceDust.dustSpeeds;

  // 6. Shooting Star state manager
  const shootingStars = useMemo(() => {
    return [
      {
        pos: new THREE.Vector3(),
        dir: new THREE.Vector3(-1.1, -0.35, 0).normalize(),
        speed: 0.7,
        progress: 0,
        delay: 0,
        active: true,
      },
      {
        pos: new THREE.Vector3(),
        dir: new THREE.Vector3(-1.3, -0.15, -0.25).normalize(),
        speed: 0.85,
        progress: 0,
        delay: 4.0,
        active: false,
      },
      {
        pos: new THREE.Vector3(),
        dir: new THREE.Vector3(1.2, -0.4, 0.15).normalize(),
        speed: 0.75,
        progress: 0,
        delay: 2.0,
        active: false,
      },
    ];
  }, []);

  // Shader Uniform Definitions
  const starsUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 0.75 }
  }), []);

  const nearStarsUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 0.85 }
  }), []);

  const ray1Uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#06b6d4") },
    uOpacity: { value: 0.008 }
  }), []);

  const ray2Uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#7c3aed") },
    uOpacity: { value: 0.006 }
  }), []);

  const prefersReducedMotion = useGalaxyStore((state) => state.prefersReducedMotion);
  const selectedProjectId = useGalaxyStore((state) => state.selectedProjectId);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);

    const finalElapsed = prefersReducedMotion ? 0.0 : elapsed;
    const finalDt = prefersReducedMotion ? 0 : dt;

    // Nebula cloud translation & slow breathing volumetric luminosity (decreased rotSpeed by ~60%)
    if (nebulaeRef.current) {
      nebulaeRef.current.children.forEach((mesh, idx) => {
        const nebulaDef = nebulae[idx];
        if (nebulaDef) {
          const rawMesh = mesh as THREE.Mesh;
          rawMesh.rotation.z = finalElapsed * nebulaDef.rotSpeed * 0.1;
          rawMesh.position.x = nebulaDef.pos.x + (prefersReducedMotion ? 0 : Math.sin(finalElapsed * 0.006 + idx) * 0.3);
          rawMesh.position.y = nebulaDef.pos.y + (prefersReducedMotion ? 0 : Math.cos(finalElapsed * 0.005 + idx) * 0.2);
          
          const mat = rawMesh.material as THREE.MeshBasicMaterial;
          if (mat) {
            mat.opacity = prefersReducedMotion 
              ? 0.02 
              : 0.015 + Math.sin(finalElapsed * 0.03 + idx) * 0.005 + Math.cos(finalElapsed * 0.015 + idx) * 0.002;
          }
        }
      });
    }

    // Deep Starfield custom shader time sync & slow orbit
    if (starsRef.current) {
      starsRef.current.rotation.y = finalElapsed * 0.0003;
      const mat = starsRef.current.material as THREE.ShaderMaterial;
      if (mat && mat.uniforms) {
        mat.uniforms.uTime.value = finalElapsed;
      }
    }

    // Near Starfield custom shader time sync & opposite slow orbit for Parallax depth
    if (starsNearRef.current) {
      starsNearRef.current.rotation.y = -finalElapsed * 0.0005;
      starsNearRef.current.rotation.x = finalElapsed * 0.00015;
      const mat = starsNearRef.current.material as THREE.ShaderMaterial;
      if (mat && mat.uniforms) {
        mat.uniforms.uTime.value = finalElapsed;
      }
    }

    // Faint Volumetric Light Ray Uniforms
    if (ray1Ref.current) {
      const mat = ray1Ref.current.material as THREE.ShaderMaterial;
      if (mat && mat.uniforms) {
        mat.uniforms.uTime.value = finalElapsed;
      }
      ray1Ref.current.rotation.y = finalElapsed * 0.001;
    }
    if (ray2Ref.current) {
      const mat = ray2Ref.current.material as THREE.ShaderMaterial;
      if (mat && mat.uniforms) {
        mat.uniforms.uTime.value = finalElapsed;
      }
      ray2Ref.current.rotation.y = -finalElapsed * 0.0007;
    }

    // Skip heavy background animation math when a project is focused
    if (selectedProjectId === null) {
      // Horizontal slow space dust drift (subtle and uniform)
      if (dustRef.current && spaceDust) {
        const geo = dustRef.current.geometry;
        const posAttr = geo.attributes.position;

        for (let i = 0; i < dustCount; i++) {
          let x = posAttr.getX(i) - (prefersReducedMotion ? 0 : dustSpeeds[i] * 0.02);
          let y = posAttr.getY(i) + (prefersReducedMotion ? 0 : Math.sin(finalElapsed * 0.06 + i) * 0.0008);

          // Reset when moving off screen bounds
          if (x < -28) {
            x = 28;
            y = (Math.random() - 0.5) * 35;
          }

          posAttr.setX(i, x);
          posAttr.setY(i, y);
        }
        posAttr.needsUpdate = true;
      }

      // Shooting stars update loop (Using separate index-based refs to prevent render-time ref tracking)
      const streakRefs = [starStreak1Ref, starStreak2Ref, starStreak3Ref];
      shootingStars.forEach((star, idx) => {
        if (!star.active) {
          star.delay -= finalDt;
          if (star.delay <= 0) {
            star.active = true;
            const startX = (Math.random() - 0.25) * 65 + 12;
            const startY = Math.random() * 22 + 12;
            const startZ = -48 - Math.random() * 25;
            
            star.pos.set(startX, startY, startZ);
            star.progress = 0;
          }
        } else {
          if (!prefersReducedMotion) {
            star.pos.addScaledVector(star.dir, star.speed);
          }
          star.progress += finalDt * 0.95;

          const mesh = streakRefs[idx].current;
          if (mesh) {
            mesh.position.copy(star.pos);
            mesh.scale.set(0.045, 0.045, 2.8);
            
            const meshMat = mesh.material as THREE.MeshBasicMaterial;
            if (meshMat) {
              meshMat.opacity = Math.max(0, Math.sin(star.progress * Math.PI) * 0.85);
            }
          }

          if (star.progress >= 1.0 || star.pos.x < -85 || star.pos.y < -45) {
            star.active = false;
            star.delay = 3.0 + Math.random() * 6.5;
          }
        }
      });
    }
  });

  return (
    <group>
      {/* 1. Giant 3D Radial Space Gradient Shader Skybox */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[180, 32, 32]} />
        <shaderMaterial
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
          vertexShader={`
            varying vec3 vPosition;
            void main() {
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vPosition;
            void main() {
              float d = length(vPosition) / 180.0;
              vec3 centerColor = vec3(0.02, 0.05, 0.14); // Sleek deep space blue
              vec3 edgeColor = vec3(0.005, 0.008, 0.015);  // Infinite cosmic black
              vec3 finalColor = mix(centerColor, edgeColor, clamp(d * 1.5 - 0.4, 0.0, 1.0));
              gl_FragColor = vec4(finalColor, 1.0);
            }
          `}
        />
      </mesh>

      {/* 2. Stacked Volumetric Nebulae */}
      {nebulaTextures.length > 0 && (
        <group ref={nebulaeRef}>
          {nebulae.map((n, i) => (
            <mesh key={i} position={n.pos}>
              <planeGeometry args={[n.scale, n.scale]} />
              <meshBasicMaterial
                map={nebulaTextures[n.textureIdx]}
                transparent
                opacity={0.06}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                fog={false}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* 3. Deep Shell Starfield (Shaded) */}
      {starfield && (
        <points ref={starsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[starPositions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[starColors, 3]}
            />
            <bufferAttribute
              attach="attributes-aTwinkle"
              args={[starTwinkle, 2]}
            />
          </bufferGeometry>
          <shaderMaterial
            transparent
            depthWrite={false}
            vertexColors
            blending={THREE.AdditiveBlending}
            uniforms={starsUniforms}
            vertexShader={starsVertexShader}
            fragmentShader={starsFragmentShader}
            fog={false}
          />
        </points>
      )}

      {/* 4. Near Volumetric Starfield (Shaded for 3D Parallax) */}
      {nearStarfield && (
        <points ref={starsNearRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[nearStarPositions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[nearStarColors, 3]}
            />
            <bufferAttribute
              attach="attributes-aTwinkle"
              args={[nearStarTwinkle, 2]}
            />
          </bufferGeometry>
          <shaderMaterial
            transparent
            depthWrite={false}
            vertexColors
            blending={THREE.AdditiveBlending}
            uniforms={nearStarsUniforms}
            vertexShader={starsVertexShader}
            fragmentShader={starsFragmentShader}
            fog={false}
          />
        </points>
      )}

      {/* 5. Volumetric Sweeping Light Rays */}
      <mesh ref={ray1Ref} position={[-32, 10, -60]} rotation={[0.2, 0.1, -Math.PI / 3.2]} scale={[4.5, 1.0, 4.5]}>
        <cylinderGeometry args={[0.5, 1.6, 90, 16, 1, true]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          uniforms={ray1Uniforms}
          vertexShader={lightRayVertexShader}
          fragmentShader={lightRayFragmentShader}
          fog={false}
        />
      </mesh>

      <mesh ref={ray2Ref} position={[30, -10, -70]} rotation={[-0.1, -0.2, -Math.PI / 4.5]} scale={[3.5, 1.0, 3.5]}>
        <cylinderGeometry args={[0.4, 1.4, 85, 16, 1, true]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          uniforms={ray2Uniforms}
          vertexShader={lightRayVertexShader}
          fragmentShader={lightRayFragmentShader}
          fog={false}
        />
      </mesh>

      {/* 6. Camera Space Dust */}
      {spaceDust && (
        <points ref={dustRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[dustPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.065}
            color="#e0f2fe" // Light cyan sky glow dust
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </points>
      )}

      {/* 7. Distant Spiral Galaxies */}
      {distantGalaxies && distantGalaxies.map((dg: DistantGalaxy, idx: number) => (
        <points key={idx}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[dg.positions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[dg.colors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.045}
            vertexColors
            transparent
            opacity={0.55}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </points>
      ))}

      {/* 8. Shooting Stars (Rendered individually to avoid mapping over refs during render) */}
      <mesh
        ref={starStreak1Ref}
        rotation={[0, 0, Math.atan2(shootingStars[0].dir.y, shootingStars[0].dir.x) + Math.PI / 2]}
      >
        <cylinderGeometry args={[0.015, 0.015, 1.4, 4]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      <mesh
        ref={starStreak2Ref}
        rotation={[0, 0, Math.atan2(shootingStars[1].dir.y, shootingStars[1].dir.x) + Math.PI / 2]}
      >
        <cylinderGeometry args={[0.015, 0.015, 1.4, 4]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      <mesh
        ref={starStreak3Ref}
        rotation={[0, 0, Math.atan2(shootingStars[2].dir.y, shootingStars[2].dir.x) + Math.PI / 2]}
      >
        <cylinderGeometry args={[0.015, 0.015, 1.4, 4]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </mesh>
    </group>
  );
}
