"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useUIStore } from "@/store/uiStore";

const vertexShader = `
uniform float uTime;
uniform vec2 uMouseWorld;
uniform vec2 uAttractor;
uniform float uHasAttractor;

attribute float aSize;
attribute float aSpeed;

varying float vAlpha;

void main() {
    vec3 pos = position;
    
    // 1. Movimento Orgânico Contínuo (Drift Unânime)
    pos.x += sin(uTime * aSpeed + pos.y) * 0.8;
    pos.y += cos(uTime * aSpeed + pos.x) * 0.8;
    
    // 2. Interação Magnética Suave com UI (Ex: Hover no ProjectCard)
    if (uHasAttractor > 0.5) {
        float distToAttractor = distance(pos.xy, uAttractor);
        float effectRadius = 5.0; 
        
        if (distToAttractor < effectRadius) {
            float pull = 1.0 - smoothstep(0.0, effectRadius, distToAttractor);
            vec2 dir = normalize(uAttractor - pos.xy);
            
            // Puxa sutilmente as partículas em direção ao centro do card
            pos.xy += dir * pull * 0.8;
            // Eleva suavemente no eixo Z para destacar
            pos.z += pull * 1.5;
            
            // Aumenta o brilho (tamanho) perto do card
            pos.z += pull * aSize * 0.5;
        }
    }

    // 3. Física de Repulsão do Mouse
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
    
    // Size attenuation baseada na distância Z da câmera
    gl_PointSize = aSize * (35.0 / -mvPosition.z);
    
    // Base de opacidade e pulsação orgânica
    float baseAlpha = 0.2 + 0.8 * abs(sin(uTime * aSpeed * 2.0 + pos.x));
    
    // Z-Depth Fog (Profundidade: partículas mais distantes ficam mais escuras/transparentes)
    // Se a câmera está em z=0, e o plano de partículas está a z=-15, mvPosition.z é negativo
    float depthAlpha = smoothstep(-25.0, -2.0, mvPosition.z);
    vAlpha = baseAlpha * depthAlpha;
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
  const groupRef = useRef<THREE.Group>(null);
  
  // Aumentado para 1500 partículas para preencher o volume 3D
  const count = 1500;

  const [positions, sizes, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Espalhamento mais agressivo em X e Y
      pos[i * 3] = (prng(i * 3) - 0.5) * 35;
      pos[i * 3 + 1] = (prng(i * 3 + 1) - 0.5) * 35;
      // Profundidade Z dramática (espalhadas de -12 a +12 aproximadamente, ou -24 spread)
      pos[i * 3 + 2] = (prng(i * 3 + 2) - 0.5) * 25;

      // Tamanhos variados para enfatizar partículas gigantes perto da câmera
      siz[i] = prng(i * 7) * 3.5 + 1.0;
      spd[i] = prng(i * 11) * 0.4 + 0.1;
    }

    return [pos, siz, spd];
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouseWorld: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color("#A3D4D5") },
      uAttractor: { value: new THREE.Vector2(0, 0) },
      uHasAttractor: { value: 0.0 },
    }),
    []
  );

  useFrame((state) => {
    if (!materialRef.current) return;
    
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    
    // Parallax Constante (Rotação Global do Grupo Baseada no Mouse)
    if (groupRef.current) {
      // Rotação suave baseada na posição X e Y do mouse (inverte X e Y para inclinação 3D correta)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, (state.pointer.y * Math.PI) / 8, 0.03);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, (state.pointer.x * Math.PI) / 8, 0.03);
    }
    
    // Suavização do Mouse para o Shader
    const targetX = (state.pointer.x * viewport.width) / 2;
    const targetY = (state.pointer.y * viewport.height) / 2;
    const lerpFactor = 0.1;
    materialRef.current.uniforms.uMouseWorld.value.x += (targetX - materialRef.current.uniforms.uMouseWorld.value.x) * lerpFactor;
    materialRef.current.uniforms.uMouseWorld.value.y += (targetY - materialRef.current.uniforms.uMouseWorld.value.y) * lerpFactor;

    // Attractor (Integração com ProjectCard)
    const interactivePos = useUIStore.getState().interactivePositions[0];
    
    if (interactivePos) {
      // Converte coordenadas da tela para coordenadas do WebGL
      const ndcX = (interactivePos.x / state.size.width) * 2 - 1;
      const ndcY = -(interactivePos.y / state.size.height) * 2 + 1;
      
      const worldX = (ndcX * viewport.width) / 2;
      const worldY = (ndcY * viewport.height) / 2;
      
      materialRef.current.uniforms.uAttractor.value.set(worldX, worldY);
      // Fade in suave do efeito atrator
      materialRef.current.uniforms.uHasAttractor.value += (1.0 - materialRef.current.uniforms.uHasAttractor.value) * 0.1;
    } else {
      // Fade out suave
      materialRef.current.uniforms.uHasAttractor.value += (0.0 - materialRef.current.uniforms.uHasAttractor.value) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
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
    </group>
  );
}
