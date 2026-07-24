"use client";

import { Canvas } from "@react-three/fiber";
import GalaxyScene from "./GalaxyScene";

export default function GalaxyCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 6, 16], fov: 45 }}
      dpr={[1, 2]} // limit device pixel ratio to 2 for performance
      gl={{ antialias: true, alpha: false }}
    >
      {/* Space Background color */}
      <color attach="background" args={["#02040a"]} />

      {/* Subtle depth fog (planets fade elegantly into deep space at distances) */}
      <fog attach="fog" args={["#02040a", 14, 28]} />

      {/* Lighting System */}
      <ambientLight intensity={0.4} />
      
      {/* Soft key light for planet reflections and metallic surface highlights */}
      <directionalLight position={[10, 15, 5]} intensity={1.5} color="#cbd5e1" />
      <directionalLight position={[-10, -5, -5]} intensity={0.5} color="#3b82f6" />

      {/* 3D Cosmic Scene */}
      <GalaxyScene />
    </Canvas>
  );
}