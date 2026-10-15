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

// Passo 2 (resolução cheia): fluido escuro com bordas emitindo o token foreground.
const displayFragment = /* glsl */ `
uniform sampler2D uField;
uniform vec2 uTexel;
uniform vec3 uColor;
uniform vec3 uBase;
varying vec2 vUv;

void main() {
  vec4 fieldSample = texture2D(uField, vUv);
  float field = fieldSample.r;
  float lens = fieldSample.g;

  float fx = texture2D(uField, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uField, vUv - vec2(uTexel.x, 0.0)).r;
  float fy = texture2D(uField, vUv + vec2(0.0, uTexel.y)).r - texture2D(uField, vUv - vec2(0.0, uTexel.y)).r;
  float rim = smoothstep(0.02, 0.12, length(vec2(fx, fy)));
  float body = smoothstep(-0.35, 0.75, field);

  vec3 color = uBase + uColor * (body * 0.05 + lens * 0.05 + rim * body * 0.08);
  float vignette = smoothstep(1.25, 0.25, length((vUv - 0.5) * vec2(1.0, 1.2)) * 1.4);
  color *= mix(0.55, 1.0, vignette);
  color += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;

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
}

export function BackgroundMesh({ quality }: BackgroundMeshProps) {
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
    }),
    [target]
  );

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
    uniforms.uTime.value = shouldReduceMotion ? 0 : state.clock.elapsedTime;
    pointer.current.lerp(gyro.current ?? state.pointer, 1 - Math.exp(-Math.min(delta, 1 / 30) * 3));
    uniforms.uPointer.value.copy(pointer.current);
    uniforms.uAspect.value = state.size.width / Math.max(state.size.height, 1);
    display.uniforms.uTexel.value.set(1 / target.width, 1 / target.height);

    gl.setRenderTarget(target);
    gl.render(field.scene, field.camera);
    gl.setRenderTarget(null);
  });

  return (
    <mesh frustumCulled={false} renderOrder={0}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={displayRef}
        vertexShader={quadVertex}
        fragmentShader={displayFragment}
        uniforms={displayUniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
