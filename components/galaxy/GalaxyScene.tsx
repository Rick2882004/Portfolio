"use client";

import GalaxyCore from "./GalaxyCore";
import OrbitSystem from "./OrbitSystem";
import CinematicStarfield from "./CinematicStarfield";
import CameraController from "./CameraController";
import GalaxyCenterText from "./GalaxyCenterText";

export default function GalaxyScene() {
  return (
    <>
      {/* 1. Immersive Environment (stars, dust, nebulae) */}
      <CinematicStarfield />

      {/* 2. Swirling glowing core */}
      <GalaxyCore />

      {/* 3. Floating 3D Text Card */}
      <GalaxyCenterText />

      {/* 4. Planetary orbit systems */}
      <OrbitSystem />

      {/* 5. Camera Director */}
      <CameraController />
    </>
  );
}