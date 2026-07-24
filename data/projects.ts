import { Project } from "@/types/project";

export const projectsData: Project[] = [
  {
    id: "musicflow",
    title: "MusicFlow",
    tagline: "YouTube Music search and streaming client",
    overview: "MusicFlow is a Next.js web application that integrates the YouTube Music API to allow users to search and stream tracks, manage custom playlists, and explore lyrics.",
    description: "Built with Next.js and Tailwind CSS, MusicFlow queries songs dynamically via the YouTube Music API. User accounts are managed with better-auth, stored in Supabase PostgreSQL via Prisma, and song queries are cached using Upstash Redis.",
    whyIBuiltIt: "I built MusicFlow to explore integrating third-party scraping APIs (like YouTube Music) with next-generation authorization libraries (better-auth) and relational databases (Supabase/Prisma) in a unified Next.js dashboard.",
    status: "Production Ready",
    duration: "3 Months",
    role: "Full-Stack Developer",
    platform: "Web Browser",
    features: [
      "Dynamic music search queries via YouTube Music API scraper index",
      "Custom playlist creation and database persistence",
      "User account registration and secure profiles via better-auth",
      "Fast autocomplete search recommendations cached in Upstash Redis",
      "Responsive player interface embedding YouTube Iframe streaming"
    ],
    architecture: [
      {
        title: "Ingestion & Playback",
        description: "Client requests song streams using YouTube Video Iframe integration."
      },
      {
        title: "User Data Schema",
        description: "Prisma client updates session tables on a Supabase PostgreSQL database."
      },
      {
        title: "Cache Layer",
        description: "Upstash Redis indexes queries to optimize repeat search response latency."
      }
    ],
    challenges: {
      problem: "Frequent scraping queries to YouTube API caused lookup latency and rate limits.",
      solution: "Cached search results in Upstash Redis, cutting response times to under 15ms and reducing API hits by 60%."
    },
    whatILearned: "I learned how to efficiently cache scraped JSON structures using Redis to stay within YouTube Music API rate limits, how to secure sessions with client-side middlewares using better-auth, and how to define structured data relationships in Prisma.",
    futureImprovements: "Plan to support custom lyrics syncing engines and offline caching modes via service workers.",
    techStack: ["Next.js", "React", "better-auth", "Prisma", "Supabase", "Meilisearch", "Upstash Redis", "Tailwind CSS", "Zustand"],
    githubUrl: "https://github.com/Rick2882004/musicflow",
    liveUrl: "https://musicflow-rose.vercel.app/",
    screenshots: [
      "/images/projects/musicflow/home.png",
      "/images/projects/musicflow/explore.png",
      "/images/projects/musicflow/search.png",
      "/images/projects/musicflow/library.png",
      "/images/projects/musicflow/liked.png"
    ],
    videoUrl: "/videos/musicflow.mp4",
    theme: {
      accentColor: "#a855f7", // Purple
      glowColor: "#220436",
      orbitRadius: 4.2,
      orbitSpeed: 0.28,
      orbitAngleOffset: 0,
      planetScale: 0.32,
      ambientIntensity: 0.6
    }
  },
  {
    id: "ridex",
    title: "RideX",
    tagline: "Real-time driver telemetry tracker & dashboard",
    overview: "RideX is a web-based dashboard that simulates and tracks mock driver coordinates in real-time on Leaflet and Mapbox maps.",
    description: "Designed as a client-server coordination app, RideX runs a Node/Express server driving Socket.io events to broadcast telemetry coordinates. The frontend uses react-leaflet and Mapbox GL to render active driver paths on interactive vector layers.",
    whyIBuiltIt: "I built RideX to understand WebSocket-driven client-server coordination. It streams real-time geolocation coordinate ticks between backend mock generators and front-end Leaflet map layers.",
    status: "Production Ready",
    duration: "2 Months",
    role: "Solo Developer",
    platform: "Web Browser",
    features: [
      "Real-time client-server communication using Socket.io web sockets",
      "Interactive maps rendering via Mapbox GL and Leaflet",
      "Driver path plotting utilizing Leaflet Routing Machine indicators",
      "Session auth tracking built with JWT tokens and bcrypt encryption",
      "Schema queries persisting fleet history logs in PostgreSQL via Prisma"
    ],
    architecture: [
      {
        title: "Express Backend & Sockets",
        description: "An Express server manages real-time event broadcasting and streams coordinate updates to connected sockets."
      },
      {
        title: "Map Rendering Engine",
        description: "Mapbox GL and Leaflet render mock driver paths and locations dynamically using react-leaflet."
      }
    ],
    challenges: {
      problem: "Re-rendering the full Leaflet map container on every coordinate tick packet caused severe UI jitter.",
      solution: "Separated map container state from driver coordinates, updating only individual marker position refs to bypass full map renders."
    },
    whatILearned: "I learned how to manage real-time bidirectionally connected users with Socket.io, how to manipulate marker references in Leaflet map containers to optimize render frames, and how to build local Node Express daemons to emit high-frequency telemetry mock streams.",
    futureImprovements: "Plan to implement actual historical route replay charts and cluster coordinates markers on zoomed-out states.",
    techStack: ["React", "Node.js", "Express", "Socket.io", "Leaflet", "Mapbox GL", "Prisma", "Tailwind CSS", "Zustand"],
    githubUrl: "https://github.com/Rick2882004/RideX",
    liveUrl: "https://ridex-coral.vercel.app/",
    screenshots: [
      "/images/projects/ridex/landing.png",
      "/images/projects/ridex/rider-dashboard.png",
      "/images/projects/ridex/driver-dashboard.png"
    ],
    videoUrl: "/videos/ridex.mp4",
    theme: {
      accentColor: "#f97316", // Orange
      glowColor: "#3a1a0b",
      orbitRadius: 6.2,
      orbitSpeed: 0.21,
      orbitAngleOffset: Math.PI / 2,
      planetScale: 0.38,
      ambientIntensity: 0.5
    }
  },
  {
    id: "jarvis",
    title: "Jarvis AI OS",
    tagline: "Local desktop automation assistant & chat streamer",
    overview: "Jarvis is an in-development desktop AI helper designed to scan local applications and execute system triggers through a conversational interface.",
    description: "Currently in active prototype development, Jarvis features a Python FastAPI backend and a Next.js frontend. The current version initiates SQLite schemas, runs an app discovery daemon to scan local apps, and provides a streaming chat completions endpoint.",
    whyIBuiltIt: "I started building Jarvis to explore how conversational LLM interfaces can interact with local systems. Currently, it exists as a backend prototype running startup app discovery scripts.",
    status: "In Development",
    duration: "Ongoing (Alpha prototype)",
    role: "Backend Engineer",
    platform: "Desktop / Localhost",
    features: [
      "Local desktop app discovery scanner running system background subprocesses",
      "Structured SQLite database schemas managing tasks and session parameters",
      "FastAPI server rendering conversational chat streams",
      "Basic UI prototype displaying chat response grids"
    ],
    architecture: [
      {
        title: "FastAPI Backend Core",
        description: "FastAPI server running a lifespan routine that initiates sqlite databases and starts task execution queues."
      },
      {
        title: "Discovery Service",
        description: "A Python system helper that queries installed applications on startup and registers them to databases."
      }
    ],
    challenges: {
      problem: "Background loops polling task state caused high localhost CPU spikes.",
      solution: "Implemented event-driven task state transitions using asyncio queues instead of standard while-true polling intervals."
    },
    whatILearned: "I learned how to structure background async loops inside FastAPI lifecycle runners, how to query system application paths across different OS environments, and how to stream LLM chat tokens using FastAPI NDJSON streaming responses.",
    futureImprovements: "Plan to build a cross-platform desktop wrapper using Electron to support global hotkeys and desktop alerts.",
    techStack: ["Python", "FastAPI", "SQLite", "Next.js", "Zustand", "Framer Motion", "Tailwind CSS"],
    githubUrl: "https://github.com/Rick2882004/jarvis_assistant",
    liveUrl: "",
    screenshots: [
      "/images/projects/jarvis-1.png"
    ],
    videoUrl: "/videos/jarvis.mp4",
    theme: {
      accentColor: "#06b6d4", // Cyan
      glowColor: "#041e2a",
      orbitRadius: 8.2,
      orbitSpeed: 0.15,
      orbitAngleOffset: Math.PI,
      planetScale: 0.44,
      ambientIntensity: 0.4
    }
  },
  {
    id: "ai-platform",
    title: "CareerPilot AI",
    tagline: "Streamlit-based resume parser & ATS scanner",
    overview: "CareerPilot AI is a Python tool that analyzes resumes, extracts professional skills, calculates ATS compatibility ratings, and suggests learning roadmaps.",
    description: "Designed as a Streamlit application, CareerPilot AI extracts text from uploaded PDF resumes. It runs skill extraction scripts, evaluates strengths and weaknesses to estimate an ATS score, and suggests missing skills and job matches.",
    whyIBuiltIt: "Built to help job seekers audit their resumes against typical ATS scanning engines and identify skill gaps for specific software engineering roles.",
    status: "Production Ready",
    duration: "1 Month (Alpha Prototype)",
    role: "Solo Developer",
    platform: "Web Application (Streamlit)",
    features: [
      "Resume text parsing from PDF uploads",
      "Skill keyword extraction and profiling",
      "Estimated ATS score mapping with strength and weakness metrics",
      "Missing skill gap analysis for specific tech roles",
      "Job matching estimates and monthly learning roadmaps"
    ],
    architecture: [
      {
        title: "Streamlit UI & File Ingestion",
        description: "User uploads PDF resume via Streamlit file uploader, extracting raw text."
      },
      {
        title: "Skill Matching Engine",
        description: "Compares text keywords against pre-defined skill matrices to identify career matches."
      }
    ],
    challenges: {
      problem: "PDF resume layouts with multiple columns caused text extraction script to parse lines out of order.",
      solution: "Switched parser libraries to a layout-aware PDF reader to reconstruct left-to-right reading order correctly."
    },
    whatILearned: "I learned how to write Streamlit dashboard structures to ingest files, how to parse tabular PDF data structures, and how to define keyword mapping patterns in pandas to identify missing skills.",
    futureImprovements: "Plan to utilize custom PDF layout-recognition scrapers to support multi-column resume formats more reliably.",
    techStack: ["Python", "Streamlit", "PDF Miner", "pandas", "Matplotlib"],
    githubUrl: "https://github.com/Rick2882004/CareerPilot-AI",
    liveUrl: "https://career-pilot-ai-pink-chi.vercel.app/",
    screenshots: [
      "/images/projects/careerpilot/dashboard.png"
    ],
    videoUrl: "/videos/ai-platform.mp4",
    theme: {
      accentColor: "#3b82f6", // Blue
      glowColor: "#051830",
      orbitRadius: 10.2,
      orbitSpeed: 0.09,
      orbitAngleOffset: (3 * Math.PI) / 2,
      planetScale: 0.40,
      ambientIntensity: 0.6
    }
  }
];
