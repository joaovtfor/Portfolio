"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { GPUComputationRenderer, type Variable } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { EXPERIENCE_SHAPE, generateShapes, MAX_MILESTONES, SHAPE_STYLE } from "./particles/shapes";
import {
  positionShader,
  renderFragmentShader,
  renderVertexShader,
  velocityShader,
} from "./particles/particleShaders";
import { readThemeColor } from "./theme";
import { SCENES, useSceneStore } from "@/store/sceneStore";
import { useUIStore } from "@/store/uiStore";

interface ParticleFieldProps {
  isMobile: boolean;
  /** "scroll": forma guiada pelas seções da página; "click": cada clique avança para a próxima forma (Lab). */
  driver?: "scroll" | "click";
}

interface Simulation {
  gpu: GPUComputationRenderer;
  position: Variable;
  velocity: Variable;
}

const SHAPE_COUNT = SCENES.length;
const MAX_ROPE_VERTICES = 12;
// Profundidade da corda e meia-altura visível nessa profundidade (câmera em z=5, fov 45°).
const ROPE_DEPTH = -3;
const ROPE_HALF_HEIGHT = (5 - ROPE_DEPTH) * Math.tan(Math.PI / 8);

interface RenderUniforms {
  [uniform: string]: THREE.IUniform;
  uPositions: THREE.IUniform<THREE.Texture>;
  uVelocities: THREE.IUniform<THREE.Texture>;
  uSize: THREE.IUniform<number>;
  uPixelRatio: THREE.IUniform<number>;
  uColor: THREE.IUniform<THREE.Color>;
  uHot: THREE.IUniform<THREE.Color>;
  uOpacity: THREE.IUniform<number>;
}

function createDataTexture(data: Float32Array, side: number) {
  const texture = new THREE.DataTexture(data, side, side, THREE.RGBAFormat, THREE.FloatType);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
}

function createSimulation(gl: THREE.WebGLRenderer, side: number, initial: Float32Array): Simulation | null {
  const gpu = new GPUComputationRenderer(side, side, gl);
  if (!gl.extensions.has("EXT_color_buffer_float")) gpu.setDataType(THREE.HalfFloatType);

  const position0 = gpu.createTexture();
  const positionData = position0.image.data;
  if (positionData instanceof Float32Array) positionData.set(initial);
  const velocity0 = gpu.createTexture();

  const position = gpu.addVariable("texturePosition", positionShader, position0);
  const velocity = gpu.addVariable("textureVelocity", velocityShader, velocity0);
  gpu.setVariableDependencies(position, [position, velocity]);
  gpu.setVariableDependencies(velocity, [position, velocity]);

  position.material.uniforms.uDelta = { value: 0 };
  Object.assign(velocity.material.uniforms, {
    uTime: { value: 0 },
    uDelta: { value: 0 },
    uShapeA: { value: null },
    uShapeB: { value: null },
    uMorph: { value: 0 },
    uFlow: { value: SHAPE_STYLE.flow[0] },
    uScrollVelocity: { value: 0 },
    uPointer: { value: new THREE.Vector2(10, 10) },
    uPointerStrength: { value: 0 },
    uPointerVelocity: { value: new THREE.Vector2() },
    uAttractor: { value: new THREE.Vector3() },
    uViewProjection: { value: new THREE.Matrix4() },
    uAspect: { value: 1 },
    uRopeParams: { value: null },
    uRopeA: { value: 0 },
    uRopeB: { value: 0 },
    uRopePath: { value: Array.from({ length: MAX_ROPE_VERTICES }, () => new THREE.Vector2()) },
    uRopeCum: { value: new Array<number>(MAX_ROPE_VERTICES).fill(0) },
    uRopeCount: { value: 0 },
    uRopeFill: { value: 0 },
    uMilestones: { value: Array.from({ length: MAX_MILESTONES }, () => new THREE.Vector4()) },
    uRopeDepth: { value: ROPE_DEPTH },
    uRopeHalf: { value: new THREE.Vector2(ROPE_HALF_HEIGHT, ROPE_HALF_HEIGHT) },
  });

  const error = gpu.init();
  if (error !== null) {
    console.warn("[ParticleField] GPGPU indisponível:", error);
    gpu.dispose();
    return null;
  }
  return { gpu, position, velocity };
}

