"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSceneStore } from "@/store/sceneStore";
import {
  buildFreeGrid,
  cellAt,
  cellCenter,
  clearanceAt,
  explore,
  nearestOpenCell,
  pathTo,
  type Box,
  type Point,
} from "./freeSpace";

// Folga mínima entre o vórtice e o conteúdo, além do próprio raio da grade.
const PAD = 12;
// Remede o conteúdo de vez em quando: revelações por scroll e imagens mudam as caixas.
const REMEASURE_MS = 1000;
// Espera a transição do card para o estudo de caso antes de o vórtice surgir.
const APPEAR_DELAY_MS = 500;
const APPEAR_MS = 1400;
// O vórtice chega ao lado de um rótulo quando esse rótulo está nesta altura da tela (fração da viewport).
const READING_LINE = 0.45;
// Rótulos na mesma faixa (ex.: "Visão geral" e "Acesso", lado a lado no desktop) contam como um só.
const SAME_ROW = 48;
// Faixa da página (acima e abaixo do rótulo) onde se procura o lugar livre à direita dele.
const SPOT_BAND = 400;
// Diferença de pontuação abaixo da qual o lugar anterior é mantido (evita saltos a cada nova medida).
const SPOT_HYSTERESIS = 60;

interface Tuning {
  cell: number;
  /** Folga mínima (px) para o centro do vórtice passar ou parar. */
  corridor: number;
  /** Folga (px) a partir da qual um lugar deixa de ser considerado apertado. */
  roomy: number;
  /** Raio ao lado do título e na última sub-seção: o vórtice cresce conforme a leitura avança. */
  startRadius: number;
  endRadius: number;
  minRadius: number;
  /** Raio máximo = folga × `spread`: o centro fica no espaço livre, a borda pode passar por trás do conteúdo. */
  spread: number;
  /** Distância entre o fim do rótulo e a borda do vórtice. */
  gap: number;
}

// No mobile os espaços livres são estreitos e há menos partículas: corredores menores e raio
// proporcionalmente maior para o vórtice não sumir.
function tuning(width: number, height: number): Tuning {
  return width < 768
    ? { cell: 12, corridor: 16, roomy: 30, startRadius: 40, endRadius: Math.min(100, width * 0.27), minRadius: 32, spread: 1.8, gap: 16 }
    : { cell: 24, corridor: 35, roomy: 70, startRadius: 80, endRadius: Math.min(240, height * 0.24), minRadius: 40, spread: 1.8, gap: 40 };
}

/** Sub-seção do estudo de caso, em coordenadas da página. */
interface Anchor {
  /** Scroll em que o vórtice está exatamente ao lado deste rótulo. */
  key: number;
  /** Lugar livre à direita do rótulo. */
  spot: Point;
}

/** Trecho entre dois rótulos, pelos espaços livres da página, parametrizado pelo comprimento. */
interface Leg {
  points: Point[];
  lengths: number[];
}

const toPage = (rect: DOMRect, scrollY: number): Box => ({
  left: rect.left,
  right: rect.right,
  top: rect.top + scrollY,
  bottom: rect.bottom + scrollY,
});

// Caixas de texto (por linha) e de mídia: o que o vórtice deve contornar.
function contentBoxes(root: Element, range: Range, into: Box[], scrollY: number) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue;
    range.selectNodeContents(node);
    for (const rect of Array.from(range.getClientRects())) {
      if (rect.width >= 1 && rect.height >= 1) into.push(toPage(rect, scrollY));
    }
  }
  for (const media of Array.from(root.querySelectorAll("img, video, picture, svg, [role='img']"))) {
    const rect = media.getBoundingClientRect();
    if (rect.width * rect.height >= 400) into.push(toPage(rect, scrollY));
  }
}

// Primeira linha de texto de um elemento (o rótulo em si, não a largura do bloco). Mede o nó de texto:
// um Range sobre o elemento inteiro também devolveria as caixas dos filhos (ex.: o link do "próximo").
function firstLine(element: Element, range: Range): DOMRect | null {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue;
    range.selectNodeContents(node);
    const rect = Array.from(range.getClientRects()).find((r) => r.width >= 1 && r.height >= 1);
    if (rect) return rect;
  }
  return null;
}

// Grade de folga de uma faixa vertical da página.
function bandGrid(boxes: Box[], width: number, top: number, bottom: number, config: Tuning) {
  const local = boxes
    .filter((box) => box.bottom > top && box.top < bottom)
    .map((box) => ({ ...box, top: box.top - top, bottom: box.bottom - top }));
  return buildFreeGrid(width, bottom - top, config.cell, local, PAD);
}

/**
 * Lugar livre à direita do rótulo, de preferência na mesma altura dele, procurado numa faixa da página
 * ao redor. Lugares apertados contam como mais distantes. `previous` só é trocado por um bem melhor.
 */
