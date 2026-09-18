"use client";

import { useEffect, useState } from "react";
import { useGalaxyStore } from "@/store/useGalaxyStore";
import { motion } from "framer-motion";

export default function HudOverlay() {
  const selectedProjectId = useGalaxyStore((state) => state.selectedProjectId);
  const transitionState = useGalaxyStore((state) => state.transitionState);
  const [time, setTime] = useState("");
  const [coords, setCoords] = useState("42.09.88.01");

  // Keep digital clock ticking
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Animate grid coordinates dynamically to look active
  useEffect(() => {
    if (selectedProjectId) return;
    const interval = setInterval(() => {
      const c1 = Math.floor(Math.random() * 90 + 10);
      const c2 = Math.floor(Math.random() * 90 + 10);
      const c3 = Math.floor(Math.random() * 900 + 100);
      setCoords(`42.${c1}.${c2}.${c3}`);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedProjectId]);

  const setActiveSection = useGalaxyStore((state) => state.setActiveSection);
  const activeSection = useGalaxyStore((state) => state.activeSection);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none select-none">
      {/* 1. Subtle scanning CRT lines */}
      <div className="absolute inset-0 scanlines opacity-65" />
      <div className="absolute inset-0 hud-grid opacity-[0.12]" />
 
      {/* 2. Sleek outer boundary frame lines */}
      <div className="absolute inset-4 border border-white/5" />
      
      {/* 3. Corner Brackets */}
      <div className="absolute top-6 left-6 w-3 h-3 border-t border-l border-cyan-400/40" />
      <div className="absolute top-6 right-6 w-3 h-3 border-t border-r border-cyan-400/40" />
      <div className="absolute bottom-6 left-6 w-3 h-3 border-b border-l border-cyan-400/40" />
      <div className="absolute bottom-6 right-6 w-3 h-3 border-b border-r border-cyan-400/40" />
 
      {/* 4. Top Header Navigation Banner */}
      <div className="absolute top-6 left-6 sm:left-12 right-6 sm:right-12 flex justify-between items-center text-[8.5px] font-mono tracking-[0.22em] text-white/40">
        <div className="flex items-center space-x-3">
          <div className="w-[6px] h-[6px] rounded-full bg-cyan-400/70 animate-pulse" />
          <span className="font-bold text-white/70">ABHISHEK // DEV</span>
        </div>
        
        {/* Clickable Navigation Links */}
        <div className="flex items-center space-x-2.5 sm:space-x-5 pointer-events-auto">
          <motion.button
            onClick={() => setActiveSection("ABOUT")}
            whileTap={{ scale: 0.98 }}
            aria-label="View About Section"
            className={`transition-colors duration-300 font-mono tracking-widest text-[8px] bg-transparent border-none cursor-pointer uppercase font-bold py-1 px-1 sm:px-1.5 ${activeSection === "ABOUT" ? "text-cyan-400" : "text-white/40 hover:text-white/75"}`}
          >
            [ ABOUT ]
          </motion.button>
          <motion.button
            onClick={() => setActiveSection("TIMELINE")}
            whileTap={{ scale: 0.98 }}
            aria-label="View Project Timeline"
            className={`transition-colors duration-300 font-mono tracking-widest text-[8px] bg-transparent border-none cursor-pointer uppercase font-bold py-1 px-1 sm:px-1.5 ${activeSection === "TIMELINE" ? "text-cyan-400" : "text-white/40 hover:text-white/75"}`}
          >
            [ TIMELINE ]
          </motion.button>
          <motion.button
            onClick={() => setActiveSection("RESUME")}
            whileTap={{ scale: 0.98 }}
            aria-label="View Resume / CV"
            className={`transition-colors duration-300 font-mono tracking-widest text-[8px] bg-transparent border-none cursor-pointer uppercase font-bold py-1 px-1 sm:px-1.5 ${activeSection === "RESUME" ? "text-cyan-400" : "text-white/40 hover:text-white/75"}`}
          >
            [ RESUME ]
          </motion.button>
          <motion.button
            onClick={() => setActiveSection("CONTACT")}
            whileTap={{ scale: 0.98 }}
            aria-label="View Contact Section"
            className={`transition-colors duration-300 font-mono tracking-widest text-[8px] bg-transparent border-none cursor-pointer uppercase font-bold py-1 px-1 sm:px-1.5 ${activeSection === "CONTACT" ? "text-cyan-400" : "text-white/40 hover:text-white/75"}`}
          >
            [ CONTACT ]
          </motion.button>
        </div>
 
        <div className="hidden sm:block">
          <span>TIME // <span className="text-white/70">{time}</span></span>
        </div>
      </div>

      {/* 5. Bottom Footer Banner */}
      <div className="absolute bottom-6 left-12 right-12 flex justify-between items-center text-[7px] font-mono tracking-[0.2em] text-white/30">
        <div className="flex items-center space-x-4">
          <span>SYSTEM STATE // <span className="text-cyan-400/50">NOMINAL</span></span>
          <span className="hidden sm:inline w-[1px] h-2 bg-white/10" />
          <span className="hidden sm:inline">TRANSITION // <span className="text-purple-400/60 uppercase">{transitionState}</span></span>
          <span className="hidden sm:inline w-[1px] h-2 bg-white/10" />
          <span className="hidden sm:inline">COORDS // <span className="text-white/60 uppercase">{coords}</span></span>
        </div>
        
        <div>
          <span>DESIGNED BY ABHISHEK // © 2026</span>
        </div>
      </div>

      {/* 6. Perspective Grid Compass (Sleek circle graphic in bottom left corner) */}
      <div className="absolute bottom-12 left-12 hidden lg:flex flex-col space-y-1.5 opacity-40">
        <div className="relative w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border border-dashed border-white/5 animate-spin duration-[10s]" />
          <div className="absolute w-[1px] h-12 bg-white/10" />
          <div className="absolute w-12 h-[1px] bg-white/10" />
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
        </div>
        <span className="text-[6px] font-mono tracking-widest text-center text-white/30">ORIENT.SYS</span>
      </div>
    </div>
  );
}
