import { create } from 'zustand';

/**
 * Abertura do site (Preloader, só na primeira carga): em "playing" a cortina cobre a tela,
 * em "revealing" ela está abrindo e em "done" o nome já foi entregue ao Hero.
 */
export type IntroPhase = 'playing' | 'revealing' | 'done';

interface UIState {
  introPhase: IntroPhase;
  isSceneReady: boolean;
  backgroundPaused: boolean;
  setIntroPhase: (phase: IntroPhase) => void;
  setSceneReady: () => void;
  setBackgroundPaused: (paused: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  introPhase: 'playing',
  isSceneReady: false,
  backgroundPaused: false,
  setIntroPhase: (introPhase) => set({ introPhase }),
  setSceneReady: () => set({ isSceneReady: true }),
  setBackgroundPaused: (backgroundPaused) => set({ backgroundPaused }),
}));
