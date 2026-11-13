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
/** Vórtice do estudo de caso (CaseStudyVortex), em pixels de viewport. */
interface VortexFrame {
  x: number;
  y: number;
  radius: number;
  /** 0 sem vórtice; o motor de partículas suaviza a entrada e a saída. */
  strength: number;
}

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
  vortex: VortexFrame;
}

/** Área livre na viewport (frações 0–1, origem no topo esquerdo) onde o modelo da seção Sobre deve caber. */
export interface ViewportSlot {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface SceneState {
  activeScene: SceneName;
  frame: SceneFrame;
  /** Desktop: espaço abaixo do painel fixo da stack (AboutSection); null usa o posicionamento padrão. */
  aboutSlot: ViewportSlot | null;
  setActiveScene: (scene: SceneName) => void;
  setAboutSlot: (slot: ViewportSlot | null) => void;
}

const sameSlot = (a: ViewportSlot | null, b: ViewportSlot | null) =>
  a === b || (!!a && !!b && a.left === b.left && a.top === b.top && a.right === b.right && a.bottom === b.bottom);

export const useSceneStore = create<SceneState>((set, get) => ({
  activeScene: 'hero',
  frame: {
    progress: 0,
    sequence: [0],
    velocity: 0,
    rope: { path: [], cumulative: [], fill: 0, milestones: [] },
    vortex: { x: 0, y: 0, radius: 0, strength: 0 },
  },
  aboutSlot: null,
  setActiveScene: (activeScene) => set({ activeScene }),
  // Só muda em resize: cada mudança regenera as formas, então valores iguais não disparam update.
  setAboutSlot: (aboutSlot) => {
    if (!sameSlot(get().aboutSlot, aboutSlot)) set({ aboutSlot });
  },
}));
