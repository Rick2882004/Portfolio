export interface ProjectTheme {
  accentColor: string;       // Primary color hex (e.g., #06b6d4)
  glowColor: string;         // Glow tint hex (e.g., #0b1a30)
  orbitRadius: number;       // Distance from the core
  orbitSpeed: number;        // Multiplier for speed of orbit
  orbitAngleOffset: number;  // Initial angle (radians) to distribute them around the core
  planetScale: number;       // Size scale of the planet sphere
  ambientIntensity: number;  // Ambient light reflection
}

export interface ArchitectureStep {
  title: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  overview: string;
  description: string;
  features: string[];
  architecture: ArchitectureStep[];
  challenges: {
    problem: string;
    solution: string;
  };
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  screenshots: string[];
  videoUrl?: string;
  whyIBuiltIt: string;
  status: "Completed" | "In Development" | "Prototype" | "Production Ready";
  duration: string;
  role: string;
  platform: string;
  whatILearned: string;
  futureImprovements?: string;
  theme: ProjectTheme;
}
