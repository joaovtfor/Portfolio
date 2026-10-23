// Formas-alvo do motor de partículas, uma por cena (ordem de SCENES em sceneStore).
// Geradas na CPU uma única vez por proporção de tela; cada partícula recebe (x, y, z, seed).
// Hero, Sobre e Contato vêm de modelos .glb amostrados (models.ts); as demais são procedurais.

import type { ModelPoints, ModelSet } from "./models";

const CAMERA_Z = 5;
const HALF_FOV_TAN = Math.tan((45 / 2) * (Math.PI / 180));
const DUST_FRACTION = 0.12;

/** Opacidade e intensidade do fluxo por cena (menores nas seções de leitura). */
export const SHAPE_STYLE = {
  opacity: [0.45, 0.3, 0.6, 0.7, 0.55, 0.28],
  flow: [0.12, 0.1, 0.12, 0.18, 0.1, 0.08],
};

type Vec3 = [number, number, number];
type Vec4 = [number, number, number, number];
type Random = () => number;

interface Frame {
  halfH: (z: number) => number;
  halfW: (z: number) => number;
  compact: boolean;
}

type ShapeBuilder = (rand: Random, frame: Frame, out: Vec3) => void;

function mulberry32(seed: number): Random {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const spread = (rand: Random, amount: number) => (rand() - 0.5) * 2 * amount;

function set(out: Vec3, x: number, y: number, z: number) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
}

/** Onde um modelo .glb é posicionado: centro e caixa (largura × altura) em que ele deve caber. */
interface Placement {
  center: Vec3;
  width: number;
  height: number;
}

// Hero: logo do React atrás do nome.
function heroPlacement(frame: Frame): Placement {
  const zc = -3;
  return frame.compact
    ? { center: [0, 0, zc], width: frame.halfW(zc) * 1.6, height: frame.halfH(zc) * 0.9 }
    : { center: [0, 0, zc], width: frame.halfW(zc) * 1.1, height: frame.halfH(zc) * 1.1 };
}

// Sobre: icosaedro compacto. No desktop fica no espaço livre abaixo do painel fixo da stack
// (coluna direita, que ocupa ~56% da altura a partir do header — ver AboutSection).
function aboutPlacement(frame: Frame): Placement {
  const zc = -2.5;
  if (frame.compact) {
    const size = frame.halfW(zc) * 1.4;
    return { center: [0, frame.halfH(zc) * 0.3, zc], width: size, height: size };
  }
  const size = frame.halfH(zc) * 0.46;
  return { center: [frame.halfW(zc) * 0.62, -frame.halfH(zc) * 0.66, zc], width: size, height: size };
}

// Contato: terminal à direita do formulário (acima dele no mobile), sem passar da borda da tela.
function contactPlacement(frame: Frame): Placement {
  const zc = -1.5;
  if (frame.compact) {
    return { center: [0, frame.halfH(zc) * 0.55, zc], width: frame.halfW(zc) * 1.5, height: frame.halfH(zc) * 0.45 };
  }
  // Folga para a rotação de "olhar": o lado que gira para a câmera cresce em perspectiva.
  const cx = frame.halfW(zc) * 0.62;
  return { center: [cx, 0, zc], width: Math.min(frame.halfH(zc) * 1.3, (frame.halfW(zc) - cx) * 1.5), height: frame.halfH(zc) * 0.85 };
}

/** Escala que faz o modelo (normalizado em [-1, 1]) caber na caixa do posicionamento. */
function fitScale(model: ModelPoints, placement: Placement) {
  return Math.min(placement.width / (2 * model.extent[0]), placement.height / (2 * model.extent[1]));
}

// Partículas no contorno (arestas vivas) e na superfície do modelo; sem halo, para não criar uma
// área de densidade visível ao redor (a poeira já cobre a tela). Sem o modelo (ainda carregando),
// uma nuvem solta no mesmo lugar.
function modelBuilder(model: ModelPoints | null, place: (frame: Frame) => Placement): ShapeBuilder {
  return (rand, frame, out) => {
    const placement = place(frame);
    const [cx, cy, cz] = placement.center;

    if (!model) {
      const radius = Math.min(placement.width, placement.height) * 0.5 * Math.cbrt(rand());
      const u = rand() * 2 - 1;
      const theta = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      set(out, cx + radius * s * Math.cos(theta), cy + radius * u, cz + radius * s * Math.sin(theta));
      return;
    }

    const scale = fitScale(model, placement);
    const roll = rand();
    const useEdges = model.edges.length > 0 && (roll < 0.5 || model.surface.length === 0);
    const points = useEdges ? model.edges : model.surface;
    const i = Math.floor(rand() * (points.length / 3)) * 3;
    set(
      out,
      cx + points[i] * scale + spread(rand, 0.01),
      cy + points[i + 1] * scale + spread(rand, 0.01),
      cz + points[i + 2] * scale + spread(rand, 0.01)
    );
  };
}

// Trabalhos: grade ondulada ao fundo, atrás do trilho de cards.
const waveGrid: ShapeBuilder = (rand, frame, out) => {
  const zc = -4;
  const spacing = 0.35;
  const halfX = frame.halfW(zc) * 1.05;
  const halfY = frame.halfH(zc) * 0.85;
  let x = spread(rand, halfX);
  let y = spread(rand, halfY);
  if (rand() < 0.5) x = Math.round(x / spacing) * spacing;
  else y = Math.round(y / spacing) * spacing;
  const z = zc + Math.sin(x * 0.6 + y * 0.3) * 0.5 + Math.cos(y * 0.8) * 0.25;
  set(out, x, y, z);
};

