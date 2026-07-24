"use client";

import { useEffect, useRef, useState } from "react";
import { useGalaxyStore } from "@/store/useGalaxyStore";
import { projectsData } from "@/data/projects";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const getGalleryLabel = (path: string, index: number): string => {
  const filename = path.split("/").pop()?.split(".")[0]?.toLowerCase() || "";
  const labelMap: Record<string, string> = {
    home: "HOME DASHBOARD",
    explore: "EXPLORE",
    search: "SEARCH",
    library: "LIBRARY",
    liked: "LIKED SONGS",
    playlists: "PLAYLISTS",
    recent: "RECENTLY PLAYED",
    queue: "QUEUE",
    profile: "PROFILE",
    settings: "SETTINGS",
    landing: "LANDING PAGE",
    "rider-dashboard": "RIDER DASHBOARD",
    "driver-dashboard": "DRIVER DASHBOARD",
    dashboard: "DASHBOARD"
  };
  if (labelMap[filename]) {
    return labelMap[filename];
  }
  return `SYSTEM INTERFACE ${index + 1}`;
};

export default function ProjectDetailPanel() {
  const selectedProjectId = useGalaxyStore((state) => state.selectedProjectId);
  const selectProject = useGalaxyStore((state) => state.selectProject);
  const prefersReducedMotion = useGalaxyStore((state) => state.prefersReducedMotion);
  const transitionState = useGalaxyStore((state) => state.transitionState);
  const isMobile = useGalaxyStore((state) => state.isMobile);

  const project = projectsData.find((p) => p.id === selectedProjectId);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeLightboxImage, setActiveLightboxImage] = useState<{ url: string; label: string } | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;

    const totalHeight = container.scrollHeight - container.clientHeight;
    if (totalHeight > 0) {
      setScrollProgress((scrollTop / totalHeight) * 100);
    }

    if (prefersReducedMotion) return;
    if (parallaxRef.current) {
      // Subtle parallax effect shifting the image background slow downward
      parallaxRef.current.style.transform = `translate3d(0, ${scrollTop * 0.38}px, 0)`;
    }
  };

  // Close lightbox or panel on Escape key down (A11y requirement)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeLightboxImage) {
          setActiveLightboxImage(null);
        } else {
          selectProject(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectProject, activeLightboxImage]);

  // Reset scroll container state on active project changes (only when opening a project)
  useEffect(() => {
    if (selectedProjectId && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      setScrollProgress(0);
    }
  }, [selectedProjectId]);

  const isVisible = selectedProjectId !== null && (transitionState === "FOCUSED" || transitionState === "IDLE");

  const handleClose = () => {
    selectProject(null);
  };

  // Status badge styling helper
  const getStatusBadge = (status: "Completed" | "In Development" | "Prototype" | "Production Ready") => {
    switch (status) {
      case "Production Ready":
      case "Completed":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[9px] font-mono text-emerald-400 font-semibold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{status === "Production Ready" ? "Production Ready" : "Completed"}</span>
          </span>
        );
      case "In Development":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-[9px] font-mono text-amber-400 font-semibold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>In Development</span>
          </span>
        );
      case "Prototype":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-[9px] font-mono text-blue-400 font-semibold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Prototype</span>
          </span>
        );
    }
  };

  // Stagger cascading animation configuration (Honoring prefersReducedMotion)
  // Delaying children stagger until drawer slide has completed to prevent visual rush
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        delayChildren: prefersReducedMotion ? 0 : 0.35,
      }
    }
  };

  const itemVariants = {
    hidden: { y: prefersReducedMotion ? 0 : 12, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring" as const, damping: 30, stiffness: 220 }
    }
  };

  return (
    <>
      <AnimatePresence>
      {project && (
        <motion.div
          key={project.id}
          initial={isMobile ? { y: "100%", opacity: 0 } : { x: "20%", opacity: 0 }}
          animate={{ x: "0%", y: "0%", opacity: 1 }}
          exit={isMobile ? { y: "100%", opacity: 0 } : { x: "20%", opacity: 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0.15 }
              : {
                  opacity: { duration: 0.35, ease: "easeOut" },
                  x: { type: "spring", damping: 30, stiffness: 160 },
                  y: { type: "spring", damping: 30, stiffness: 160 }
                }
          }
          className="absolute bottom-0 right-0 h-[52vh] sm:h-full sm:top-0 w-full sm:w-[380px] md:w-[36vw] lg:w-[34vw] xl:w-[32vw] max-w-[420px] min-w-[320px] z-20 flex flex-col glass-panel select-text border-t sm:border-t-0 sm:border-l border-white/10 rounded-t-2xl sm:rounded-none font-sans shadow-2xl overflow-hidden"
        >
          {/* Mobile bottom sheet drag indicator */}
          <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mt-2.5 mb-0.5 sm:hidden flex-shrink-0" />

          {/* Reading Progress Indicator */}
          <div className="absolute top-0 left-0 w-full h-[1.5px] bg-white/5 z-30 pointer-events-none">
            <div 
              style={{ width: `${scrollProgress}%` }}
              className="h-full bg-cyan-400 transition-all duration-75"
            />
          </div>

          {/* Scrollable specs sheet container */}
          <div 
            ref={scrollContainerRef} 
            onScroll={handleScroll} 
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, transparent, white 35px, white calc(100% - 35px), transparent)",
              maskImage: "linear-gradient(to bottom, transparent, white 35px, white calc(100% - 35px), transparent)"
            }}
            className="flex-1 overflow-y-auto scrollbar-thin scroll-smooth"
          >
            
            {/* 1. Hero Screenshot browser mockup */}
            <div className="relative w-full h-[210px] sm:h-[220px] bg-slate-950/60 border-b border-white/10 overflow-hidden flex-shrink-0">
              {project.screenshots && project.screenshots[0] ? (
                <div className="w-full h-full flex flex-col">
                  {/* Browser top-bar */}
                  <div className="w-full h-7 bg-black/60 border-b border-white/5 flex items-center px-4 justify-between select-none">
                    {/* Window Controls */}
                    <div className="flex items-center space-x-1.5 w-1/3">
                      <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                      <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                      <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
                    </div>
                    {/* Address Bar */}
                    <div className="flex items-center justify-center bg-white/[0.03] border border-white/5 rounded-md px-4 py-0.5 text-[8px] font-mono text-white/35 max-w-[200px] w-full text-center truncate">
                      {project.id}.local
                    </div>
                    {/* Spacer */}
                    <div className="w-1/3" />
                  </div>
                  {/* Screenshot image */}
                  <div 
                    onClick={() => setActiveLightboxImage({ url: project.screenshots[0], label: getGalleryLabel(project.screenshots[0], 0) })}
                    className="relative flex-1 bg-slate-900 overflow-hidden group cursor-pointer"
                  >
                    <Image
                      src={project.screenshots[0]}
                      alt={`${project.title} Interface Screenshot`}
                      width={1024}
                      height={581}
                      loading="lazy"
                      className="w-full h-full object-cover object-top select-none opacity-85 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/0 to-black/25 pointer-events-none" />
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 border border-white/10 text-[7.5px] font-mono text-white/60 group-hover:text-white pointer-events-none transition-colors">
                      🔍 CLICK TO EXPAND
                    </div>
                  </div>
                </div>
              ) : (
                /* Fallback Parallax Placeholder if no image */
                <div ref={parallaxRef} className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none w-full h-full">
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-[10%] left-[10%] w-[120px] h-[120px] rounded-full border border-dashed border-cyan-400 animate-[spin_50s_linear_infinite]" />
                    <div className="absolute bottom-[10%] right-[10%] w-[90px] h-[90px] rounded-full border border-dashed border-purple-400 animate-[spin_35s_linear_infinite_reverse]" />
                  </div>
                  <div className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center mb-3 text-white/35 text-base">
                    📷
                  </div>
                  <span className="text-[8.5px] tracking-[0.25em] text-white/45 font-bold uppercase">SYS // CAPTURE_STANDBY</span>
                  <p className="text-[8px] text-white/25 mt-2 max-w-[280px] leading-relaxed">
                    Project screenshots will be added after final UI capture.
                  </p>
                </div>
              )}

              {/* Close Button overlay */}
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Close project specifications"
                className="absolute top-[38px] right-4 w-8 h-8 rounded-full border border-white/10 bg-black/60 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/90 hover:border-white/20 transition-all duration-300 pointer-events-auto cursor-pointer shadow-md z-10"
              >
                ✕
              </motion.button>
            </div>

            {/* Content body wrapper with stagger container */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="px-6 py-6 md:px-8 space-y-9 pb-16"
            >
              
              {/* 2. Project Name & Status Badge */}
              <motion.div variants={itemVariants} className="flex items-center justify-between border-b border-white/5 pb-4">
                <h1 className="text-2xl font-bold tracking-wide text-white uppercase">
                  {project.title}
                </h1>
                {getStatusBadge(project.status)}
              </motion.div>

              {/* 3. One sentence description */}
              <motion.p variants={itemVariants} className="text-[13px] text-slate-300 leading-relaxed font-light max-w-[420px]">
                {project.overview}
              </motion.p>

              {/* 4. Why I Built It */}
              <motion.div variants={itemVariants} className="space-y-2.5">
                <h2 className="text-[9.5px] font-mono tracking-[0.25em] text-cyan-400/80 uppercase font-semibold">
                  WHY I BUILT IT
                </h2>
                <p className="text-[12.5px] text-slate-300/90 leading-relaxed font-light pl-4 border-l-2 border-cyan-500/20 max-w-[420px]">
                  {project.whyIBuiltIt}
                </p>
              </motion.div>

              {/* 5. Key Features */}
              <motion.div variants={itemVariants} className="space-y-3">
                <h2 className="text-[9.5px] font-mono tracking-[0.25em] text-cyan-400/80 uppercase font-semibold">
                  KEY FEATURES
                </h2>
                <ul className="space-y-3">
                  {project.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-3 text-[12.5px] text-slate-300/85 leading-relaxed font-light max-w-[420px]">
                      <span 
                        style={{ backgroundColor: project.theme.accentColor }} 
                        className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" 
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* 6. Tech Stack Badges */}
              <motion.div variants={itemVariants} className="space-y-3">
                <h2 className="text-[9.5px] font-mono tracking-[0.25em] text-cyan-400/80 uppercase font-semibold">
                  TECHNOLOGY BLUEPRINT
                </h2>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        borderColor: `${project.theme.accentColor}20`,
                        background: `${project.theme.accentColor}06`,
                        color: project.theme.accentColor,
                      }}
                      className="text-[9.5px] font-mono px-2.5 py-0.5 border rounded-full font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* 7. Architecture Block Diagram */}
              <motion.div variants={itemVariants} className="space-y-3">
                <h2 className="text-[9.5px] font-mono tracking-[0.25em] text-cyan-400/80 uppercase font-semibold">
                  SYSTEM ARCHITECTURE
                </h2>
                
                {/* Horizontal simplified logic diagram */}
                <div className="flex flex-col sm:flex-row items-stretch justify-between gap-3 bg-white/[0.01] border border-white/5 p-4 rounded-xl font-mono text-[9px] relative">
                  {project.architecture.map((step, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center text-center p-2.5 border border-white/5 rounded-lg bg-black/35 w-full">
                      <span 
                        style={{ color: project.theme.accentColor }} 
                        className="text-[7.5px] font-bold mb-1.5"
                      >
                        LAYER 0{idx + 1}
                      </span>
                      <span className="font-bold text-white uppercase text-[8.5px]">{step.title}</span>
                      <span className="text-white/45 mt-1 text-[7.5px] leading-normal font-light">
                        {step.description}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* 8. Challenges & Resolutions */}
              <motion.div variants={itemVariants} className="space-y-3">
                <h2 className="text-[9.5px] font-mono tracking-[0.25em] text-cyan-400/80 uppercase font-semibold">
                  ENGINEERING CHALLENGES
                </h2>
                <div className="grid grid-cols-1 gap-3 font-sans">
                  {/* Problem */}
                  <div className="p-3.5 bg-red-955/5 border border-red-500/10 rounded-xl">
                    <span className="text-[7.5px] font-mono text-red-400 font-bold uppercase tracking-wider block">
                      CRITICAL OBSTACLE
                    </span>
                    <p className="text-[11.5px] text-slate-300 leading-relaxed font-light mt-1">
                      {project.challenges.problem}
                    </p>
                  </div>

                  {/* Solution */}
                  <div className="p-3.5 bg-emerald-955/5 border border-emerald-500/10 rounded-xl">
                    <span className="text-[7.5px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                      ENGINEERED RESOLUTION
                    </span>
                    <p className="text-[11.5px] text-slate-300 leading-relaxed font-light mt-1">
                      {project.challenges.solution}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* 9. Lessons & Engineering Growth */}
              <motion.div variants={itemVariants} className="space-y-2.5">
                <h2 className="text-[9.5px] font-mono tracking-[0.25em] text-cyan-400/80 uppercase font-semibold">
                  LESSONS & ENGINEERING GROWTH
                </h2>
                <p className="text-[12.5px] text-slate-300/85 leading-relaxed font-light pl-4 border-l-2 border-cyan-500/20 max-w-[420px]">
                  {project.whatILearned}
                </p>
              </motion.div>

              {/* 10. Future Improvements (Optional) */}
              {project.futureImprovements && (
                <motion.div variants={itemVariants} className="space-y-2.5">
                  <h2 className="text-[9.5px] font-mono tracking-[0.25em] text-cyan-400/80 uppercase font-semibold">
                    FUTURE PIPELINE IMPROVEMENTS
                  </h2>
                  <p className="text-[12.5px] text-slate-300/85 leading-relaxed font-light pl-4 border-l-2 border-cyan-500/20 max-w-[420px]">
                    {project.futureImprovements}
                  </p>
                </motion.div>
              )}

              {/* 11. Gallery Screenshot Section */}
              <motion.div variants={itemVariants} className="space-y-3 pt-3">
                <h2 className="text-[9.5px] font-mono tracking-[0.25em] text-cyan-400/80 uppercase font-semibold">
                  SYSTEM GALLERY
                </h2>
                
                {project.screenshots && project.screenshots.length > 0 ? (
                  <div className="space-y-3">
                    {project.screenshots.map((src, idx) => {
                      const label = getGalleryLabel(src, idx);
                      return (
                        <div
                          key={src}
                          onClick={() => setActiveLightboxImage({ url: src, label })}
                          className="relative w-full h-[150px] sm:h-[160px] rounded-xl border border-white/10 bg-black/45 overflow-hidden group cursor-pointer"
                        >
                          <Image
                            src={src}
                            alt={`${project.title} ${label}`}
                            width={1024}
                            height={581}
                            loading="lazy"
                            className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-300 select-none"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end justify-between p-3 pointer-events-none">
                            <span className="text-[8px] font-mono tracking-[0.15em] text-white/80 font-bold uppercase">
                              FIG 0{idx + 1} // {label}
                            </span>
                            <span className="text-[7.5px] font-mono text-cyan-400/80 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded uppercase">
                              EXPAND ↗
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="w-full h-[130px] rounded-xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center p-6 text-center font-mono">
                    <div className="text-white/20 text-base mb-2">📷</div>
                    <span className="text-[8px] tracking-[0.12em] text-white/45 font-bold uppercase">
                      GALLERY STANDBY MODE
                    </span>
                    <p className="text-[7.5px] text-white/25 mt-1 leading-normal max-w-[260px]">
                      Project screenshots will be added after final UI capture.
                    </p>
                  </div>
                )}
              </motion.div>

              {/* 12. Action Buttons */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5 pointer-events-auto">
                {project.githubUrl ? (
                  <motion.a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View the source code for ${project.title} on GitHub`}
                    whileHover={{ 
                      scale: 1.01,
                      borderColor: "rgba(255,255,255,0.22)",
                      backgroundColor: "rgba(255,255,255,0.04)"
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center space-x-2 bg-white/5 text-white border border-white/10 px-4 py-2.5 rounded-xl text-[10px] font-mono tracking-widest uppercase transition-all duration-300 cursor-pointer"
                  >
                    <span>GITHUB REPO</span>
                  </motion.a>
                ) : (
                  <button
                    disabled
                    title="GitHub repository is not available yet."
                    className="flex items-center justify-center space-x-2 bg-white/5 text-white/30 border border-white/5 px-4 py-2.5 rounded-xl text-[10px] font-mono tracking-widest uppercase cursor-not-allowed select-none"
                  >
                    <span>GITHUB REPO</span>
                  </button>
                )}

                {project.liveUrl ? (
                  <motion.a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Visit the live stream page or website for ${project.title}`}
                    whileHover={{ 
                      scale: 1.01,
                      borderColor: "rgba(6,182,212,0.35)",
                      backgroundColor: "rgba(6,182,212,0.04)"
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center space-x-2 bg-cyan-500/5 text-cyan-400 border border-cyan-500/10 px-4 py-2.5 rounded-xl text-[10px] font-mono tracking-widest uppercase transition-all duration-300 cursor-pointer"
                  >
                    <span>LIVE SYSTEM</span>
                  </motion.a>
                ) : (
                  <button
                    disabled
                    title="Live demo will be available after the public release."
                    className="flex items-center justify-center space-x-2 bg-white/5 text-white/30 border border-white/5 px-4 py-2.5 rounded-xl text-[10px] font-mono tracking-widest uppercase cursor-not-allowed select-none"
                  >
                    <span>COMING SOON</span>
                  </button>
                )}
              </motion.div>

            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Full-resolution Screenshot Lightbox Modal */}
    <AnimatePresence>
      {activeLightboxImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 cursor-pointer select-none"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[92vw] max-h-[88vh] bg-slate-950 border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col cursor-default"
          >
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/80">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest text-white/90 uppercase font-bold">
                  {project?.title} // {activeLightboxImage.label}
                </span>
              </div>
              <button
                onClick={() => setActiveLightboxImage(null)}
                className="w-7 h-7 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Full Image */}
            <div className="relative overflow-auto flex-1 max-h-[80vh] flex items-center justify-center p-2 bg-black/40">
              <Image
                src={activeLightboxImage.url}
                alt={activeLightboxImage.label}
                width={1280}
                height={720}
                loading="lazy"
                className="w-full h-auto max-h-[76vh] object-contain rounded-lg"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
