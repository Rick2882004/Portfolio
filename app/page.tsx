"use client";

import { useEffect, useState } from "react";
import { useGalaxyStore } from "@/store/useGalaxyStore";
import GalaxyCanvas from "@/components/galaxy/GalaxyCanvas";
import HudOverlay from "@/components/ui/HudOverlay";
import ProjectDetailPanel from "@/components/ui/ProjectDetailPanel";
import OverlayModals from "@/components/ui/OverlayModals";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const selectedProjectId = useGalaxyStore((state) => state.selectedProjectId);
  const activeSection = useGalaxyStore((state) => state.activeSection);
  const prefersReducedMotion = useGalaxyStore((state) => state.prefersReducedMotion);
  const setIsMobile = useGalaxyStore((state) => state.setIsMobile);
  const setPrefersReducedMotion = useGalaxyStore((state) => state.setPrefersReducedMotion);
  const selectProject = useGalaxyStore((state) => state.selectProject);
  const setActiveSection = useGalaxyStore((state) => state.setActiveSection);

  // Monitor media states and handle loader
  useEffect(() => {
    // 1. Mobile state query
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // 2. Prefers Reduced Motion query
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);
    
    const motionListener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    motionQuery.addEventListener("change", motionListener);

    // 3. Elegant startup loader delay
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 2200);

    return () => {
      window.removeEventListener("resize", checkMobile);
      motionQuery.removeEventListener("change", motionListener);
      clearTimeout(timer);
    };
  }, [setIsMobile, setPrefersReducedMotion]);

  return (
    <main className="relative h-screen w-screen bg-[#02040a] overflow-hidden select-none">
      {/* Animated Film Grain Overlay */}
      <div className="film-grain" />

      {/* Faint Cosmic Background Nebula Rays */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.06] overflow-hidden">
        {/* Ray 1 */}
        <div 
          style={{
            transform: "rotate(-35deg) translate3d(0, 0, 0)",
            animation: prefersReducedMotion ? "none" : "ray-sweep-1 30s linear infinite"
          }}
          className="absolute -top-[10%] -left-[20%] w-[35%] h-[150%] bg-gradient-to-r from-transparent via-cyan-500/[0.005] to-transparent blur-2xl" 
        />
        {/* Ray 2 */}
        <div 
          style={{
            transform: "rotate(-40deg) translate3d(0, 0, 0)",
            animation: prefersReducedMotion ? "none" : "ray-sweep-2 36s linear infinite"
          }}
          className="absolute -top-[20%] right-[10%] w-[30%] h-[160%] bg-gradient-to-r from-transparent via-purple-500/[0.004] to-transparent blur-2xl" 
        />
      </div>

      {/* Elegant Loading Cover Screen */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-[#02040a] z-50 flex flex-col items-center justify-center font-mono"
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center space-y-4"
            >
              {/* Vercel-style glowing dot spinner */}
              <div className="w-8 h-8 relative flex items-center justify-center">
                <div className="absolute inset-0 border border-cyan-500/20 rounded-full animate-ping" />
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-[9px] tracking-[0.45em] text-white/50 uppercase font-mono font-medium">
                  ABHISHEK // PORTFOLIO
                </span>
                <span className="text-[6px] tracking-[0.2em] text-cyan-400/80 mt-1 uppercase font-mono">
                  INITIALIZING_COSMIC_ENGINE
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Darkened Canvas Backdrop Overlay when a planet is selected or a section modal is open */}
      <AnimatePresence>
        {(selectedProjectId !== null || activeSection !== null) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.32 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => {
              if (selectedProjectId !== null) selectProject(null);
              if (activeSection !== null) setActiveSection(null);
            }}
            className="absolute inset-0 bg-black z-10 pointer-events-auto cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* 1. Cosmic HUD Console Interface (Grid, scanlines, clock, status) */}
      <HudOverlay />

      {/* 2. Premium 3D WebGL Canvas */}
      <GalaxyCanvas />

      {/* 3. Glassmorphic Project Details Drawer */}
      <ProjectDetailPanel />

      {/* 4. Glassmorphic Modals Overlay (About, Timeline, Contact) */}
      <OverlayModals />
    </main>
  );
}