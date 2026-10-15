import { create } from 'zustand';

interface UIState {
  interactivePositions: { id: string; x: number; y: number }[];
  isPreloaderDone: boolean;
  isSceneReady: boolean;
  backgroundPaused: boolean;
  setInteractivePosition: (id: string, x: number, y: number) => void;
  clearInteractivePosition: (id: string) => void;
  setPreloaderDone: () => void;
  setSceneReady: () => void;
  setBackgroundPaused: (paused: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  interactivePositions: [],
  isPreloaderDone: false,
  isSceneReady: false,
  backgroundPaused: false,
  setInteractivePosition: (id, x, y) =>
    set((state) => {
      const existing = state.interactivePositions.find((p) => p.id === id);
      if (existing && existing.x === x && existing.y === y) return state;

      return {
        interactivePositions: [
          ...state.interactivePositions.filter((p) => p.id !== id),
          { id, x, y },
        ],
      };
    }),
  clearInteractivePosition: (id) =>
    set((state) => ({
      interactivePositions: state.interactivePositions.filter((p) => p.id !== id),
    })),
  setPreloaderDone: () => set({ isPreloaderDone: true }),
  setSceneReady: () => set({ isSceneReady: true }),
  setBackgroundPaused: (backgroundPaused) => set({ backgroundPaused }),
}));
