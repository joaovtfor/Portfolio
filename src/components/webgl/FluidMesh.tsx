"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

// --- SHADERS GLSL ---

// TRUQUE DE MESTRE: Ignoramos a câmera do R3F.
// Ao definir o gl_Position direto, garantimos que o shader preencha 100% da tela sempre.
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  // Oplano cobre perfeitamente a tela (NDC: -1 a 1)
  gl_Position = vec4(position, 1.0);
}
`;

// Fragment Shader: Esfera central desfocada reagindo ao mouse
const fragmentShader = `
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uColor;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
    // Corrige a proporção da tela (Aspect Ratio)
    vec2 uv = vUv;
    uv.x *= uResolution.x / uResolution.y;
    
    // Centro original da tela
    vec2 center = vec2(0.5);
    center.x *= uResolution.x / uResolution.y;
    
    // Posição do ponteiro corrigida
    vec2 normPointer = uPointer * 0.5 + 0.5;
    vec2 pointer = normPointer;
    pointer.x *= uResolution.x / uResolution.y;
    
    // A esfera se move _parcialmente_ em direção ao mouse (efeito de paralaxe/gravidade)
    vec2 orbPos = mix(center, pointer, 0.4);
    
    // Distância do fragmento atual até o centro da esfera
    float dist = distance(uv, orbPos);
    
    // Cria um brilho radial super desfocado (soft spotlight)
    // Valores ajustados para criar uma esfera grande e difusa que some lentamente
    float glow = smoothstep(0.7, 0.0, dist);
    
    // Cores (Fundo ultra escuro, Esfera com brilho sutil)
    vec3 bgColor = vec3(0.01, 0.01, 0.012); // Quase preto, com mínimo de profundidade
    vec3 orbColor = vec3(0.12, 0.15, 0.15); // Cinza/Ciano ultra sutil
    
    // Opcional: Adiciona um leve ruído (noise/dither) para evitar color banding no gradiente suave
    float dither = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) * 0.02;
    
    vec3 finalColor = mix(bgColor, orbColor, glow) + dither;

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

export function FluidMesh() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree(); // Usado para corrigir o Aspect Ratio
  
  const isTouchDevice = useRef(false);
  const gyroTarget = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    isTouchDevice.current = hasTouch;

    if (hasTouch) {
      const handleOrientation = (e: DeviceOrientationEvent) => {
        let x = e.gamma ? e.gamma / 45 : 0;
        let y = e.beta ? (e.beta - 45) / 45 : 0;
        
        x = Math.max(-1, Math.min(1, x));
        y = Math.max(-1, Math.min(1, y));

        gyroTarget.current = { x, y: -y };
      };

      window.addEventListener("deviceorientation", handleOrientation);
      return () => window.removeEventListener("deviceorientation", handleOrientation);
    }
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color("#85E8EA") },
      uResolution: { value: new THREE.Vector2(1, 1) }, // Nova uniform para Aspect Ratio
    }),
    []
  );

  useFrame((state) => {
    if (!materialRef.current) return;

    // Atualiza Tempo
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    
    // Atualiza Resolução (Para nitidez em qualquer tela)
    materialRef.current.uniforms.uResolution.value.set(size.width, size.height);

    // LERP do Ponteiro
    const targetX = isTouchDevice.current ? gyroTarget.current.x : state.pointer.x;
    const targetY = isTouchDevice.current ? gyroTarget.current.y : state.pointer.y;

    const lerpFactor = 0.05;
    materialRef.current.uniforms.uPointer.value.x += (targetX - materialRef.current.uniforms.uPointer.value.x) * lerpFactor;
    materialRef.current.uniforms.uPointer.value.y += (targetY - materialRef.current.uniforms.uPointer.value.y) * lerpFactor;
  });

  return (
    // Não precisamos mais do scale={}, o Vertex Shader força o preenchimento absoluto
    <mesh>
      {/* 
        args={[2, 2]} cobre exatamente do -1 ao 1 no Normalized Device Coordinates.
        O plano agora é "ancorado" aos 4 cantos da tela ignorando a lente da câmera.
      */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={false}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

