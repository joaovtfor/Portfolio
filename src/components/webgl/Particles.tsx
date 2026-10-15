"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { useUIStore } from "@/store/uiStore";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const vertexShader = `
uniform float uTime;
attribute float aSize;
attribute float aSpeed;
varying float vAlpha;
varying float vDepth;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  gl_PointSize = aSize * (34.0 / -mvPosition.z);
  
  float depthFactor = smoothstep(-24.0, -1.5, mvPosition.z);
  float twinkle = 0.5 + 0.5 * abs(sin(uTime * aSpeed * 2.0 + position.x));
  vAlpha = depthFactor * twinkle;
  vDepth = depthFactor;
}
`;

const fragmentShader = `
uniform vec3 uColor;
varying float vAlpha;
varying float vDepth;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;
  
  float core = smoothstep(0.5, 0.05, dist);
  float glow = smoothstep(0.5, 0.0, dist) * 0.35;
  float alpha = (core + glow) * vAlpha;
  
  vec3 finalColor = mix(uColor * 0.75, uColor, vDepth);
  gl_FragColor = vec4(finalColor, alpha);
}
`;

function prng(seed: number) {
  const x = Math.sin(seed * 99.9999) * 10000;
  return x - Math.floor(x);
}

interface ParticlesProps {
  isMobile?: boolean;
}

export function Particles({ isMobile = false }: ParticlesProps) {
  const { viewport } = useThree();
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const scrollData = useRef({ progress: 0 });

  const count = isMobile ? 800 : 2600;

  const [basePositions, currentPositions, sizes, speeds] = useMemo(() => {
    const base = new Float32Array(count * 3);
    const current = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const x = (prng(i * 3) - 0.5) * 38;
      const y = (prng(i * 3 + 1) - 0.5) * 28;
      const z = (prng(i * 3 + 2) - 0.5) * 22 - 2;

      base[i3] = x;
      base[i3 + 1] = y;
      base[i3 + 2] = z;

      current[i3] = x;
      current[i3 + 1] = y;
      current[i3 + 2] = z;

      siz[i] = prng(i * 7) * 2.2 + 1.0;
      spd[i] = prng(i * 11) * 0.35 + 0.1;
    }

    return [base, current, siz, spd];
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: {
        value: (() => {
          if (typeof document !== "undefined") {
            const fg = getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim();
            if (fg) return new THREE.Color(fg);
          }
          return new THREE.Color(0.52, 0.91, 0.92);
        })(),
      },
    }),
    []
  );

  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        scrollData.current.progress = self.progress;
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  useFrame((state) => {
    if (!geometryRef.current || !materialRef.current) return;

    if (!shouldReduceMotion) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }

    if (!shouldReduceMotion && groupRef.current) {
      const targetPosZ = Math.sin(scrollData.current.progress * Math.PI) * 1.5;
      const targetRotY = scrollData.current.progress * 0.15;
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetPosZ, 0.04);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.04);
    }

    const pointerWorldX = (state.pointer.x * viewport.width) / 2;
    const pointerWorldY = (state.pointer.y * viewport.height) / 2;

    const interactivePos = useUIStore.getState().interactivePositions[0];
    let hasAttractor = false;
    let attractorX = 0;
    let attractorY = 0;

    if (interactivePos) {
      hasAttractor = true;
      const ndcX = (interactivePos.x / state.size.width) * 2 - 1;
      const ndcY = -(interactivePos.y / state.size.height) * 2 + 1;
      attractorX = (ndcX * viewport.width) / 2;
      attractorY = (ndcY * viewport.height) / 2;
    }

    const posAttr = geometryRef.current.attributes.position;
    const positions = posAttr.array as Float32Array;

    const time = shouldReduceMotion ? 0 : state.clock.elapsedTime;
    const mouseRadius = 4.5;
    const mouseRadiusSq = mouseRadius * mouseRadius;
    const lerpFactor = 0.075;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const baseX = basePositions[i3];
      const baseY = basePositions[i3 + 1];
      const baseZ = basePositions[i3 + 2];

      const speed = speeds[i];
      let targetX = baseX + Math.sin(time * speed + baseY) * 0.35;
      let targetY = baseY + Math.cos(time * speed + baseX) * 0.35;
      let targetZ = baseZ;

      let currX = positions[i3];
      let currY = positions[i3 + 1];
      let currZ = positions[i3 + 2];

      if (!shouldReduceMotion) {
        const dxMouse = currX - pointerWorldX;
        const dyMouse = currY - pointerWorldY;
        const distSqMouse = dxMouse * dxMouse + dyMouse * dyMouse;

        if (distSqMouse < mouseRadiusSq && distSqMouse > 0.0001) {
          const distMouse = Math.sqrt(distSqMouse);
          const norm = 1.0 - distMouse / mouseRadius;
          const push = norm * norm * 4.2;
          const invDist = 1.0 / distMouse;

          targetX += dxMouse * invDist * push;
          targetY += dyMouse * invDist * push;
          targetZ += (baseZ >= -4.0 ? -1.0 : 1.0) * push * 1.6;
        }

        if (hasAttractor) {
          const dxAttr = attractorX - currX;
          const dyAttr = attractorY - currY;
          const distSqAttr = dxAttr * dxAttr + dyAttr * dyAttr;

          if (distSqAttr < 36.0 && distSqAttr > 0.0001) {
            const distAttr = Math.sqrt(distSqAttr);
            const pull = (1.0 - distAttr / 6.0) * 1.5;
            targetX += (dxAttr / distAttr) * pull;
            targetY += (dyAttr / distAttr) * pull;
          }
        }
      }

      currX += (targetX - currX) * lerpFactor;
      currY += (targetY - currY) * lerpFactor;
      currZ += (targetZ - currZ) * lerpFactor;

      positions[i3] = currX;
      positions[i3 + 1] = currY;
      positions[i3 + 2] = currZ;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry ref={geometryRef}>
          <bufferAttribute attach="attributes-position" count={count} args={[currentPositions, 3]} />
          <bufferAttribute attach="attributes-aSize" count={count} args={[sizes, 1]} />
          <bufferAttribute attach="attributes-aSpeed" count={count} args={[speeds, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}