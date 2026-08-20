"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
uniform float uTime;
uniform vec2 uMouseWorld;

attribute float aSize;
attribute float aSpeed;

varying float vAlpha;

void main() {
    vec3 pos = position;
    
    // 1. Movimento Orgânico Contínuo (Drift Unânime)
    pos.x += sin(uTime * aSpeed + pos.y) * 0.8;
    pos.y += cos(uTime * aSpeed + pos.x) * 0.8;
    
    // 2. Física de Repulsão do Mouse (Aplicada uniformemente em toda a tela)
    float dist = distance(pos.xy, uMouseWorld);
    float radius = 2.5; 
    
    if (dist < radius) {
        float force = pow((radius - dist) / radius, 2.0); 
        vec2 dir = normalize(pos.xy - uMouseWorld);
        
        pos.xy += dir * force * 2.0;
        pos.z += force * 1.5;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    gl_PointSize = aSize * (25.0 / -mvPosition.z);
    vAlpha = 0.2 + 0.8 * abs(sin(uTime * aSpeed * 2.0 + pos.x));
}
`;

const fragmentShader = `
varying float vAlpha;
uniform vec3 uColor;

void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = (0.5 - dist) * 2.0 * vAlpha;
    gl_FragColor = vec4(uColor, alpha);
}
`;

// Helper determinístico para manter o useMemo "puro"
function prng(seed: number) {
  const x = Math.sin(seed * 99.9999) * 10000;
  return x - Math.floor(x);
}

export function Particles() {
  const { viewport } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Retornando para uma densidade mais limpa e minimalista
  const count = 400;

  const [positions, sizes, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (prng(i * 3) - 0.5) * 20;
      pos[i * 3 + 1] = (prng(i * 3 + 1) - 0.5) * 20;
      pos[i * 3 + 2] = (prng(i * 3 + 2) - 0.5) * 8;

      siz[i] = prng(i * 7) * 2.0 + 1.0;
      spd[i] = prng(i * 11) * 0.4 + 0.1;
    }

    return [pos, siz, spd];
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouseWorld: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color("#A3D4D5") },
    }),
    []
  );

  useFrame((state) => {
    if (!materialRef.current) return;
    
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    
    // Suavização do Mouse
    const targetX = (state.pointer.x * viewport.width) / 2;
    const targetY = (state.pointer.y * viewport.height) / 2;
    const lerpFactor = 0.1;
    materialRef.current.uniforms.uMouseWorld.value.x += (targetX - materialRef.current.uniforms.uMouseWorld.value.x) * lerpFactor;
    materialRef.current.uniforms.uMouseWorld.value.y += (targetY - materialRef.current.uniforms.uMouseWorld.value.y) * lerpFactor;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} args={[positions, 3]} />
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
  );
}