function spotBeside(label: Box, boxes: Box[], width: number, config: Tuning, previous?: Point): Point {
  const bandTop = Math.max(0, label.top - SPOT_BAND);
  const grid = bandGrid(boxes, width, bandTop, label.bottom + SPOT_BAND, config);
  const desiredX = Math.min(width - config.gap, label.right + config.gap + config.startRadius);
  const middle = (label.top + label.bottom) / 2 - bandTop;
  const score = (point: Point, room: number) =>
    Math.abs(point.x - desiredX) * 0.5 + Math.abs(point.y - middle) * 1.5 + 2 * Math.max(0, config.roomy - room);

  let best = -1;
  let bestScore = Infinity;
  for (let i = 0; i < grid.clearance.length; i++) {
    const room = grid.clearance[i];
    const center = cellCenter(grid, i);
    if (room < config.corridor || center.x < label.right) continue;
    const value = score(center, room);
    if (value < bestScore) {
      bestScore = value;
      best = i;
    }
  }
  if (best < 0) best = nearestOpenCell(grid, { x: desiredX, y: middle }, config.roomy, config.corridor);

  if (previous) {
    const kept = { x: previous.x, y: previous.y - bandTop };
    const room = grid.clearance[cellAt(grid, kept)];
    if (room >= config.corridor && score(kept, room) <= bestScore + SPOT_HYSTERESIS) return previous;
  }
  const spot = cellCenter(grid, best);
  return { x: spot.x, y: spot.y + bandTop };
}

// Caminho de um lugar a outro pelos corredores livres da página; sem corredor (no mobile o texto ocupa a
// largura toda), segue em linha reta. Arredondado (Chaikin) para o vórtice não andar em degraus.
function legBetween(from: Point, to: Point, boxes: Box[], width: number, config: Tuning): Leg {
  const top = Math.max(0, Math.min(from.y, to.y) - SPOT_BAND / 2);
  const grid = bandGrid(boxes, width, top, Math.max(from.y, to.y) + SPOT_BAND / 2, config);
  const local = (point: Point) => ({ x: point.x, y: point.y - top });
  const reach = explore(grid, cellAt(grid, local(from)), config.corridor);
  const goal = cellAt(grid, local(to));
  const middle = reach && reach.steps[goal] >= 0 ? pathTo(grid, reach, goal).map((p) => ({ x: p.x, y: p.y + top })) : [];

  let points = [from, ...middle, to];
  for (let pass = 0; pass < 3 && points.length > 2; pass++) {
    const rounded: Point[] = [points[0]];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      rounded.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
      rounded.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
    }
    rounded.push(points[points.length - 1]);
    points = rounded;
  }

  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  }
  return { points, lengths };
}

