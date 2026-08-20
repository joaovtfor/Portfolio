import { create } from 'zustand';

interface UIState {
  interactivePositions: { id: string; x: number; y: number }[];
  setInteractivePosition: (id: string, x: number, y: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  interactivePositions: [],
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
}));
