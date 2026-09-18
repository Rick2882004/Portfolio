"use client";

import { useEffect, useState } from "react";
import { useGalaxyStore } from "@/store/useGalaxyStore";
import { motion, AnimatePresence } from "framer-motion";

export default function OverlayModals() {
  const activeSection = useGalaxyStore((state) => state.activeSection);
  const setActiveSection = useGalaxyStore((state) => state.setActiveSection);
  const prefersReducedMotion = useGalaxyStore((state) => state.prefersReducedMotion);
  const [resumeViewMode, setResumeViewMode] = useState<"document" | "pdf">("document");

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
            className={`w-full ${activeSection === "RESUME" ? "max-w-[780px]" : "max-w-[500px]"} max-h-[85vh] overflow-y-auto glass-panel border border-white/10 rounded-2xl p-5 sm:p-7 md:p-8 flex flex-col z-10 pointer-events-auto select-text scrollbar-thin shadow-2xl relative transition-[max-width] duration-300`}
          >
            
            {/* Header: Close Button & Actions */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
              <span className="text-[9px] font-mono tracking-[0.25em] text-cyan-400 font-bold uppercase">
                SYSTEM // {activeSection === "RESUME" ? "RESUME / CV" : activeSection}
              </span>
              <div className="flex items-center space-x-2">
                {activeSection === "RESUME" && (
                  <motion.a
                    href="/resume/Abhishek_Mukherjee_Resume.pdf"
                    download="Abhishek_Mukherjee_Resume.pdf"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Download Abhishek Mukherjee Resume PDF"
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[8.5px] font-mono tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer"
                  >
                    <span>⬇</span>
                    <span className="hidden sm:inline">DOWNLOAD PDF</span>
                  </motion.a>
                )}
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

                    {/* Resume Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                      <motion.button
                        onClick={() => setActiveSection("RESUME")}
                        whileHover={{ 
                          scale: 1.01, 
                          borderColor: "rgba(6,182,212,0.4)", 
                          backgroundColor: "rgba(6,182,212,0.12)" 
                        }}
                        whileTap={{ scale: 0.98 }}
                        aria-label="View Resume / CV Section"
                        className="flex-1 flex items-center justify-center space-x-2 py-3 bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 rounded-xl text-[10px] font-mono tracking-wider transition-all duration-300 shadow-sm pointer-events-auto cursor-pointer"
                      >
                        <span>📄</span>
                        <span>VIEW RESUME / CV</span>
                      </motion.button>
                      <motion.a
                        href="/resume/Abhishek_Mukherjee_Resume.pdf"
                        download="Abhishek_Mukherjee_Resume.pdf"
                        whileHover={{ 
                          scale: 1.01, 
                          borderColor: "rgba(255,255,255,0.3)", 
                          backgroundColor: "rgba(255,255,255,0.06)" 
                        }}
                        whileTap={{ scale: 0.98 }}
                        aria-label="Download Abhishek Mukherjee Resume PDF"
                        className="flex-1 flex items-center justify-center space-x-2 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-mono tracking-wider transition-all duration-300 shadow-sm pointer-events-auto cursor-pointer"
                      >
                        <span>⬇</span>
                        <span>DOWNLOAD (PDF)</span>
                      </motion.a>
                    </div>
                  </div>
                </div>
              )}

              {/* --- RESUME SECTION --- */}
              {activeSection === "RESUME" && (
                <div className="space-y-6">
                  {/* Top Mode Selector and Direct Actions Toolbar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 bg-white/[0.02] border border-white/5 rounded-xl">
                    {/* View Switcher */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setResumeViewMode("document")}
                        aria-label="Switch to Formatted Document View"
                        className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[8.5px] font-mono tracking-wider transition-all duration-200 cursor-pointer ${
                          resumeViewMode === "document"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                            : "text-white/40 hover:text-white/70 border border-transparent"
                        }`}
                      >
                        [ DOCUMENT VIEW ]
                      </button>
                      <button
                        onClick={() => setResumeViewMode("pdf")}
                        aria-label="Switch to Original PDF Viewer"
                        className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[8.5px] font-mono tracking-wider transition-all duration-200 cursor-pointer ${
                          resumeViewMode === "pdf"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                            : "text-white/40 hover:text-white/70 border border-transparent"
                        }`}
                      >
                        [ PDF VIEWER ]
                      </button>
                    </div>

                    {/* Quick Access Links */}
                    <div className="flex items-center justify-end space-x-3 text-[8.5px] font-mono">
                      <a
                        href="/resume/Abhishek_Mukherjee_Resume.pdf"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Open original PDF in new browser tab"
                        className="text-white/40 hover:text-cyan-300 transition-colors flex items-center space-x-1"
                      >
                        <span>OPEN IN TAB ↗</span>
                      </a>
                      <span className="text-white/20">|</span>
                      <a
                        href="/resume/Abhishek_Mukherjee_Resume.pdf"
                        download="Abhishek_Mukherjee_Resume.pdf"
                        aria-label="Download original CV PDF"
                        className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold flex items-center space-x-1"
                      >
                        <span>⬇ DOWNLOAD</span>
                      </a>
                    </div>
                  </div>

                  {/* 1. PDF EMBEDDED VIEWER */}
                  {resumeViewMode === "pdf" && (
                    <div className="space-y-3">
                      <div className="relative w-full h-[64vh] rounded-xl overflow-hidden border border-white/10 bg-black/60 shadow-inner">
                        <iframe
                          src="/resume/Abhishek_Mukherjee_Resume.pdf#toolbar=1"
                          title="Abhishek Mukherjee Resume PDF Viewer"
                          className="w-full h-full border-0"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 text-[8.5px] font-mono text-white/40">
                        <span>ORIGINAL ASSET // Abhishek_Mukherjee_Resume.pdf</span>
                        <div className="flex items-center space-x-3">
                          <a
                            href="/resume/Abhishek_Mukherjee_Resume.pdf"
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-2"
                          >
                            Open in standalone window ↗
                          </a>
                          <span>•</span>
                          <a
                            href="/resume/Abhishek_Mukherjee_Resume.pdf"
                            download="Abhishek_Mukherjee_Resume.pdf"
                            className="text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-2"
                          >
                            Download PDF ⬇
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. FORMATTED DOCUMENT VIEW (Exact verbatim CV source of truth) */}
                  {resumeViewMode === "document" && (
                    <div className="space-y-7 text-left">
                      {/* CV Header: Candidate Identity & Contact */}
                      <div className="border-b border-white/10 pb-5 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase font-sans">
                            ABHISHEK MUKHERJEE
                          </h1>
                          <span className="text-[9px] font-mono text-cyan-400 tracking-wider">
                            SOFTWARE // AI & ML
                          </span>
                        </div>

                        {/* Contact details */}
                        <div className="text-[10px] font-mono text-white/60 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span>Kolkata, India</span>
                          <span className="text-white/20">•</span>
                          <span>8100218508</span>
                          <span className="text-white/20">•</span>
                          <a 
                            href="mailto:a.mukherjee581699@gmail.com" 
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            a.mukherjee581699@gmail.com
                          </a>
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap gap-2 pt-1.5">
                          <a
                            href="https://linkedin.com/in/abhishek-mukherjee-b31906277"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="LinkedIn profile"
                            className="text-[9px] font-mono px-2 py-0.5 rounded border border-white/10 bg-white/[0.02] text-white/70 hover:text-white hover:border-cyan-400/40 transition-colors flex items-center space-x-1"
                          >
                            <span>💼 linkedin.com/in/abhishek-mukherjee-b31906277</span>
                          </a>
                          <a
                            href="https://github.com/Rick2882004"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="GitHub profile"
                            className="text-[9px] font-mono px-2 py-0.5 rounded border border-white/10 bg-white/[0.02] text-white/70 hover:text-white hover:border-cyan-400/40 transition-colors flex items-center space-x-1"
                          >
                            <span>⚙ github.com/Rick2882004</span>
                          </a>
                          <a
                            href="https://portfolio-nine-navy-76.vercel.app"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Portfolio link"
                            className="text-[9px] font-mono px-2 py-0.5 rounded border border-white/10 bg-white/[0.02] text-white/70 hover:text-white hover:border-cyan-400/40 transition-colors flex items-center space-x-1"
                          >
                            <span>🌐 portfolio-nine-navy-76.vercel.app</span>
                          </a>
                        </div>
                      </div>

                      {/* --- PROFILE --- */}
                      <div className="space-y-2">
                        <div className="border-b border-white/10 pb-1 flex items-center justify-between">
                          <h3 className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                            PROFILE
                          </h3>
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed font-light font-sans">
                          B.Tech CSE (AI & ML) student with practical experience building web applications and AI-based software. I enjoy working across frontend and backend development, turning ideas into working products, and learning new technologies by building projects. Currently looking for opportunities in software development, full-stack development, and AI/ML.
                        </p>
                      </div>

                      {/* --- EDUCATION --- */}
                      <div className="space-y-2.5">
                        <div className="border-b border-white/10 pb-1 flex items-center justify-between">
                          <h3 className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                            EDUCATION
                          </h3>
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                            <span className="font-semibold text-white font-sans">Adamas University, Kolkata, India</span>
                            <span className="text-[9px] font-mono text-white/50">2023–2027</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-white/70">
                            <span className="font-light">B.Tech in Computer Science & Engineering (AI & ML)</span>
                            <span className="text-[9px] font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 inline-block w-fit mt-0.5 sm:mt-0">
                              CGPA: 6.70/10
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* --- EXPERIENCE --- */}
                      <div className="space-y-2.5">
                        <div className="border-b border-white/10 pb-1 flex items-center justify-between">
                          <h3 className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                            EXPERIENCE
                          </h3>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                            <span className="text-xs font-semibold text-white font-sans">
                              AI/ML Research Group Member — A.K. Choudhury School of Information Technology (AKCSIT), University of Calcutta
                            </span>
                            <span className="text-[9px] font-mono text-white/50 whitespace-nowrap">
                              2026–Present
                            </span>
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-xs text-white/75 font-light leading-relaxed pl-1">
                            <li>Joined the AI/ML Research Group and participate in research activities under the guidance of Prof. Amlan Chakrabarti.</li>
                            <li>Working with the group on AI/ML research activities, including work related to AI for Healthcare.</li>
                          </ul>
                        </div>
                      </div>

                      {/* --- TECHNICAL SKILLS --- */}
                      <div className="space-y-2.5">
                        <div className="border-b border-white/10 pb-1 flex items-center justify-between">
                          <h3 className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                            TECHNICAL SKILLS
                          </h3>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                            <span className="font-mono text-[9px] text-white/50 uppercase min-w-[90px]">Programming:</span>
                            <div className="flex flex-wrap gap-1">
                              {["Python", "Java", "JavaScript", "TypeScript", "C"].map((item) => (
                                <span key={item} className="text-[9px] font-mono px-2 py-0.5 border border-white/10 rounded-md bg-white/[0.02] text-white/80">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                            <span className="font-mono text-[9px] text-white/50 uppercase min-w-[90px]">Web:</span>
                            <div className="flex flex-wrap gap-1">
                              {["React", "Next.js", "HTML", "CSS", "Tailwind CSS"].map((item) => (
                                <span key={item} className="text-[9px] font-mono px-2 py-0.5 border border-white/10 rounded-md bg-white/[0.02] text-white/80">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                            <span className="font-mono text-[9px] text-white/50 uppercase min-w-[90px]">Backend:</span>
                            <div className="flex flex-wrap gap-1">
                              {["FastAPI", "REST APIs", "Node.js"].map((item) => (
                                <span key={item} className="text-[9px] font-mono px-2 py-0.5 border border-white/10 rounded-md bg-white/[0.02] text-white/80">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                            <span className="font-mono text-[9px] text-white/50 uppercase min-w-[90px]">Database:</span>
                            <div className="flex flex-wrap gap-1">
                              {["PostgreSQL", "SQLite", "Prisma"].map((item) => (
                                <span key={item} className="text-[9px] font-mono px-2 py-0.5 border border-white/10 rounded-md bg-white/[0.02] text-white/80">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                            <span className="font-mono text-[9px] text-white/50 uppercase min-w-[90px]">Tools:</span>
                            <div className="flex flex-wrap gap-1">
                              {["Git", "GitHub", "VS Code"].map((item) => (
                                <span key={item} className="text-[9px] font-mono px-2 py-0.5 border border-white/10 rounded-md bg-white/[0.02] text-white/80">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* --- PROJECTS --- */}
                      <div className="space-y-4">
                        <div className="border-b border-white/10 pb-1 flex items-center justify-between">
                          <h3 className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                            PROJECTS
                          </h3>
                        </div>

                        {/* Project 1: MusicFlow */}
                        <div className="space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                            <h4 className="text-xs font-bold text-white font-sans">
                              MusicFlow — Music Streaming Platform
                            </h4>
                          </div>
                          <div className="text-[9px] font-mono text-purple-400">
                            Next.js, React, TypeScript, Zustand, YouTube Music API
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-xs text-white/75 font-light leading-relaxed pl-1">
                            <li>Built a complete music streaming application with song search, playback, queues, playlists, likes, listening history, and a persistent global player.</li>
                            <li>Implemented shuffle, repeat, previous/next, progress, volume controls, and persistent player state.</li>
                            <li>Added PWA support and Media Session API features for a better mobile and background playback experience.</li>
                          </ul>
                        </div>

                        {/* Project 2: Jarvis */}
                        <div className="space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                            <h4 className="text-xs font-bold text-white font-sans">
                              Jarvis — Personal AI Operating System
                            </h4>
                          </div>
                          <div className="text-[9px] font-mono text-cyan-400">
                            Python, FastAPI, SQLite, SQLAlchemy, LLM integrations
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-xs text-white/75 font-light leading-relaxed pl-1">
                            <li>Built a modular personal AI assistant with separate Brain, Planner, Memory, Intent Engine, and Tool Manager components.</li>
                            <li>Worked on AI provider routing, task execution, persistent settings, memory, and streaming responses.</li>
                            <li>Designed the backend as a foundation for a desktop assistant that can interact with applications and tools.</li>
                          </ul>
                        </div>

                        {/* Project 3: AirOS */}
                        <div className="space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                            <h4 className="text-xs font-bold text-white font-sans">
                              AirOS — Computer Vision Control System
                            </h4>
                          </div>
                          <div className="text-[9px] font-mono text-blue-400">
                            Python, Computer Vision
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-xs text-white/75 font-light leading-relaxed pl-1">
                            <li>Built a computer-vision-based prototype for interacting with and controlling computer actions through visual input.</li>
                            <li>Worked with real-time vision processing and visual interaction workflows.</li>
                          </ul>
                        </div>
                      </div>

                      {/* --- CERTIFICATIONS --- */}
                      <div className="space-y-2.5">
                        <div className="border-b border-white/10 pb-1 flex items-center justify-between">
                          <h3 className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                            CERTIFICATIONS
                          </h3>
                        </div>
                        <ul className="list-disc list-inside space-y-1.5 text-xs text-white/75 font-light leading-relaxed pl-1">
                          <li>
                            <span className="text-white font-medium">Oracle</span> — Agentic AI Foundations Associate | Passed | Aug 2026
                          </li>
                          <li>
                            <span className="text-white font-medium">FutureSkills Prime / IT-ITeS SSC NASSCOM</span> — Gen AI Tools | Gold | 98% | Aug 2026
                          </li>
                          <li>
                            <span className="text-white font-medium">Databricks</span> — Accredited Generative AI Fundamentals | Dec 2024
                          </li>
                          <li>
                            <span className="text-white font-medium">AWS Academy</span> — Cloud Developing, Cloud Architecting | 2026
                          </li>
                          <li>
                            <span className="text-white font-medium">AWS Academy</span> — Generative AI Foundations, Machine Learning Foundations | 2025–2026
                          </li>
                          <li>
                            <span className="text-white font-medium">AWS Academy</span> — Machine Learning for Natural Language Processing | 2026
                          </li>
                          <li>
                            <span className="text-white font-medium">AWS Academy</span> — Cloud Data Pipeline Builder, Microservices & CI/CD Pipeline Builder | 2026
                          </li>
                        </ul>
                      </div>

                      {/* --- ACHIEVEMENTS --- */}
                      <div className="space-y-2.5">
                        <div className="border-b border-white/10 pb-1 flex items-center justify-between">
                          <h3 className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                            ACHIEVEMENTS
                          </h3>
                        </div>
                        <ul className="list-disc list-inside space-y-1.5 text-xs text-white/75 font-light leading-relaxed pl-1">
                          <li>
                            <span className="text-white font-medium">3rd Prize</span> — Rekhi Hippiathon, Adamas University | Jan 2026
                          </li>
                          <li>
                            <span className="text-white font-medium">SIT ICOE Hackathon 2024</span> — Round 1; Team The Epsilon X secured Rank 89 | Apr 2024
                          </li>
                        </ul>
                      </div>

                      {/* --- LANGUAGES --- */}
                      <div className="space-y-2.5">
                        <div className="border-b border-white/10 pb-1 flex items-center justify-between">
                          <h3 className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                            LANGUAGES
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {["English", "Bengali", "Hindi"].map((lang) => (
                            <span key={lang} className="text-[9px] font-mono px-2.5 py-0.5 border border-white/10 rounded-md bg-white/[0.02] text-white/80">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