export function ParticleField({ isMobile, driver = "scroll" }: ParticleFieldProps) {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const shouldReduceMotion = useReducedMotion();

  const side = isMobile ? 128 : 256;
  const count = side * side;
  // Formas regeneradas apenas quando a proporção muda de forma perceptível.
  const aspect = Math.round((size.width / Math.max(size.height, 1)) * 10) / 10;

  const generated = useMemo(() => {
    const { shapes, ropeParams } = generateShapes(side, aspect);
    return {
      shapeTextures: shapes.map((data) => createDataTexture(data, side)),
      ropeTexture: createDataTexture(ropeParams, side),
    };
  }, [side, aspect]);
  const { shapeTextures, ropeTexture } = generated;
  useEffect(
    () => () => {
      generated.shapeTextures.forEach((texture) => texture.dispose());
      generated.ropeTexture.dispose();
    },
    [generated]
  );

  // Objetos mutados a cada frame vivem em refs (o loop do R3F roda fora do ciclo de render do React).
  const simulationRef = useRef<Simulation | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    const initial = shapeTextures[0].image.data;
    const simulation = initial instanceof Float32Array ? createSimulation(gl, side, initial) : null;
    simulationRef.current = simulation;
    return () => {
      simulation?.gpu.dispose();
      simulationRef.current = null;
    };
    // A simulação depende só da resolução; trocas de forma apenas atualizam uniforms.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, side]);

  const references = useMemo(() => {
    const data = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      data[i * 2] = ((i % side) + 0.5) / side;
      data[i * 2 + 1] = (Math.floor(i / side) + 0.5) / side;
    }
    return data;
  }, [count, side]);
  const placeholderPositions = useMemo(() => new Float32Array(count * 3), [count]);
  const zeroVelocity = useMemo(() => createDataTexture(new Float32Array(count * 4), side), [count, side]);
  useEffect(() => () => zeroVelocity.dispose(), [zeroVelocity]);

  const uniforms = useMemo<RenderUniforms>(
    () => ({
      uPositions: { value: shapeTextures[0] },
      uVelocities: { value: zeroVelocity },
      uSize: { value: isMobile ? 14 : 17 },
      uPixelRatio: { value: 1 },
      uColor: { value: readThemeColor("--foreground") },
      uHot: { value: readThemeColor("--ink") },
      uOpacity: { value: SHAPE_STYLE.opacity[0] },
    }),
    // Uniforms criados uma vez; texturas são trocadas a cada frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const progress = useRef(0);
  const ropeFill = useRef(0);
  const clickTarget = useRef(0);
  const pointer = useRef({ lastMove: -Infinity, strength: 0, touching: false, previous: new THREE.Vector2(), velocity: new THREE.Vector2() });

  // Força do ponteiro: ativa após movimento recente (mouse) ou enquanto há toque.
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.lastMove = performance.now();
      pointer.current.touching = event.pointerType !== "mouse" && event.buttons > 0;
    };
    const onUp = () => {
      pointer.current.touching = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  // Com reduced motion o canvas renderiza sob demanda: redesenha quando a seção ativa muda.
  useEffect(() => useSceneStore.subscribe(() => invalidate()), [invalidate]);

  // Modo Lab: clique avança para a próxima forma.
  useEffect(() => {
    if (driver !== "click") return;
    const onClick = () => {
      clickTarget.current = Math.floor(clickTarget.current) + 1;
      invalidate();
    };
    gl.domElement.addEventListener("click", onClick);
    return () => gl.domElement.removeEventListener("click", onClick);
  }, [driver, gl, invalidate]);

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const renderUniforms = material.uniforms;
    const simulation = simulationRef.current;
    const dt = Math.min(delta, 1 / 30);
    const { frame } = useSceneStore.getState();

    // Progresso narrativo suavizado; `sequence` mapeia cada passo para uma forma.
    const targetProgress = driver === "click" ? clickTarget.current : frame.progress;
    const sequence = driver === "click" ? null : frame.sequence;
    progress.current += (targetProgress - progress.current) * (1 - Math.exp(-dt * 7));
    if (shouldReduceMotion) progress.current = targetProgress;

    const step = Math.max(0, progress.current);
    const index = Math.floor(step);
    const morph = step - index;
    const shapeAt = (i: number) =>
      sequence ? sequence[Math.min(i, sequence.length - 1)] ?? 0 : ((i % SHAPE_COUNT) + SHAPE_COUNT) % SHAPE_COUNT;
    const from = shapeAt(index);
    const to = shapeAt(index + 1);

    renderUniforms.uPixelRatio.value = state.viewport.dpr;
    renderUniforms.uOpacity.value = THREE.MathUtils.lerp(SHAPE_STYLE.opacity[from], SHAPE_STYLE.opacity[to], morph);

    // Sem simulação (reduced motion ou GPGPU indisponível): exibe a forma estática.
    if (!simulation || shouldReduceMotion) {
      renderUniforms.uPositions.value = shapeTextures[morph < 0.5 ? from : to];
      renderUniforms.uVelocities.value = zeroVelocity;
      return;
    }

    // Força do cursor proporcional à sua velocidade (NDC/s, corrigida pelo aspect ratio):
    // ataque rápido (~40 ms) e soltura suave (~250 ms); parado, só um resíduo sutil.
    const current = pointer.current;
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const instantX = ((state.pointer.x - current.previous.x) / dt) * aspect;
    const instantY = (state.pointer.y - current.previous.y) / dt;
    current.previous.copy(state.pointer);
    current.velocity.lerp({ x: instantX, y: instantY }, 1 - Math.exp(-dt * 12));
    const speed = current.velocity.length();
    const recentlyMoved = performance.now() - current.lastMove < 1500;
    const targetStrength = current.touching ? 1 : recentlyMoved ? Math.min(0.15 + speed * 0.45, 1.5) : 0;
    const rate = targetStrength > current.strength ? 25 : 4;
    current.strength += (targetStrength - current.strength) * (1 - Math.exp(-dt * rate));

    const attractor = useUIStore.getState().interactivePositions[0];

    const velocityUniforms = simulation.velocity.material.uniforms;
    velocityUniforms.uTime.value = state.clock.elapsedTime;
    velocityUniforms.uDelta.value = dt;
    velocityUniforms.uShapeA.value = shapeTextures[from];
    velocityUniforms.uShapeB.value = shapeTextures[to];
    velocityUniforms.uMorph.value = morph;
    velocityUniforms.uFlow.value = THREE.MathUtils.lerp(SHAPE_STYLE.flow[from], SHAPE_STYLE.flow[to], morph);
    velocityUniforms.uScrollVelocity.value += (frame.velocity - velocityUniforms.uScrollVelocity.value) * (1 - Math.exp(-dt * 6));
    velocityUniforms.uPointer.value.copy(state.pointer);
    velocityUniforms.uPointerStrength.value = current.strength;
    velocityUniforms.uPointerVelocity.value.copy(current.velocity).clampLength(0, 3);
    velocityUniforms.uAspect.value = state.size.width / Math.max(state.size.height, 1);
    velocityUniforms.uViewProjection.value.multiplyMatrices(state.camera.projectionMatrix, state.camera.matrixWorldInverse);

    const attractorUniform = velocityUniforms.uAttractor.value;
    const attractorTarget = attractor ? 1 : 0;
    if (attractor) {
      attractorUniform.x = (attractor.x / state.size.width) * 2 - 1;
      attractorUniform.y = -(attractor.y / state.size.height) * 2 + 1;
    }
    attractorUniform.z += (attractorTarget - attractorUniform.z) * (1 - Math.exp(-dt * 5));

    // Corda da Experiência: caminho e marcos medidos no DOM (pixels) convertidos para NDC.
    const rope = frame.rope;
    const width = state.size.width;
    const height = Math.max(state.size.height, 1);
    const vertexCount = Math.min(Math.floor(rope.path.length / 2), MAX_ROPE_VERTICES);
    const ropePath: THREE.Vector2[] = velocityUniforms.uRopePath.value;
    const ropeCum: number[] = velocityUniforms.uRopeCum.value;
    for (let i = 0; i < vertexCount; i++) {
      ropePath[i].set((rope.path[i * 2] / width) * 2 - 1, 1 - (rope.path[i * 2 + 1] / height) * 2);
      ropeCum[i] = rope.cumulative[i] ?? 1;
    }
    ropeFill.current += (rope.fill - ropeFill.current) * (1 - Math.exp(-dt * 10));
    velocityUniforms.uRopeCount.value = vertexCount;
    velocityUniforms.uRopeFill.value = ropeFill.current;
    velocityUniforms.uRopeHalf.value.set(ROPE_HALF_HEIGHT * aspect, ROPE_HALF_HEIGHT);
    velocityUniforms.uRopeParams.value = ropeTexture;
    velocityUniforms.uRopeA.value = from === EXPERIENCE_SHAPE ? 1 : 0;
    velocityUniforms.uRopeB.value = to === EXPERIENCE_SHAPE ? 1 : 0;

    const milestones: THREE.Vector4[] = velocityUniforms.uMilestones.value;
    milestones.forEach((uniform, k) => {
      const milestone = rope.milestones[k];
      if (milestone) {
        uniform.x = (milestone.x / width) * 2 - 1;
        uniform.y = 1 - (milestone.y / height) * 2;
        uniform.z += (milestone.scale - uniform.z) * (1 - Math.exp(-dt * 8));
      }
      const active = milestone?.reached ? 1 : 0;
      uniform.w += (active - uniform.w) * (1 - Math.exp(-dt * 4));
    });

    simulation.position.material.uniforms.uDelta.value = dt;
    simulation.gpu.compute();

    renderUniforms.uPositions.value = simulation.gpu.getCurrentRenderTarget(simulation.position).texture;
    renderUniforms.uVelocities.value = simulation.gpu.getCurrentRenderTarget(simulation.velocity).texture;
  });

  return (
    <points frustumCulled={false} renderOrder={1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[placeholderPositions, 3]} />
        <bufferAttribute attach="attributes-aReference" args={[references, 2]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={renderVertexShader}
        fragmentShader={renderFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
