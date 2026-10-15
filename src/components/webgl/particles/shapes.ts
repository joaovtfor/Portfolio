// Formas-alvo do motor de partículas, uma por cena (ordem de SCENES em sceneStore).
// Geradas na CPU uma única vez por proporção de tela; cada partícula recebe (x, y, z, seed).

const CAMERA_Z = 5;
const HALF_FOV_TAN = Math.tan((45 / 2) * (Math.PI / 180));
const DUST_FRACTION = 0.12;

/** Opacidade e intensidade do fluxo por cena (menores nas seções de leitura). */
export const SHAPE_STYLE = {
  opacity: [0.45, 0.3, 0.6, 0.7, 0.35, 0.28],
  flow: [0.12, 0.1, 0.12, 0.18, 0.1, 0.08],
};

type Vec3 = [number, number, number];
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

// Hero: monolito delineado pelas arestas (proporção 1:4:9), atrás do nome, com preenchimento esparso.
const monolith: ShapeBuilder = (rand, frame, out) => {
  const zc = -3;
  const h = frame.halfH(zc) * 1.25;
  const w = Math.min(h * (4 / 9), frame.halfW(zc) * 0.9);
  const d = w * 0.22;
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const roll = rand();

  if (roll < 0.7) {
    // Arestas: escolhe um dos 12 segmentos do paralelepípedo.
    const edge = Math.floor(rand() * 12);
    const t = spread(rand, 1);
    const sx = edge & 1 ? 1 : -1;
    const sy = edge & 2 ? 1 : -1;
    const axis = Math.floor(edge / 4);
    if (axis === 0) set(out, t * hw, sy * hh, sx * hd);
    else if (axis === 1) set(out, sx * hw, t * hh, sy * hd);
    else set(out, sx * hw, sy * hh, t * hd);
    out[0] += spread(rand, 0.03);
    out[1] += spread(rand, 0.03);
  } else if (roll < 0.82) {
    // Face frontal.
    set(out, spread(rand, hw), spread(rand, hh), hd);
  } else {
    // "Vazamento" fluido ao redor do volume.
    set(out, spread(rand, hw * 1.25), spread(rand, hh * 1.05), spread(rand, hd * 3));
  }
  out[2] += zc;
};

// Sobre: esfera (núcleo) ao lado do texto.
const sphere: ShapeBuilder = (rand, frame, out) => {
  const zc = -2.5;
  const radius = frame.compact ? frame.halfW(zc) * 0.75 : frame.halfH(zc) * 0.5;
  const cx = frame.compact ? 0 : frame.halfW(zc) * 0.55;
  const cy = frame.compact ? frame.halfH(zc) * 0.3 : -frame.halfH(zc) * 0.08;
  const u = rand() * 2 - 1;
  const theta = rand() * Math.PI * 2;
  const shell = rand() < 0.8 ? 0.94 + rand() * 0.06 : Math.cbrt(rand()) * 0.9;
  const r = radius * shell;
  const s = Math.sqrt(1 - u * u);
  set(out, cx + r * s * Math.cos(theta), cy + r * u, zc + r * s * Math.sin(theta));
};

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

// Experiência: hélice dupla vertical envolvendo a linha do tempo (no desktop, entre título e lista).
const helix: ShapeBuilder = (rand, frame, out) => {
  const zc = -3;
  const cx = frame.compact ? frame.halfW(zc) * 0.7 : frame.halfW(zc) * 0.09;
  const height = frame.halfH(zc) * 2.4;
  const radius = frame.compact ? 0.35 : 0.32;
  const t = rand();
  const y = (t - 0.5) * height;
  if (rand() < 0.75) {
    const strand = rand() < 0.5 ? 0 : Math.PI;
    const angle = t * height * 2.2 + strand;
    set(out, cx + Math.cos(angle) * radius + spread(rand, 0.04), y, zc + Math.sin(angle) * radius + spread(rand, 0.04));
  } else {
    const angle = rand() * Math.PI * 2;
    const r = radius * Math.sqrt(rand());
    set(out, cx + Math.cos(angle) * r, y, zc + Math.sin(angle) * r);
  }
};

// Contato: glifo `>_` amostrado de um canvas 2D com a fonte mono do site.
function sampleGlyph(): [number, number][] {
  if (typeof document === "undefined") return [];
  const width = 400;
  const height = 200;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return [];

  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim() || "monospace";
  context.font = `700 180px ${family}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(">_", width / 2, height / 2);

  const { data } = context.getImageData(0, 0, width, height);
  const points: [number, number][] = [];
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      if (data[(y * width + x) * 4 + 3] > 128) points.push([x / width - 0.5, 0.5 - y / height]);
    }
  }
  return points;
}

function glyphBuilder(points: [number, number][]): ShapeBuilder {
  return (rand, frame, out) => {
    const zc = -1.5;
    const glyphHeight = frame.compact
      ? Math.min(frame.halfH(zc) * 0.4, frame.halfW(zc) * 0.9)
      : frame.halfH(zc) * 0.7;
    const cx = frame.compact ? 0 : frame.halfW(zc) * 0.74;
    const cy = frame.compact ? frame.halfH(zc) * 0.55 : 0;

    if (!points.length) {
      const angle = rand() * Math.PI * 2;
      set(out, cx + Math.cos(angle) * glyphHeight * 0.5, cy + Math.sin(angle) * glyphHeight * 0.5, zc);
      return;
    }

    // Halo esparso ao redor do glifo: evita saturar o brilho aditivo numa área pequena.
    if (rand() < 0.35) {
      set(out, cx + spread(rand, glyphHeight * 1.4), cy + spread(rand, glyphHeight * 0.9), zc + spread(rand, 1.2));
      return;
    }

    const [px, py] = points[Math.floor(rand() * points.length)];
    set(
      out,
      cx + px * glyphHeight * 2 + spread(rand, 0.015),
      cy + py * glyphHeight + spread(rand, 0.015),
      zc + spread(rand, 0.15)
    );
  };
}

export function generateShapes(side: number, aspect: number): Float32Array[] {
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

  const builders = [monolith, sphere, waveGrid, torusKnot, helix, glyphBuilder(sampleGlyph())];
  const out: Vec3 = [0, 0, 0];

  return builders.map((build) => {
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
}