function pointAlong(leg: Leg, t: number): Point {
  const total = leg.lengths[leg.lengths.length - 1];
  if (total <= 0) return leg.points[0];
  const distance = t * total;
  let i = 1;
  while (i < leg.lengths.length - 1 && leg.lengths[i] < distance) i += 1;
  const span = leg.lengths[i] - leg.lengths[i - 1] || 1;
  const k = (distance - leg.lengths[i - 1]) / span;
  const a = leg.points[i - 1];
  const b = leg.points[i];
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/**
 * Vórtice de partículas do estudo de caso (sem UI), ligado ao scroll: começa pequeno à direita do título
 * e, conforme a página desce, percorre os espaços livres até ficar à direita do rótulo da próxima
 * sub-seção, e assim por diante, crescendo a cada seção (e diminuindo ao voltar). Publica posição, raio
 * e força em `sceneStore.frame.vortex`; o motor de partículas só lê esses valores. Ao sair da página a
 * força volta a 0 e o vórtice some.
 */
export function CaseStudyVortex() {
  const pathname = usePathname();

  useEffect(() => {
    // Com movimento reduzido o fundo é estático: não há vórtice.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const vortex = useSceneStore.getState().frame.vortex;
    const range = document.createRange();
    let disposed = false;
    let pageBoxes: Box[] = [];
    let fixedBoxes: Box[] = [];
    let anchors: Anchor[] = [];
    let legs: Leg[] = [];

    const measure = () => {
      if (disposed) return;
      const scrollY = window.scrollY;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const config = tuning(width, height);
      const main = document.getElementById("main-content");
      const footer = document.querySelector("footer");

      const page: Box[] = [];
      if (main) contentBoxes(main, range, page, scrollY);
      if (footer) contentBoxes(footer, range, page, scrollY);
      pageBoxes = page;

      // Elementos fixos do shell: a barra do header e o menu flutuante do mobile.
      fixedBoxes = Array.from(document.querySelectorAll("header.fixed, nav.fixed")).map((el) => {
        const rect = el.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      });

      // Sub-seções: título, rótulos de seção e "próximo projeto", na ordem da página. Na mesma faixa,
      // vale o rótulo mais à esquerda (o topo pode diferir por frações de pixel).
      const labels = Array.from(main?.querySelectorAll("article h1, article h2, article nav") ?? [])
        .map((el) => firstLine(el, range))
        .filter((rect): rect is DOMRect => rect !== null)
        .map((rect) => toPage(rect, scrollY))
        .sort((a, b) => a.top - b.top);
      const rows: Box[] = [];
      for (const label of labels) {
        const row = rows[rows.length - 1];
        if (!row || label.top - row.top > SAME_ROW) rows.push(label);
        else if (label.left < row.left) rows[rows.length - 1] = label;
      }

      // Cada rótulo vira uma chave de scroll; rótulos que não chegam à linha de leitura (fim da página)
      // e colidem com o anterior ficam de fora.
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - height);
      const next: Anchor[] = [];
      rows.forEach((label) => {
        const key = Math.min(maxScroll, Math.max(0, label.top - height * READING_LINE));
        if (next.length && key <= next[next.length - 1].key + 1) return;
        const previous = anchors[next.length]?.spot;
        next.push({ key, spot: spotBeside(label, page, width, config, previous) });
      });
      anchors = next;
      legs = anchors.slice(1).map((anchor, i) => legBetween(anchors[i].spot, anchor.spot, page, width, config));
    };

    const visibleBoxes = (width: number, height: number, scrollY: number) => {
      const boxes = fixedBoxes.slice();
      for (const box of pageBoxes) {
        const top = box.top - scrollY;
        const bottom = box.bottom - scrollY;
        if (bottom < -PAD || top > height + PAD || box.right < -PAD || box.left > width + PAD) continue;
        boxes.push({ left: box.left, right: box.right, top, bottom });
      }
      return boxes;
    };

    measure();
    const observer = new ResizeObserver(measure);
    const main = document.getElementById("main-content");
    if (main) observer.observe(main);
    const remeasure = window.setInterval(measure, REMEASURE_MS);
    document.fonts.ready.then(measure);

    const start = performance.now();
    let last = start;
    let position: Point | null = null;
    let previousTarget: Point | null = null;
    let radius = 0;
    let frame = 0;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!anchors.length) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const scrollY = window.scrollY;
      const config = tuning(width, height);

      // Trecho atual (entre dois rótulos) e quanto dele o scroll já percorreu.
      let index = 0;
      while (index < anchors.length - 1 && scrollY >= anchors[index + 1].key) index += 1;
      const leg = legs[index];
      const span = anchors[index + 1] ? anchors[index + 1].key - anchors[index].key : 0;
      const t = leg && span > 0 ? clamp01((scrollY - anchors[index].key) / span) : 0;
      // A curva suave faz o vórtice "parar" um pouco ao lado de cada rótulo antes de seguir.
      const onPage = leg ? pointAlong(leg, smooth(t)) : anchors[index].spot;
      const target = { x: onPage.x, y: onPage.y - scrollY };
      const progress = anchors.length > 1 ? (index + t) / (anchors.length - 1) : 0;

      if (!position) {
        position = { ...target };
        radius = config.startRadius * 0.3;
      }
      // Acompanha o alvo quadro a quadro (sem atraso no scroll); a mola só absorve os pequenos saltos
      // quando o conteúdo é medido de novo.
      const shift = previousTarget ? { x: target.x - previousTarget.x, y: target.y - previousTarget.y } : { x: 0, y: 0 };
      previousTarget = target;
      const pull = 1 - Math.exp(-dt * 8);
      position.x += shift.x + (target.x - position.x) * pull;
      position.y += shift.y + (target.y - position.y) * pull;

      // Raio: cresce com a leitura (pequeno no título, maior nas seções seguintes) e na entrada;
      // encolhe onde o espaço livre é estreito.
      const appear = smooth(clamp01((now - start - APPEAR_DELAY_MS) / APPEAR_MS));
      const base = config.startRadius + (config.endRadius - config.startRadius) * smooth(progress);
      const room = clearanceAt(position, visibleBoxes(width, height, scrollY), width, height, PAD) * config.spread;
      const radiusTarget = Math.min(base, Math.max(config.minRadius, room)) * (0.3 + 0.7 * appear);
      radius += (radiusTarget - radius) * (1 - Math.exp(-dt * 2.5));

      vortex.x = position.x;
      vortex.y = position.y;
      vortex.radius = radius;
      vortex.strength = appear;
    };
    frame = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.clearInterval(remeasure);
      // O motor de partículas esvanece o vórtice a partir daqui.
      vortex.strength = 0;
    };
  }, [pathname]);

  return null;
}
