// Espaço livre (áreas sem texto nem imagem) em uma grade grossa, e caminhos por ele. Usado pelo
// `CaseStudyVortex` para achar onde o vórtice para ao lado de cada seção e como chega até lá.

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface FreeGrid {
  cols: number;
  rows: number;
  cell: number;
  /** Distância (px) do centro de cada célula ao conteúdo ou à borda da viewport mais próximos. */
  clearance: Float32Array;
}

const DIAGONAL = Math.SQRT2;

/** Marca as células cobertas pelo conteúdo (com folga `pad`) e calcula a distância de cada uma até ele. */
export function buildFreeGrid(width: number, height: number, cell: number, boxes: Box[], pad: number): FreeGrid {
  const cols = Math.max(1, Math.ceil(width / cell));
  const rows = Math.max(1, Math.ceil(height / cell));
  const distance = new Float32Array(cols * rows).fill(Infinity);

  for (const box of boxes) {
    const c0 = Math.max(0, Math.floor((box.left - pad) / cell));
    const c1 = Math.min(cols - 1, Math.floor((box.right + pad) / cell));
    const r0 = Math.max(0, Math.floor((box.top - pad) / cell));
    const r1 = Math.min(rows - 1, Math.floor((box.bottom + pad) / cell));
    for (let r = r0; r <= r1; r++) distance.fill(0, r * cols + c0, r * cols + c1 + 1);
  }

  // Borda da viewport conta como obstáculo: o vórtice fica inteiro na tela.
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      distance[i] = Math.min(distance[i], c + 0.5, cols - c - 0.5, r + 0.5, rows - r - 0.5);
    }
  }

  // Transformada de distância em duas passadas (chanfro 1 / √2), em unidades de célula.
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      let d = distance[i];
      if (c > 0) d = Math.min(d, distance[i - 1] + 1);
      if (r > 0) {
        d = Math.min(d, distance[i - cols] + 1);
        if (c > 0) d = Math.min(d, distance[i - cols - 1] + DIAGONAL);
        if (c < cols - 1) d = Math.min(d, distance[i - cols + 1] + DIAGONAL);
      }
      distance[i] = d;
    }
  }
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = cols - 1; c >= 0; c--) {
      const i = r * cols + c;
      let d = distance[i];
      if (c < cols - 1) d = Math.min(d, distance[i + 1] + 1);
      if (r < rows - 1) {
        d = Math.min(d, distance[i + cols] + 1);
        if (c < cols - 1) d = Math.min(d, distance[i + cols + 1] + DIAGONAL);
        if (c > 0) d = Math.min(d, distance[i + cols - 1] + DIAGONAL);
      }
      distance[i] = d;
    }
  }

  for (let i = 0; i < distance.length; i++) distance[i] *= cell;
  return { cols, rows, cell, clearance: distance };
}

export function cellAt(grid: FreeGrid, point: Point): number {
  const c = Math.min(grid.cols - 1, Math.max(0, Math.floor(point.x / grid.cell)));
  const r = Math.min(grid.rows - 1, Math.max(0, Math.floor(point.y / grid.cell)));
  return r * grid.cols + c;
}

export function cellCenter(grid: FreeGrid, index: number): Point {
  return {
    x: ((index % grid.cols) + 0.5) * grid.cell,
    y: (Math.floor(index / grid.cols) + 0.5) * grid.cell,
  };
}

/** Célula de maior folga da viewport (posição de partida e último recurso quando não há corredor). */
export function roomiestCell(grid: FreeGrid): number {
  let best = 0;
  for (let i = 1; i < grid.clearance.length; i++) if (grid.clearance[i] > grid.clearance[best]) best = i;
  return best;
}

/**
 * Célula livre mais próxima de `point`: exige folga >= `corridor` e penaliza as apertadas (abaixo de
 * `roomy`), para preferir um lugar um pouco mais longe a um espremido contra o conteúdo.
 */
export function nearestOpenCell(grid: FreeGrid, point: Point, roomy: number, corridor: number): number {
  let best = -1;
  let bestScore = Infinity;
  for (let i = 0; i < grid.clearance.length; i++) {
    const room = grid.clearance[i];
    if (room < corridor) continue;
    const center = cellCenter(grid, i);
    const score = Math.hypot(center.x - point.x, center.y - point.y) + 2 * Math.max(0, roomy - room);
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best >= 0 ? best : roomiestCell(grid);
}

export interface Reach {
  /** Primeira célula do corredor; se o ponto de partida estiver sobre o conteúdo, é a saída mais próxima. */
  origin: number;
  parent: Int32Array;
  /** Passos desde `origin`; -1 para células fora de alcance. */
  steps: Int32Array;
  reached: number[];
}

const NEIGHBORS: [number, number][] = [
  [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1],
];

/** Busca em largura pelas células com folga >= `corridor` alcançáveis a partir de `start`. */
export function explore(grid: FreeGrid, start: number, corridor: number): Reach | null {
  const { cols, rows, clearance } = grid;
  const open = (i: number) => clearance[i] >= corridor;

  // Ponto de partida coberto pelo conteúdo (ele rolou por cima): sai pela célula livre mais próxima.
  let origin = start;
  if (!open(origin)) {
    const seen = new Uint8Array(cols * rows);
    const queue = [start];
    seen[start] = 1;
    origin = -1;
    for (let head = 0; head < queue.length && origin < 0; head++) {
      const i = queue[head];
      const c = i % cols;
      const r = (i - c) / cols;
      for (const [dc, dr] of NEIGHBORS) {
        const nc = c + dc;
        const nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
        const n = nr * cols + nc;
        if (seen[n]) continue;
        seen[n] = 1;
        if (open(n)) {
          origin = n;
          break;
        }
        queue.push(n);
      }
    }
    if (origin < 0) return null;
  }

  const parent = new Int32Array(cols * rows).fill(-1);
  const steps = new Int32Array(cols * rows).fill(-1);
  const reached = [origin];
  steps[origin] = 0;
  for (let head = 0; head < reached.length; head++) {
    const i = reached[head];
    const c = i % cols;
    const r = (i - c) / cols;
    for (const [dc, dr] of NEIGHBORS) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      const n = nr * cols + nc;
      if (steps[n] >= 0 || !open(n)) continue;
      // Diagonal só se as duas células ortogonais também estiverem livres (não corta quinas).
      if (dc !== 0 && dr !== 0 && (!open(r * cols + nc) || !open(nr * cols + c))) continue;
      steps[n] = steps[i] + 1;
      parent[n] = i;
      reached.push(n);
    }
  }
  return { origin, parent, steps, reached };
}

/** Caminho (centros de célula) de `reach.origin` até `target`. */
export function pathTo(grid: FreeGrid, reach: Reach, target: number): Point[] {
  const cells: number[] = [];
  for (let i = target; i >= 0; i = reach.parent[i]) {
    cells.push(i);
    if (i === reach.origin) break;
  }
  return cells.reverse().map((i) => cellCenter(grid, i));
}

/** Folga exata de um ponto: distância ao retângulo de conteúdo ou à borda da viewport mais próximos. */
export function clearanceAt(point: Point, boxes: Box[], width: number, height: number, pad: number): number {
  let best = Math.min(point.x, width - point.x, point.y, height - point.y);
  for (const box of boxes) {
    const dx = Math.max(box.left - pad - point.x, 0, point.x - box.right - pad);
    const dy = Math.max(box.top - pad - point.y, 0, point.y - box.bottom - pad);
    best = Math.min(best, Math.hypot(dx, dy));
  }
  return Math.max(0, best);
}
