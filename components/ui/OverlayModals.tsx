"use client";

import { useEffect } from "react";
import { useGalaxyStore } from "@/store/useGalaxyStore";
import { motion, AnimatePresence } from "framer-motion";

export default function OverlayModals() {
  const activeSection = useGalaxyStore((state) => state.activeSection);
  const setActiveSection = useGalaxyStore((state) => state.setActiveSection);
  const prefersReducedMotion = useGalaxyStore((state) => state.prefersReducedMotion);

  // Close modals on Escape keypress (A11y rule)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveSection(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setActiveSection]);

  const handleClose = () => {
    setActiveSection(null);
  };

  const getTransition = () => {
    return prefersReducedMotion 
      ? { duration: 0.15 } 
      : { type: "spring" as const, damping: 30, stiffness: 200 };
  };

  // 1. Skill chips stagger variants
  const chipContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.04
      }
    }
  };

  const chipVariants = {
    hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 220, damping: 15 }
    }
  };

  // 2. Timeline items stagger variants
  const timelineContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08
      }
    }
  };

  const timelineItemVariants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -8 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring" as const, stiffness: 180, damping: 20 }
    }
  };

  return (
    <AnimatePresence>
      {activeSection && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
          
          {/* Modal Backdrop Screen Darkener */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto cursor-pointer"
          />

          {/* Modal Card Sheet Container (Fade + Blur + Scale combined) */}
          <motion.div
            initial={{ 
              opacity: 0, 
              filter: "blur(10px)", 
              y: prefersReducedMotion ? 0 : 20, 
              scale: prefersReducedMotion ? 1 : 0.96 
            }}
            animate={{ 
              opacity: 1, 
              filter: "blur(0px)", 
              y: 0, 
              scale: 1 
            }}
            exit={{ 
              opacity: 0, 
              filter: "blur(8px)", 
              y: prefersReducedMotion ? 0 : 15, 
              scale: prefersReducedMotion ? 1 : 0.97 
            }}
            transition={getTransition()}
            className="w-full max-w-[500px] max-h-[85vh] overflow-y-auto glass-panel border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col z-10 pointer-events-auto select-text scrollbar-thin shadow-2xl relative"
          >
            
            {/* Header: Close Button */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
              <span className="text-[9px] font-mono tracking-[0.25em] text-cyan-400 font-bold uppercase">
                SYSTEM // {activeSection}
              </span>
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Close modal"
                className="w-7 h-7 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center text-xs transition-all duration-300 cursor-pointer shadow-sm"
              >
                ✕
              </motion.button>
            </div>

            {/* Modal Body: Dynamic Sections Render */}
            <div className="flex-1 space-y-6">
              
              {/* --- ABOUT SECTION --- */}
              {activeSection === "ABOUT" && (
                <div className="space-y-6">
                  {/* Bio */}
                  <div className="space-y-2">
                    <h3 className="text-[9px] font-mono tracking-wider text-white/40 uppercase">INTRODUCTION</h3>
                    <p className="text-xs text-white/80 leading-relaxed font-light">
                      I am Abhishek, a software engineer dedicated to building high-performance, thoughtfully designed software applications. I focus on core full-stack systems, real-time client-server communication, and practical AI integrations.
                    </p>
                  </div>

                  {/* Engineering Interests */}
                  <div className="space-y-2">
                    <h3 className="text-[9px] font-mono tracking-wider text-white/40 uppercase">ENGINEERING INTERESTS</h3>
                    <p className="text-xs text-white/70 leading-relaxed font-light">
                      Full-Stack Architecture, Real-Time Systems, Web Performance, Tool Ingestion Pipelines, and CLI Automations.
                    </p>
                  </div>

                  {/* Current Focus */}
                  <div className="space-y-2">
                    <h3 className="text-[9px] font-mono tracking-wider text-white/40 uppercase">CURRENT FOCUS</h3>
                    <p className="text-xs text-white/70 leading-relaxed font-light">
                      Developing desktop integrations and conversational interface hooks to automate local developer workflows.
                    </p>
                  </div>

                  {/* Core Tech Stack (Animate individual skill chips) */}
                  <div className="space-y-2.5">
                    <h3 className="text-[9px] font-mono tracking-wider text-white/40 uppercase">CORE TECHNOLOGIES</h3>
                    <motion.div 
                      variants={chipContainerVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex flex-wrap gap-1.5 pt-1"
                    >
                      {["TypeScript", "Python", "Go", "Node.js", "FastAPI", "Next.js", "React", "Express", "Supabase", "MongoDB", "SQLite", "Prisma"].map((tech) => (
                        <motion.span
                          key={tech}
                          variants={chipVariants}
                          whileHover={{ 
                            scale: 1.01, 
                            borderColor: "rgba(255,255,255,0.22)",
                            backgroundColor: "rgba(255,255,255,0.04)",
                            color: "#ffffff"
                          }}
                          className="text-[9px] font-mono px-2 py-0.5 border border-white/10 rounded-md bg-white/[0.02] text-white/70 transition-all duration-300 cursor-default select-none"
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </motion.div>
                  </div>
                </div>
              )}

              {/* --- TIMELINE SECTION --- */}
              {activeSection === "TIMELINE" && (
                <div className="space-y-6">
                  <p className="text-xs text-white/60 leading-relaxed font-light italic">
                    The chronological evolution of projects built, starting from basic database systems up to desktop integrations:
                  </p>

                  <div className="relative pl-5 space-y-7 ml-2 pt-2">
                    
                    {/* Connection lines animate (Honors prefersReducedMotion) */}
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      style={{ originY: 0 }}
                      className="absolute left-[7px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-white/20 via-white/10 to-white/5"
                    />

                    {/* Timeline entries reveal sequentially */}
                    <motion.div
                      variants={timelineContainerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-7"
                    >
                      
                      {/* Item 1: MusicFlow */}
                      <motion.div variants={timelineItemVariants} className="relative">
                        <div className="absolute w-2 h-2 rounded-full bg-purple-400 -left-[22px] top-1.5 shadow-[0_0_6px_#c084fc]" />
                        <div className="flex items-center space-x-2">
                          <h4 className="text-[11px] font-bold text-white uppercase">MusicFlow</h4>
                          <span 
                            style={{ textShadow: "0 0 8px rgba(192,132,252,0.35)" }}
                            className="text-[7.5px] font-mono text-purple-400 bg-purple-500/5 px-1.5 py-0.5 rounded border border-purple-500/25 shadow-[0_0_8px_rgba(192,132,252,0.12)]"
                          >
                            Production Ready
                          </span>
                        </div>
                        <span className="text-[7.5px] font-mono text-white/30 block mt-0.5">3 Months // Full-Stack Developer</span>
                        <p className="text-[10px] text-white/55 mt-1 leading-relaxed font-light font-sans max-w-[430px]">
                          Next.js music streaming app using Meilisearch, better-auth, and Upstash Redis querying YouTube Music API streams.
                        </p>
                      </motion.div>

                      {/* Item 2: RideX */}
                      <motion.div variants={timelineItemVariants} className="relative">
                        <div className="absolute w-2 h-2 rounded-full bg-orange-400 -left-[22px] top-1.5 shadow-[0_0_6px_#fb923c]" />
                        <div className="flex items-center space-x-2">
                          <h4 className="text-[11px] font-bold text-white uppercase">RideX</h4>
                          <span 
                            style={{ textShadow: "0 0 8px rgba(251,146,60,0.35)" }}
                            className="text-[7.5px] font-mono text-orange-400 bg-orange-500/5 px-1.5 py-0.5 rounded border border-orange-500/25 shadow-[0_0_8px_rgba(251,146,60,0.12)]"
                          >
                            Production Ready
                          </span>
                        </div>
                        <span className="text-[7.5px] font-mono text-white/30 block mt-0.5">2 Months // Solo Developer</span>
                        <p className="text-[10px] text-white/55 mt-1 leading-relaxed font-light font-sans max-w-[430px]">
                          Express WebSocket coordinate tracker syncing driver coordinate points in real-time to Leaflet/Mapbox maps.
                        </p>
                      </motion.div>

                      {/* Item 3: Jarvis AI OS */}
                      <motion.div variants={timelineItemVariants} className="relative">
                        <div className="absolute w-2 h-2 rounded-full bg-cyan-400 -left-[22px] top-1.5 shadow-[0_0_6px_#22d3ee]" />
                        <div className="flex items-center space-x-2">
                          <h4 className="text-[11px] font-bold text-white uppercase">Jarvis AI OS</h4>
                          <span 
                            style={{ textShadow: "0 0 8px rgba(34,211,238,0.35)" }}
                            className="text-[7.5px] font-mono text-cyan-400 bg-cyan-500/5 px-1.5 py-0.5 rounded border border-cyan-500/25 shadow-[0_0_8px_rgba(34,211,238,0.12)]"
                          >
                            In Development
                          </span>
                        </div>
                        <span className="text-[7.5px] font-mono text-white/30 block mt-0.5">Ongoing // Backend Engineer</span>
                        <p className="text-[10px] text-white/55 mt-1 leading-relaxed font-light font-sans max-w-[430px]">
                          FastAPI and SQLite local desktop helper daemon executing subprocess application scans and LLM chat streams.
                        </p>
                      </motion.div>

                      {/* Item 4: CareerPilot AI */}
                      <motion.div variants={timelineItemVariants} className="relative">
                        <div className="absolute w-2 h-2 rounded-full bg-blue-400 -left-[22px] top-1.5 shadow-[0_0_6px_#60a5fa]" />
                        <div className="flex items-center space-x-2">
                          <h4 className="text-[11px] font-bold text-white uppercase">CareerPilot AI</h4>
                          <span 
                            style={{ textShadow: "0 0 8px rgba(96,165,250,0.35)" }}
                            className="text-[7.5px] font-mono text-blue-400 bg-blue-500/5 px-1.5 py-0.5 rounded border border-blue-500/25 shadow-[0_0_8px_rgba(96,165,250,0.12)]"
                          >
                            Production Ready
                          </span>
                        </div>
                        <span className="text-[7.5px] font-mono text-white/30 block mt-0.5">1 Month // Solo Developer</span>
                        <p className="text-[10px] text-white/55 mt-1 leading-relaxed font-light font-sans max-w-[430px]">
                          Streamlit-based resume PDF text parser evaluating ATS scoring matches using pandas keywords alignment.
                        </p>
                      </motion.div>

                    </motion.div>
                  </div>
                </div>
              )}

              {/* --- CONTACT SECTION --- */}
              {activeSection === "CONTACT" && (
                <div className="space-y-6">
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    If you are looking to hire a full-stack engineer who values clean code, solid architectures, and performance optimizations, let&apos;s connect.
                  </p>

                  <div className="space-y-4">
                    {/* Link 1: GitHub */}
                    <motion.a
                      href="https://github.com/Rick2882004"
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ 
                        scale: 1.01,
                        borderColor: "rgba(255,255,255,0.18)", 
                        backgroundColor: "rgba(255,255,255,0.02)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-between p-3.5 border border-white/5 bg-white/[0.01] rounded-xl transition-all duration-300 group pointer-events-auto"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg transition-transform duration-300 group-hover:rotate-12 group-hover:scale-115">⚙</span>
                        <span className="text-xs font-mono text-white/80 group-hover:text-white transition-colors">github.com/Rick2882004</span>
                      </div>
                      <span className="text-[9px] font-mono text-white/30 group-hover:text-white/60 transition-colors">GITHUB →</span>
                    </motion.a>

                    {/* Link 2: LinkedIn */}
                    <motion.a
                      href="https://www.linkedin.com/in/abhishek-mukherjee-b31906277/"
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ 
                        scale: 1.01,
                        borderColor: "rgba(255,255,255,0.18)", 
                        backgroundColor: "rgba(255,255,255,0.02)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-between p-3.5 border border-white/5 bg-white/[0.01] rounded-xl transition-all duration-300 group pointer-events-auto"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-115">💼</span>
                        <span className="text-xs font-mono text-white/80 group-hover:text-white transition-colors">linkedin.com/in/abhishek-mukherjee...</span>
                      </div>
                      <span className="text-[9px] font-mono text-white/30 group-hover:text-white/60 transition-colors">LINKEDIN →</span>
                    </motion.a>

                    {/* Link 3: Email */}
                    <motion.a
                      href="mailto:a.mukherjee581699@gmail.com"
                      whileHover={{ 
                        scale: 1.01,
                        borderColor: "rgba(255,255,255,0.18)", 
                        backgroundColor: "rgba(255,255,255,0.02)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-between p-3.5 border border-white/5 bg-white/[0.01] rounded-xl transition-all duration-300 group pointer-events-auto"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg transition-transform duration-300 group-hover:rotate-[15deg] group-hover:scale-115">✉</span>
                        <span className="text-xs font-mono text-white/80 group-hover:text-white transition-colors">a.mukherjee581699@gmail.com</span>
                      </div>
                      <span className="text-[9px] font-mono text-white/30 group-hover:text-white/60 transition-colors">EMAIL →</span>
                    </motion.a>

                    {/* Link 4: Resume Download Button with premium hover */}
                    <div className="pt-2">
                      <motion.a
                        href="/resume.pdf"
                        download
                        whileHover={{ 
                          scale: 1.01, 
                          borderColor: "rgba(255,255,255,0.3)", 
                          backgroundColor: "rgba(255,255,255,0.06)" 
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center space-x-2 w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-mono tracking-wider transition-all duration-300 shadow-sm pointer-events-auto"
                      >
                        <span>⬇ DOWNLOAD RESUME (PDF)</span>
                      </motion.a>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