// Lab: torus knot (2, 3), acima dos cards de experimento.
const torusKnot: ShapeBuilder = (rand, frame, out) => {
  const zc = -2.5;
  const scale = frame.compact ? 0.32 : 0.5;
  const cy = frame.compact ? frame.halfH(zc) * 0.35 : frame.halfH(zc) * 0.22;
  const t = rand() * Math.PI * 2;
  const r = Math.cos(3 * t) + 2;
  const tube = 0.18 * Math.cbrt(rand());
  const a = rand() * Math.PI * 2;
  const b = Math.acos(rand() * 2 - 1);
  set(
    out,
    (r * Math.cos(2 * t)) * scale + tube * Math.sin(b) * Math.cos(a),
    cy + (r * Math.sin(2 * t)) * scale + tube * Math.sin(b) * Math.sin(a),
    zc - Math.sin(3 * t) * scale + tube * Math.cos(b)
  );
};

// Experiência: posições de "espera" das partículas da corda e dos anéis. A corda em si é dinâmica
// (segue a timeline do DOM) e é calculada no shader a partir de ROPE_PARAMS (ver ExperienceTask.spec.md).
const ropeWaiting: ShapeBuilder = (rand, frame, out) => {
  const z = -4 + spread(rand, 1.5);
  const cx = frame.compact ? 0 : frame.halfW(z) * 0.09;
  const halfWidth = frame.compact ? frame.halfW(z) * 1.05 : frame.halfW(z) * 0.35;
  set(out, cx + spread(rand, halfWidth), spread(rand, frame.halfH(z) * 1.1), z);
};

/** Índice da forma da Experiência em SCENES. */
export const EXPERIENCE_SHAPE = 4;
/** Máximo de marcos (anéis) suportados pelo shader. */
export const MAX_MILESTONES = 6;
/** Tipos de partícula na textura de parâmetros da corda (canal R). */
export const ROPE_KIND = { waiting: 0, rope: 1, ring: 2 } as const;

export interface GeneratedShapes {
  shapes: Float32Array[];
  /** Por partícula: (tipo, t na corda ou ângulo no anel, índice do anel, jitter). */
  ropeParams: Float32Array;
  /**
   * Por forma: centro (xyz) e raio de influência (w) do modelo que "olha" para o cursor;
   * null nas formas procedurais.
   */
  anchors: (Vec4 | null)[];
}

export function generateShapes(side: number, aspect: number, models: ModelSet | null): GeneratedShapes {
  const count = side * side;
  const rand = mulberry32(1337);
  const frame: Frame = {
    halfH: (z) => (CAMERA_Z - z) * HALF_FOV_TAN,
    halfW: (z) => (CAMERA_Z - z) * HALF_FOV_TAN * aspect,
    compact: aspect < 1,
  };

  // Poeira compartilhada por todas as formas: dá continuidade visual durante o morph.
  const seeds = new Float32Array(count);
  const dust = new Float32Array(count * 3);
  const isDust = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    seeds[i] = rand();
    isDust[i] = rand() < DUST_FRACTION ? 1 : 0;
    const z = -8 + rand() * 9;
    dust[i * 3] = spread(rand, frame.halfW(z) * 1.15);
    dust[i * 3 + 1] = spread(rand, frame.halfH(z) * 1.15);
    dust[i * 3 + 2] = z;
  }

  const [hero, about, contact] = [models?.hero ?? null, models?.about ?? null, models?.contact ?? null];
  const builders = [
    modelBuilder(hero, heroPlacement),
    modelBuilder(about, aboutPlacement),
    waveGrid,
    torusKnot,
    ropeWaiting,
    modelBuilder(contact, contactPlacement),
  ];
  const out: Vec3 = [0, 0, 0];

  const anchorFor = (model: ModelPoints | null, place: (frame: Frame) => Placement): Vec4 | null => {
    if (!model) return null;
    const placement = place(frame);
    const radius = Math.hypot(...model.extent) * fitScale(model, placement);
    return [...placement.center, radius];
  };
  const anchors = [anchorFor(hero, heroPlacement), anchorFor(about, aboutPlacement), null, null, null, anchorFor(contact, contactPlacement)];

  // 55% das partículas (não-poeira) formam a corda, 20% os anéis e o restante fica em espera.
  const ropeParams = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const roll = rand();
    const kind = isDust[i] ? ROPE_KIND.waiting : roll < 0.55 ? ROPE_KIND.rope : roll < 0.75 ? ROPE_KIND.ring : ROPE_KIND.waiting;
    ropeParams[i * 4] = kind;
    ropeParams[i * 4 + 1] = rand();
    ropeParams[i * 4 + 2] = Math.floor(rand() * MAX_MILESTONES);
    ropeParams[i * 4 + 3] = rand();
  }

  const shapes = builders.map((build) => {
    const data = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      if (isDust[i]) {
        set(out, dust[i * 3], dust[i * 3 + 1], dust[i * 3 + 2]);
      } else {
        build(rand, frame, out);
      }
      data[i * 4] = out[0];
      data[i * 4 + 1] = out[1];
      data[i * 4 + 2] = out[2];
      data[i * 4 + 3] = seeds[i];
    }
    return data;
  });

  return { shapes, ropeParams, anchors };
}
