"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useGalaxyStore } from "@/store/useGalaxyStore";
import { motion } from "framer-motion";
import * as THREE from "three";

export default function GalaxyCenterText() {
  const containerRef = useRef<THREE.Group>(null);
  const selectedProjectId = useGalaxyStore((state) => state.selectedProjectId);
  const activeSection = useGalaxyStore((state) => state.activeSection);
  const prefersReducedMotion = useGalaxyStore((state) => state.prefersReducedMotion);
  const selectProject = useGalaxyStore((state) => state.selectProject);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (containerRef.current) {
      if (prefersReducedMotion) {
        // Freeze static positioning
        containerRef.current.position.y = 1.0;
        containerRef.current.rotation.set(0, 0, 0);
      } else {
        // Cinematic breathing / vertical floating animation
        containerRef.current.position.y = 1.0 + Math.sin(elapsed * 1.0) * 0.12;
        
        // Gentle rotatory oscillation for 3D depth parallax
        containerRef.current.rotation.y = Math.sin(elapsed * 0.3) * 0.06;
        containerRef.current.rotation.x = Math.cos(elapsed * 0.25) * 0.03;
      }
    }
  });

  // Hide the center text if a project or modal overlay is open
  const isHidden = selectedProjectId !== null || activeSection !== null;

  return (
    <group ref={containerRef} position={[0, 1.0, 0]}>
      <Html
        center
        distanceFactor={6} // Scale automatically with camera distance
        transform // Project the HTML card natively into 3D space
        style={{
          transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          opacity: isHidden ? 0.0 : 1.0,
          transform: isHidden ? "scale(0.8) translateY(-20px)" : "scale(1) translateY(0px)",
          pointerEvents: isHidden ? "none" : "auto",
        }}
      >
        <div 
          style={{
            background: "radial-gradient(circle, rgba(2, 4, 10, 0.96) 0%, rgba(2, 4, 10, 0.70) 55%, rgba(0, 0, 0, 0) 100%)"
          }}
          className="flex flex-col items-center justify-center select-none text-center min-w-[340px] sm:min-w-[460px] max-w-[480px] p-8 sm:p-10 font-sans rounded-3xl"
        >
          
          {/* User Name - Significantly Larger, Luxury Thin Style */}
          <h1 className="text-[44px] sm:text-[62px] md:text-[72px] font-light tracking-[0.16em] text-white leading-none mb-2 uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] font-sans">
            ABHISHEK
          </h1>
 
          {/* Sub-Header / Title - Visually Prominent */}
          <h2 className="text-[9.5px] sm:text-[11px] font-bold tracking-[0.45em] text-cyan-400 drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)] uppercase font-mono mb-6">
            SOFTWARE ENGINEER
          </h2>
 
          {/* Tagline Bio statement - Formatted as two clean lines on desktop */}
          <p className="text-[12px] sm:text-[13.5px] text-slate-200 leading-relaxed font-light font-sans max-w-[440px] px-4 mb-8 drop-shadow-[0_1.5px_6px_rgba(0,0,0,0.9)]">
            Building AI-powered and Full-Stack products <br className="hidden sm:inline" />
            focused on performance, usability, and thoughtful engineering.
          </p>
 
          {/* Interactive Outlined CTA & Mouse Scroll Indicator */}
          <div className="flex flex-col items-center space-y-6 pointer-events-auto">
            
            {/* Click to Explore Projects Button with Tactile Micro-Interactions */}
            <motion.button
              onClick={() => selectProject("musicflow")}
              whileHover={{ 
                borderColor: "rgba(255,255,255,0.35)", 
                backgroundColor: "rgba(255,255,255,0.03)", 
                color: "#ffffff" 
              }}
              whileTap={{ scale: 0.98 }}
              aria-label="Explore Projects"
              className="px-6 py-2.5 border border-white/10 bg-white/[0.01] text-white/70 rounded-full font-mono text-[9px] tracking-[0.25em] transition-all duration-300 cursor-pointer shadow-sm uppercase font-bold"
            >
              EXPLORE PROJECTS
            </motion.button>

            {/* Elegant Mouse Scroll Indicator */}
            <div className="flex flex-col items-center opacity-40">
              <div className="w-[14px] h-[22px] rounded-full border border-white/20 flex justify-center p-1">
                <div 
                  style={{
                    animation: "scroll-dot-slide 1.8s ease-in-out infinite"
                  }}
                  className="w-[2px] h-[4px] rounded-full bg-cyan-400" 
                />
              </div>
              <span className="text-[6.5px] tracking-[0.2em] text-white/40 font-mono uppercase mt-2">
                Scroll or Click Planet
              </span>
            </div>

          </div>
        </div>
      </Html>
    </group>
  );
}
