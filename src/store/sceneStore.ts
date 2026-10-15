import { create } from 'zustand';

// Ordem narrativa das formas do motor de partículas (ver ParticleEngineTask.spec.md).
export const SCENES = ['hero', 'about', 'work', 'lab', 'experience', 'contact'] as const;
export type SceneName = (typeof SCENES)[number];

export function toSceneIndex(name: string | undefined): number {
  const index = SCENES.findIndex((scene) => scene === name);
  return index < 0 ? 0 : index;
}

interface RopeMilestone {
  /** Posição em pixels de viewport. */
  x: number;
  y: number;
  /** Escala do anel (maior para experiências com métrica de destaque e no hover). */
  scale: number;
  /** A corda já alcançou este marco. */
  reached: boolean;
}

/** Corda da Experiência publicada pelo DOM (ExperienceTask.spec.md). */
interface RopeFrame {
  /** Vértices do caminho em pixels de viewport: [x0, y0, x1, y1, ...]. Vazio fora da seção. */
  path: number[];
  /** Comprimento acumulado normalizado (0–1) em cada vértice. */
  cumulative: number[];
  /** Preenchimento da corda (0–1 do comprimento). */
  fill: number;
  milestones: RopeMilestone[];
}

// Valores transitórios lidos a cada frame pelo WebGL: mutados in-place, sem disparar re-render.
interface SceneFrame {
  /** Posição contínua na sequência de `[data-scene]` da página (ex.: 1.4 = 40% entre o 2º e o 3º). */
  progress: number;
  /** Índice da forma de cada `[data-scene]`, na ordem do DOM. */
  sequence: number[];
  /** Velocidade do scroll normalizada (0..1). */
  velocity: number;
  rope: RopeFrame;
}

interface SceneState {
  activeScene: SceneName;
  frame: SceneFrame;
  setActiveScene: (scene: SceneName) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  activeScene: 'hero',
  frame: { progress: 0, sequence: [0], velocity: 0, rope: { path: [], cumulative: [], fill: 0, milestones: [] } },
  setActiveScene: (activeScene) => set({ activeScene }),
}));
