"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { readThemeColor } from "@/components/webgl/theme";

const IMAGE_SRC = "/projects/nomade-eq.webp";

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Ondulação radial guiada pela velocidade do ponteiro + separação RGB nas cristas.
const fragmentShader = /* glsl */ `
uniform sampler2D uTexture;
uniform vec2 uPointer;
uniform vec2 uVelocity;
uniform float uStrength;
uniform float uTime;
uniform float uPlaneAspect;
uniform float uImageAspect;
uniform vec3 uTint;
varying vec2 vUv;

vec2 coverUv(vec2 uv) {
  vec2 scale = uPlaneAspect > uImageAspect
    ? vec2(1.0, uImageAspect / uPlaneAspect)
    : vec2(uPlaneAspect / uImageAspect, 1.0);
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 toPointer = (vUv - uPointer) * vec2(uPlaneAspect, 1.0);
  float dist = length(toPointer);
  float falloff = exp(-dist * 4.0);
  float ripple = sin(dist * 38.0 - uTime * 5.0) * falloff * uStrength;
  vec2 direction = toPointer / max(dist, 0.0001);
  vec2 offset = direction * ripple * 0.025 + uVelocity * falloff * 0.06;

  vec2 uv = coverUv(vUv);
  vec3 color = vec3(
    texture2D(uTexture, uv + offset * 1.4).r,
    texture2D(uTexture, uv + offset).g,
    texture2D(uTexture, uv + offset * 0.6).b
  );

  color = color * 0.82 + uTint * max(ripple, 0.0) * 0.35;
  gl_FragColor = vec4(color, 1.0);
}
`;

function LiquidPlane() {
  const texture = useLoader(THREE.TextureLoader, IMAGE_SRC);
  const viewport = useThree((state) => state.viewport);
  const shouldReduceMotion = useReducedMotion();
  const previous = useRef(new THREE.Vector2(0.5, 0.5));
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uVelocity: { value: new THREE.Vector2() },
      uStrength: { value: 0 },
      uTime: { value: 0 },
      uPlaneAspect: { value: 1 },
      uImageAspect: { value: texture.image.width / texture.image.height },
      uTint: { value: readThemeColor("--foreground") },
    }),
    [texture]
  );

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const uniforms = material.uniforms;
    const dt = Math.max(Math.min(delta, 1 / 30), 1 / 240);
    uniforms.uPlaneAspect.value = state.viewport.width / state.viewport.height;
    if (shouldReduceMotion) return;

    uniforms.uTime.value = state.clock.elapsedTime;
    const current = uniforms.uPointer.value;
    current.set(state.pointer.x * 0.5 + 0.5, state.pointer.y * 0.5 + 0.5);

    const velocityX = (current.x - previous.current.x) / dt;
    const velocityY = (current.y - previous.current.y) / dt;
    previous.current.copy(current);

    const smoothing = 1 - Math.exp(-dt * 8);
    uniforms.uVelocity.value.x += (velocityX - uniforms.uVelocity.value.x) * smoothing;
    uniforms.uVelocity.value.y += (velocityY - uniforms.uVelocity.value.y) * smoothing;

    const speed = Math.min(uniforms.uVelocity.value.length() * 0.8, 1);
    uniforms.uStrength.value += (speed - uniforms.uStrength.value) * (1 - Math.exp(-dt * (speed > uniforms.uStrength.value ? 10 : 1.5)));
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={materialRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  );
}

export default function LiquidImageExperiment({ fallback }: { fallback: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Canvas
      frameloop={shouldReduceMotion ? "demand" : "always"}
      dpr={[1, 1.5]}
      gl={{ antialias: false }}
      fallback={<p className="p-12 font-mono text-sm text-muted">{fallback}</p>}
    >
      <Suspense fallback={null}>
        <LiquidPlane />
      </Suspense>
    </Canvas>
  );
}
