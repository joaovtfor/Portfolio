import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Modelos .glb amostrados como nuvens de pontos para as formas de partículas (ParticleEngineTask.spec.md).
// Aceita malhas (superfície + arestas vivas) e linhas (export em wireframe). Sem Draco/meshopt:
// o decoder exige WASM, bloqueado pela CSP.
const MODEL_URLS = {
  hero: "/models/react_logo_3d.glb",
  about: "/models/icosahedron_3d.glb",
  contact: "/models/terminal_prompt_3d.glb",
} as const;

const SURFACE_POINTS = 12000;
const EDGE_POINTS = 12000;
/** Ângulo mínimo entre faces para uma aresta de malha contar como contorno (arestas vivas). */
const EDGE_ANGLE = 25;

/** Pontos [x, y, z, ...] centrados na origem, com a maior meia-dimensão normalizada para 1. */
export interface ModelPoints {
  /** Vazio em modelos só de linhas. */
  surface: Float32Array;
  /** Linhas do modelo e arestas vivas das malhas. */
  edges: Float32Array;
  /** Meia-dimensão normalizada em cada eixo (≤ 1). */
  extent: [number, number, number];
}

export type ModelSet = Record<keyof typeof MODEL_URLS, ModelPoints>;

// `instanceof` falha quando o loader e o app resolvem cópias diferentes do three; as flags são o padrão do próprio three.
function isMesh(object: THREE.Object3D): object is THREE.Mesh {
  return "isMesh" in object && object.isMesh === true;
}

function isLineSegments(object: THREE.Object3D): object is THREE.LineSegments {
  return "isLineSegments" in object && object.isLineSegments === true;
}

/** Só a posição, sem índice e já no espaço do mundo (os outros atributos impediriam o merge). */
function worldPositions(object: THREE.Mesh | THREE.LineSegments) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", object.geometry.getAttribute("position"));
  geometry.setIndex(object.geometry.getIndex());
  return geometry.toNonIndexed().applyMatrix4(object.matrixWorld);
}

/** Sorteia pontos ao longo de segmentos (pares de vértices), proporcionalmente ao comprimento. */
function sampleSegments(segments: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, count: number, out: THREE.Vector3[]) {
  const segmentCount = Math.floor(segments.count / 2);
  const cumulative = new Float32Array(segmentCount);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  let total = 0;
  for (let s = 0; s < segmentCount; s++) {
    a.fromBufferAttribute(segments, s * 2);
    b.fromBufferAttribute(segments, s * 2 + 1);
    total += a.distanceTo(b);
    cumulative[s] = total;
  }
  for (let i = 0; total > 0 && i < count; i++) {
    const target = Math.random() * total;
    let low = 0;
    let high = segmentCount - 1;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (cumulative[mid] < target) low = mid + 1;
      else high = mid;
    }
    a.fromBufferAttribute(segments, low * 2);
    b.fromBufferAttribute(segments, low * 2 + 1);
    out.push(new THREE.Vector3().lerpVectors(a, b, Math.random()));
  }
}

async function loadModel(loader: GLTFLoader, url: string): Promise<ModelPoints> {
  const gltf = await loader.loadAsync(url);
  gltf.scene.updateMatrixWorld(true);
  const meshes: THREE.BufferGeometry[] = [];
  const lines: THREE.BufferGeometry[] = [];
  gltf.scene.traverse((object) => {
    if (isMesh(object)) meshes.push(worldPositions(object));
    else if (isLineSegments(object)) lines.push(worldPositions(object));
  });
  if (!meshes.length && !lines.length) throw new Error(`Modelo sem malha nem linhas: ${url}`);

  const surface: THREE.Vector3[] = [];
  const edges: THREE.Vector3[] = [];
  const mesh = meshes.length ? mergeGeometries(meshes) : null;
  if (mesh) {
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(mesh)).build();
    for (let i = 0; i < SURFACE_POINTS; i++) {
      const point = new THREE.Vector3();
      sampler.sample(point);
      surface.push(point);
    }
  }
  const segments = [...lines, ...(mesh ? [new THREE.EdgesGeometry(mesh, EDGE_ANGLE)] : [])];
  if (segments.length) sampleSegments(mergeGeometries(segments).getAttribute("position"), EDGE_POINTS, edges);

  // Normaliza: centro da caixa na origem, maior meia-dimensão = 1.
  const box = new THREE.Box3().setFromPoints([...surface, ...edges]);
  const center = box.getCenter(new THREE.Vector3());
  const half = box.getSize(new THREE.Vector3()).multiplyScalar(0.5);
  const scale = 1 / Math.max(half.x, half.y, half.z, 1e-6);
  const pack = (points: THREE.Vector3[]) =>
    Float32Array.from(points.flatMap((point) => point.sub(center).multiplyScalar(scale).toArray()));

  return { surface: pack(surface), edges: pack(edges), extent: [half.x * scale, half.y * scale, half.z * scale] };
}

let pending: Promise<ModelSet> | null = null;

/** Carrega e amostra os modelos uma única vez por sessão (o Lab remonta o campo de partículas). */
export function loadModels(): Promise<ModelSet> {
  pending ??= (async () => {
    const loader = new GLTFLoader();
    const [hero, about, contact] = await Promise.all([
      loadModel(loader, MODEL_URLS.hero),
      loadModel(loader, MODEL_URLS.about),
      loadModel(loader, MODEL_URLS.contact),
    ]);
    return { hero, about, contact };
  })();
  pending.catch(() => {
    pending = null;
  });
  return pending;
}
