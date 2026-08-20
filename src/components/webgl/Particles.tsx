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
    
    // 1. Movimento Orgânico Contínuo (Drift)
    // As partículas "flutuam" suavemente usando seno/cosseno combinados com sua posição inicial
    pos.x += sin(uTime * aSpeed + pos.y) * 0.8;
    pos.y += cos(uTime * aSpeed + pos.x) * 0.8;
    
    // 2. Física de Repulsão do Mouse
    float dist = distance(pos.xy, uMouseWorld);
    float radius = 2.5; // Raio do campo de força magnético do mouse
    
    if (dist < radius) {
        // Quanto mais perto do centro do mouse, maior a força de empurrão
        float force = pow((radius - dist) / radius, 2.0); 
        vec2 dir = normalize(pos.xy - uMouseWorld);
        
        // Empurra a partícula na direção oposta ao mouse
        pos.xy += dir * force * 2.0;
        
        // Opcional: faz a partícula "pular" levemente para frente (Z) ao ser empurrada
        pos.z += force * 1.5;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Tamanho da partícula com perspectiva (atenuação de distância)
    gl_PointSize = aSize * (25.0 / -mvPosition.z);
    
    // Piscar suave e randômico
    vAlpha = 0.2 + 0.8 * abs(sin(uTime * aSpeed * 2.0 + pos.x));
}
`;

const fragmentShader = `
varying float vAlpha;
uniform vec3 uColor;

void main() {
    // Desenha um círculo perfeito a partir do quadrado do gl_PointCoord
    float dist = distance(gl_PointCoord, vec2(0.5));
    
    // Descarta os pixels fora do raio para arredondar
    if (dist > 0.5) discard;
    
    // Cria um brilho radial interno (glow macio)
    float alpha = (0.5 - dist) * 2.0 * vAlpha;
    
    gl_FragColor = vec4(uColor, alpha);
}
`;

export function Particles() {
  const { viewport } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const count = 400; // Quantidade de partículas

  // Pré-calcula posições, tamanhos e velocidades iniciais aleatórias (Executado 1x)
  const [positions, sizes, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Espalha as partículas em uma grande área 3D (X, Y, Z)
      pos[i * 3] = (Math.random() - 0.5) * 20;     // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20; // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;  // Z (Profundidade)

      siz[i] = Math.random() * 2.0 + 1.0; // Tamanho
      spd[i] = Math.random() * 0.4 + 0.1; // Velocidade do drift
    }

    return [pos, siz, spd];
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouseWorld: { value: new THREE.Vector2(0, 0) },
      // Cor cinza/ciano sutil, puxando para o branco para combinar com o tema high-end
      uColor: { value: new THREE.Color("#A3D4D5") },
    }),
    []
  );

  useFrame((state) => {
    if (!materialRef.current) return;
    
    // 1. Atualiza o relógio do Shader
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    
    // 2. Converte o mouse de NDC (-1 a 1) para World Coordinates (plano Z=0)
    const targetX = (state.pointer.x * viewport.width) / 2;
    const targetY = (state.pointer.y * viewport.height) / 2;
    
    // 3. Suavização (Lerp) para o campo magnético do mouse não ser super ríspido
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
        // Adiciona um brilho cumulativo onde as partículas se sobrepõem
        blending={THREE.AdditiveBlending} 
      />
    </points>
  );
}
