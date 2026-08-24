import { create } from 'zustand';
// Forcing HMR cache bust for clearInteractivePosition

interface UIState {
  interactivePositions: { id: string; x: number; y: number }[];
  isPreloaderDone: boolean;
  setInteractivePosition: (id: string, x: number, y: number) => void;
  clearInteractivePosition: (id: string) => void;
  setPreloaderDone: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  interactivePositions: [],
  isPreloaderDone: false,
  setInteractivePosition: (id, x, y) =>
    set((state) => {
      const existing = state.interactivePositions.find((p) => p.id === id);
      if (existing && existing.x === x && existing.y === y) return state; // Evita re-renders desnecessários
      
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
}));
