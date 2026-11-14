"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { SIMPLEX_2D } from "./shaders/noise";
import { readThemeColor } from "./theme";

const quadVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Passo 1 (baixa resolução): campo de fluido com domain warping + lente do ponteiro.
const fieldFragment = /* glsl */ `
uniform float uTime;
uniform vec2 uPointer;
uniform float uAspect;
varying vec2 vUv;

${SIMPLEX_2D}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    value += amplitude * snoise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  vec2 pointer = uPointer * 0.5 * vec2(uAspect, 1.0);
  float t = uTime * 0.035;

  vec2 q = vec2(fbm(p * 1.3 + t), fbm(p * 1.3 - t + 3.7));
  vec2 r = vec2(
    fbm(p * 1.6 + q * 1.5 + vec2(1.7, 9.2) + t * 0.6),
    fbm(p * 1.6 + q * 1.5 + vec2(8.3, 2.8) - t * 0.4)
  );

  float lens = 1.0 - smoothstep(0.0, 0.6, length(p - pointer));
  float field = fbm(p * 1.1 + r * 1.3 + (p - pointer) * lens * 0.6);
  gl_FragColor = vec4(field, lens, 0.0, 1.0);
}
`;

/** Variações do fundo (o Lab "Background Studio" compara todas). A ordem define o VARIANT do shader. */
export const BACKGROUND_VARIANTS = [
  "fluid",
  "dots",
  "topographic",
  "aurora",
  "terminal",
  "ascii",
  "grid",
  "oscilloscope",
  "rain",
  "void",
] as const;
export type BackgroundVariant = (typeof BACKGROUND_VARIANTS)[number];

/** Fundo usado no site (e variação inicial do Background Studio). */
export const SITE_BACKGROUND: BackgroundVariant = "terminal";

/** Variações que leem o campo de fluido; as demais pulam o passo de baixa resolução. */
const FIELD_VARIANTS: readonly BackgroundVariant[] = ["fluid", "dots", "terminal", "ascii"];

