import { create } from "zustand";

export type TransitionState = "IDLE" | "ZOOMING_IN" | "FOCUSED" | "ZOOMING_OUT";
export type ViewState = "HOME" | "PROJECT";
export type ActiveSection = "ABOUT" | "TIMELINE" | "CONTACT" | null;

interface GalaxyStore {
  selectedProjectId: string | null;
  hoveredProjectId: string | null;
  viewState: ViewState;
  transitionState: TransitionState;
  globalRotationSpeed: number;
  isMobile: boolean;
  prefersReducedMotion: boolean;
  activeSection: ActiveSection;

  // Actions
  selectProject: (id: string | null) => void;
  hoverProject: (id: string | null) => void;
  setTransitionState: (state: TransitionState) => void;
  setViewState: (view: ViewState) => void;
  setIsMobile: (isMobile: boolean) => void;
  setPrefersReducedMotion: (prefers: boolean) => void;
  setActiveSection: (section: ActiveSection) => void;
  reset: () => void;
}

export const useGalaxyStore = create<GalaxyStore>((set) => ({
  selectedProjectId: null,
  hoveredProjectId: null,
  viewState: "HOME",
  transitionState: "IDLE",
  globalRotationSpeed: 0.15,
  isMobile: false,
  prefersReducedMotion: false,
  activeSection: null,

  selectProject: (id) =>
    set(() => {
      if (id === null) {
        return {
          selectedProjectId: null,
          transitionState: "ZOOMING_OUT",
          globalRotationSpeed: 0.15,
        };
      } else {
        return {
          selectedProjectId: id,
          activeSection: null, // close modals when selecting a project
          transitionState: "ZOOMING_IN",
          globalRotationSpeed: 0.02,
        };
      }
    }),

  hoverProject: (id) =>
    set((state) => ({
      hoveredProjectId: id,
      globalRotationSpeed: id !== null ? 0.05 : state.selectedProjectId !== null ? 0.02 : 0.15,
    })),

  setTransitionState: (transitionState) =>
    set(() => {
      const newViewState: ViewState = 
        transitionState === "FOCUSED" || transitionState === "ZOOMING_IN"
          ? "PROJECT"
          : transitionState === "ZOOMING_OUT"
          ? "PROJECT"
          : "HOME";

      return {
        transitionState,
        viewState: newViewState,
      };
    }),

  setViewState: (viewState) => set({ viewState }),

  setIsMobile: (isMobile) => set({ isMobile }),

  setPrefersReducedMotion: (prefersReducedMotion) => set({ prefersReducedMotion }),

  setActiveSection: (activeSection) => 
    set((state) => ({ 
      activeSection,
      selectedProjectId: activeSection !== null ? null : state.selectedProjectId, // close project when opening modal
      transitionState: activeSection !== null ? "IDLE" : state.transitionState,
    })),

  reset: () =>
    set({
      selectedProjectId: null,
      hoveredProjectId: null,
      viewState: "HOME",
      transitionState: "IDLE",
      globalRotationSpeed: 0.15,
      prefersReducedMotion: false,
      activeSection: null,
    }),
}));