// Passo 2 (resolução cheia): cada variação lê o campo de baixa resolução (r = fluido, g = lente do
// ponteiro) e emite o token foreground sobre o background. A variação é escolhida em tempo de compilação.
const displayFragment = /* glsl */ `
uniform sampler2D uField;
uniform vec2 uTexel;
uniform vec3 uColor;
uniform vec3 uBase;
uniform float uTime;
uniform vec2 uPointer;
uniform float uAspect;
uniform float uPixelRatio;
uniform vec2 uResolution;
varying vec2 vUv;

#if VARIANT == 2
${SIMPLEX_2D}
#endif

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// Retângulo [lo, hi] em coordenadas locais da célula (0–1, y para cima).
float box(vec2 p, vec2 lo, vec2 hi) {
  return step(lo.x, p.x) * step(p.x, hi.x) * step(lo.y, p.y) * step(p.y, hi.y);
}

#if VARIANT == 5
// Rampa de caracteres desenhada com retângulos: (vazio) . : - + #
float glyphMask(int glyph, vec2 p) {
  if (glyph == 1) return box(p, vec2(0.4, 0.15), vec2(0.6, 0.27));
  if (glyph == 2) return box(p, vec2(0.4, 0.15), vec2(0.6, 0.27)) + box(p, vec2(0.4, 0.6), vec2(0.6, 0.72));
  if (glyph == 3) return box(p, vec2(0.2, 0.45), vec2(0.8, 0.55));
  if (glyph == 4) return max(box(p, vec2(0.2, 0.45), vec2(0.8, 0.55)), box(p, vec2(0.45, 0.2), vec2(0.55, 0.8)));
  if (glyph >= 5) {
    float horizontal = max(box(p, vec2(0.15, 0.33), vec2(0.85, 0.41)), box(p, vec2(0.15, 0.59), vec2(0.85, 0.67)));
    float vertical = max(box(p, vec2(0.3, 0.15), vec2(0.38, 0.85)), box(p, vec2(0.62, 0.15), vec2(0.7, 0.85)));
    return max(horizontal, vertical);
  }
  return 0.0;
}
#endif

void main() {
  vec3 color = uBase;
  vec2 pointer = uPointer * 0.5 * vec2(uAspect, 1.0);
  float vignetteStrength = 0.55;
  float grainAmount = 1.0;

#if VARIANT == 0
  // Fluido: corpo escuro com bordas emitindo o foreground.
  vec4 fieldSample = texture2D(uField, vUv);
  float fx = texture2D(uField, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uField, vUv - vec2(uTexel.x, 0.0)).r;
  float fy = texture2D(uField, vUv + vec2(0.0, uTexel.y)).r - texture2D(uField, vUv - vec2(0.0, uTexel.y)).r;
  float rim = smoothstep(0.02, 0.12, length(vec2(fx, fy)));
  float body = smoothstep(-0.35, 0.75, fieldSample.r);
  color += uColor * (body * 0.05 + fieldSample.g * 0.05 + rim * body * 0.08);

#elif VARIANT == 1
  // Matriz de pontos: grade fixa em pixels; o raio e o brilho de cada ponto seguem o campo
  // (amostrado no centro da célula) e uma ondulação que parte do ponteiro.
  float cell = 14.0 * uPixelRatio;
  vec2 cellId = floor(gl_FragCoord.xy / cell);
  vec2 local = gl_FragCoord.xy - (cellId + 0.5) * cell;
  vec2 cellUv = (cellId + 0.5) * cell / uResolution;
  vec4 fieldSample = texture2D(uField, cellUv);
  float distanceToPointer = length((cellUv - 0.5) * vec2(uAspect, 1.0) - pointer);
  float ripple = (0.5 + 0.5 * sin(distanceToPointer * 38.0 - uTime * 3.0)) * (1.0 - smoothstep(0.0, 0.4, distanceToPointer));
  float intensity = clamp(smoothstep(-0.2, 0.8, fieldSample.r) * 0.6 + ripple * 0.55, 0.0, 1.0);
  float radius = cell * mix(0.07, 0.2, intensity);
  float dotMask = 1.0 - smoothstep(radius - uPixelRatio, radius + uPixelRatio, length(local));
  color += uColor * dotMask * mix(0.14, 0.6, intensity);

#elif VARIANT == 2
  // Topográfico: curvas de nível de um relevo próprio e suave (o fluido com domain warping gera
  // curvas caóticas), com uma curva mestra a cada quatro e uma "colina" sob o ponteiro.
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float t = uTime * 0.03;
  vec2 toPointer = p - pointer;
  float hill = exp(-dot(toPointer, toPointer) / 0.04);
  float height = snoise(p * 0.9 + vec2(t, -t * 0.6)) * 0.65 + snoise(p * 2.1 - vec2(t * 0.8, t)) * 0.2 + hill * 0.5;
  float level = height * 9.0;
  float minor = 1.0 - smoothstep(0.0, fwidth(level) * 1.2, abs(fract(level + 0.5) - 0.5));
  float majorLevel = level * 0.25;
  float major = 1.0 - smoothstep(0.0, fwidth(majorLevel) * 1.6, abs(fract(majorLevel + 0.5) - 0.5));
  color += uColor * (minor * 0.06 + major * 0.11 + max(minor, major) * hill * 0.18);

#elif VARIANT == 3
  // Aurora: poucas manchas gaussianas grandes e lentas (não usa o campo de fluido).
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float t = uTime * 0.05;
  float glow = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 center = vec2(sin(t * (1.0 + fi * 0.37) + fi * 2.1) * 0.6 * uAspect, cos(t * (0.8 + fi * 0.29) + fi * 1.3) * 0.45);
    float radius = 0.5 + 0.12 * sin(t * 1.7 + fi);
    vec2 offset = p - center;
    glow += exp(-dot(offset, offset) / (radius * radius)) * (0.55 + 0.45 * sin(t * 2.0 + fi * 1.9));
  }
  vec2 toPointer = p - pointer;
  glow += exp(-dot(toPointer, toPointer) / 0.08) * 0.5;
  color += uColor * glow * 0.13;
  vignetteStrength = 0.45;

#elif VARIANT == 4
  // Terminal (CRT): fluido bem apagado sob linhas de varredura, faixa de refresh lenta e grão animado.
  vec4 fieldSample = texture2D(uField, vUv);
  float body = smoothstep(-0.35, 0.75, fieldSample.r);
  float scan = 0.5 + 0.5 * sin(gl_FragCoord.y / uPixelRatio * 1.5708);
  float bandDistance = vUv.y - (1.0 - fract(uTime * 0.06));
  float band = exp(-bandDistance * bandDistance / 0.004);
  color += uColor * (body * 0.035 + fieldSample.g * 0.03 + band * 0.03) * mix(0.55, 1.0, scan);
  vignetteStrength = 0.35;
  grainAmount = 3.0;

#elif VARIANT == 5
  // ASCII: o campo vira uma grade de caracteres; a densidade do glifo segue o fluido e a lente do ponteiro.
  vec2 cellSize = vec2(9.0, 15.0) * uPixelRatio;
  vec2 cellId = floor(gl_FragCoord.xy / cellSize);
  vec2 cellUv = (cellId + 0.5) * cellSize / uResolution;
  vec4 fieldSample = texture2D(uField, cellUv);
  float level = clamp(smoothstep(-0.3, 0.8, fieldSample.r) * 0.75 + fieldSample.g * 0.6, 0.0, 0.999);
  float mask = glyphMask(int(level * 6.0), fract(gl_FragCoord.xy / cellSize));
  color += uColor * mask * mix(0.08, 0.4, level);

#elif VARIANT == 6
  // Grade (blueprint): linhas finas a cada 32px e mestras a cada 160px; acendem perto do ponteiro
  // e um pulso lento atravessa as mestras a partir do centro.
  vec2 px = gl_FragCoord.xy / uPixelRatio;
  vec2 minorDistance = abs(fract(px / 32.0 + 0.5) - 0.5) * 32.0;
  vec2 majorDistance = abs(fract(px / 160.0 + 0.5) - 0.5) * 160.0;
  float minor = 1.0 - smoothstep(0.0, 1.0, min(minorDistance.x, minorDistance.y));
  float major = 1.0 - smoothstep(0.0, 1.2, min(majorDistance.x, majorDistance.y));
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  vec2 toPointer = p - pointer;
  float near = exp(-dot(toPointer, toPointer) / 0.03);
  float pulse = 0.5 + 0.5 * sin(uTime * 0.6 - length(p) * 6.0);
  color += uColor * (minor * (0.03 + near * 0.12) + major * (0.06 + near * 0.15 + pulse * 0.025));

#elif VARIANT == 7
  // Osciloscópio: traços horizontais com ondas lentas; perto do ponteiro a amplitude cresce.
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float glow = 0.0;
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    float baseY = (fi - 3.0) * 0.13;
    float dx = p.x - pointer.x;
    float dy = baseY - pointer.y;
    float amplitude = 0.012 + exp(-dx * dx / 0.08 - dy * dy / 0.05) * 0.06;
    float y = baseY
      + sin(p.x * (6.0 + fi * 1.3) + uTime * (0.6 + fi * 0.15) + fi) * amplitude
      + sin(p.x * 23.0 - uTime * 1.7 + fi * 2.0) * amplitude * 0.25;
    // Distância ao traço em px CSS: 1 unidade de p.y = altura da viewport.
    float distancePx = abs(p.y - y) * uResolution.y / uPixelRatio;
    glow += exp(-distancePx * distancePx / 1.5) * 0.6 + exp(-distancePx / 10.0) * 0.08;
  }
  color += uColor * glow * 0.18;

#elif VARIANT == 8
  // Chuva: algumas colunas de blocos ("caracteres") caem devagar, com rastro que apaga para cima.
  vec2 cellSize = vec2(14.0, 18.0) * uPixelRatio;
  vec2 cellId = floor(gl_FragCoord.xy / cellSize);
  vec2 local = fract(gl_FragCoord.xy / cellSize);
  float columnOn = step(0.45, hash(vec2(cellId.x, 3.3)));
  float speed = 0.04 + hash(vec2(cellId.x, 1.7)) * 0.08;
  float rows = uResolution.y / cellSize.y;
  float head = (1.0 - fract(uTime * speed + hash(vec2(cellId.x, 9.1)))) * (rows + 20.0) - 10.0;
  float behind = cellId.y - head;
  float trail = behind >= 0.0 ? exp(-behind * 0.18) : 0.0;
  float headGlow = step(0.0, behind) * step(behind, 1.0);
  float glyphOn = step(0.35, hash(cellId + floor(uTime * 2.0)));
  float block = box(local, vec2(0.2, 0.15), vec2(0.8, 0.85));
  color += uColor * block * columnOn * (trail * glyphOn * 0.12 + headGlow * 0.25);

#else
  // Vazio: só o background com grão e vinheta; as partículas carregam a cena.
  grainAmount = 2.0;
#endif

  float vignette = smoothstep(1.25, 0.25, length((vUv - 0.5) * vec2(1.0, 1.2)) * 1.4);
  color *= mix(vignetteStrength, 1.0, vignette);
  color += (hash(gl_FragCoord.xy + fract(uTime) * 61.0 * step(1.5, grainAmount)) - 0.5) * grainAmount / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

interface FieldPass {
  scene: THREE.Scene;
  material: THREE.ShaderMaterial;
  camera: THREE.Camera;
}

interface BackgroundMeshProps {
  quality: "high" | "low";
  variant?: BackgroundVariant;
}

export function BackgroundMesh({ quality, variant = SITE_BACKGROUND }: BackgroundMeshProps) {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const shouldReduceMotion = useReducedMotion();
  const resolutionScale = quality === "high" ? 0.25 : 0.2;

  const target = useMemo(
    () =>
      new THREE.WebGLRenderTarget(1, 1, {
        type: THREE.HalfFloatType,
        depthBuffer: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      }),
    []
  );

  useEffect(() => {
    target.setSize(
      Math.max(1, Math.round(size.width * resolutionScale)),
      Math.max(1, Math.round(size.height * resolutionScale))
    );
  }, [size, resolutionScale, target]);

  // Passo de baixa resolução criado imperativamente e guardado em ref (mutado a cada frame).
  const fieldRef = useRef<FieldPass | null>(null);
  const displayRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    const material = new THREE.ShaderMaterial({
      defines: { OCTAVES: quality === "high" ? 4 : 3 },
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2() },
        uAspect: { value: 1 },
      },
      vertexShader: quadVertex,
      fragmentShader: fieldFragment,
      depthTest: false,
      depthWrite: false,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(geometry, material));
    fieldRef.current = { scene, material, camera: new THREE.Camera() };

    return () => {
      material.dispose();
      geometry.dispose();
      fieldRef.current = null;
    };
  }, [quality]);
  useEffect(() => () => target.dispose(), [target]);

  const displayUniforms = useMemo(
    () => ({
      uField: { value: target.texture },
      uTexel: { value: new THREE.Vector2() },
      uColor: { value: readThemeColor("--foreground") },
      uBase: { value: readThemeColor("--background") },
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uAspect: { value: 1 },
      uPixelRatio: { value: 1 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    [target]
  );
  const defines = useMemo(() => ({ VARIANT: BACKGROUND_VARIANTS.indexOf(variant) }), [variant]);
  const needsField = FIELD_VARIANTS.includes(variant);

  // Ponteiro suavizado; em telas de toque usa o giroscópio quando disponível (Android).
  const pointer = useRef(new THREE.Vector2());
  const gyro = useRef<THREE.Vector2 | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      gyro.current ??= new THREE.Vector2();
      gyro.current.set(
        THREE.MathUtils.clamp(event.gamma / 30, -1, 1),
        -THREE.MathUtils.clamp((event.beta - 45) / 30, -1, 1)
      );
    };
    window.addEventListener("deviceorientation", onOrientation);
    return () => window.removeEventListener("deviceorientation", onOrientation);
  }, []);

  useFrame((state, delta) => {
    const field = fieldRef.current;
    const display = displayRef.current;
    if (!field || !display) return;

    const uniforms = field.material.uniforms;
    const time = shouldReduceMotion ? 0 : state.clock.elapsedTime;
    const aspect = state.size.width / Math.max(state.size.height, 1);
    uniforms.uTime.value = time;
    pointer.current.lerp(gyro.current ?? state.pointer, 1 - Math.exp(-Math.min(delta, 1 / 30) * 3));
    uniforms.uPointer.value.copy(pointer.current);
    uniforms.uAspect.value = aspect;

    const displayUniforms = display.uniforms;
    displayUniforms.uTexel.value.set(1 / target.width, 1 / target.height);
    displayUniforms.uTime.value = time;
    displayUniforms.uPointer.value.copy(pointer.current);
    displayUniforms.uAspect.value = aspect;
    displayUniforms.uPixelRatio.value = state.viewport.dpr;
    gl.getDrawingBufferSize(displayUniforms.uResolution.value);

    if (!needsField) return;
    gl.setRenderTarget(target);
    gl.render(field.scene, field.camera);
    gl.setRenderTarget(null);
  });

  return (
    <mesh frustumCulled={false} renderOrder={0}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        key={variant}
        ref={displayRef}
        defines={defines}
        vertexShader={quadVertex}
        fragmentShader={displayFragment}
        uniforms={displayUniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
