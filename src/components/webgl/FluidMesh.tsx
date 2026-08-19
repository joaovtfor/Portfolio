"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

// --- SHADERS GLSL ---
// O Vertex Shader apenas projeta o plano e repassa a coordenada UV
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment Shader: Onde a matemática pesada do "Monolito Fluido" acontece
const fragmentShader = `
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uColor;
varying vec2 vUv;

// Função clássica de Random e Noise 2D (Performance otimizada)
float random(in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Fractional Brownian Motion (FBM) para a textura de fumaça/fluido
#define OCTAVES 3
float fbm(in vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 uv = vUv;
    
    // Distorções baseadas no Tempo
    vec2 q = vec2(0.0);
    q.x = fbm(uv + uTime * 0.05);
    q.y = fbm(uv + vec2(1.0) + uTime * 0.05);

    vec2 r = vec2(0.0);
    
    // Distorções baseadas no Mouse/Giroscópio (uPointer)
    // Usamos o ponteiro para criar correntes sutis no fluido negro
    r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + uPointer.x * 0.3);
    r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) - uPointer.y * 0.3);

    float f = fbm(uv + r);

    // Converte o uPointer (que vai de -1 a 1) para a escala UV (0 a 1)
    vec2 normPointer = uPointer * 0.5 + 0.5;
    
    // Calcula a distância do fragmento até a "Lanterna Neon"
    float dist = distance(uv, normPointer);
    
    // A luz se dissipa quanto mais longe do ponteiro/centro
    float light = smoothstep(0.8, 0.0, dist);

    // O Fluido Base é o Monolito (#000000). A cor Neon aparece apenas nas cristas das ondas de noise
    float highlight = smoothstep(0.4, 0.8, f) * light * 2.5;

    vec3 baseColor = vec3(0.0, 0.0, 0.0);
    vec3 finalColor = mix(baseColor, uColor, highlight);

    // Uma leve luminosidade ambiente global para não ser uma tela 100% preta
    float ambient = smoothstep(0.6, 1.0, f) * 0.15;
    finalColor += uColor * ambient;

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

export function FluidMesh() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree(); // Usado para escalonar o plano e cobrir 100% da tela
  
  // Usamos um Ref em vez de State para não engatilhar re-renders (evita ESLint setState in effect)
  const isTouchDevice = useRef(false);
  const gyroTarget = useRef({ x: 0, y: 0 });

  // Detecção de Mobile e Setup do Giroscópio
  useEffect(() => {
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    isTouchDevice.current = hasTouch;

    if (hasTouch) {
      const handleOrientation = (e: DeviceOrientationEvent) => {
        // e.gamma: inclinação esquerda/direita (geralmente -90 a 90)
        // e.beta: inclinação frente/trás (geralmente -180 a 180)
        
        let x = e.gamma ? e.gamma / 45 : 0;
        let y = e.beta ? (e.beta - 45) / 45 : 0;
        
        // Clamping severo para não ultrapassar -1 e 1
        x = Math.max(-1, Math.min(1, x));
        y = Math.max(-1, Math.min(1, y));

        // Invertemos o Y porque no WebGL o positivo é pra cima
        gyroTarget.current = { x, y: -y };
      };

      // Nota Arquitetural (iOS 13+): A Apple exige uma permissão explícita 
      // via clique (DeviceOrientationEvent.requestPermission) para ativar o giroscópio.
      // Em Safari, o shader usará fallback (pointer inativo) se o usuário não tiver dado permissão.
      window.addEventListener("deviceorientation", handleOrientation);
      return () => window.removeEventListener("deviceorientation", handleOrientation);
    }
  }, []);

  // Memória das Uniforms (Eficiência: Impede a recriação do objeto a cada render)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color("#85E8EA") }, // O Neon Fluido
    }),
    []
  );

  useFrame((state) => {
    if (!materialRef.current) return;

    // 1. Atualiza o relógio (Tempo)
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

    // 2. Resolve o alvo interativo (Mouse ou Giroscópio)
    const targetX = isTouchDevice.current ? gyroTarget.current.x : state.pointer.x;
    const targetY = isTouchDevice.current ? gyroTarget.current.y : state.pointer.y;

    // 3. LERP (Linear Interpolation)
    // Em vez do ponteiro "teletransportar", a luz corre suavemente em direção ao alvo
    const lerpFactor = 0.05;
    materialRef.current.uniforms.uPointer.value.x += (targetX - materialRef.current.uniforms.uPointer.value.x) * lerpFactor;
    materialRef.current.uniforms.uPointer.value.y += (targetY - materialRef.current.uniforms.uPointer.value.y) * lerpFactor;
  });

  return (
    // O Plano é perfeitamente dimensionado para o tamanho da viewport da câmera
    <mesh scale={[viewport.width, viewport.height, 1]}>
      {/* 
        Usamos apenas [1, 1] para os vértices.
        Toda a distorção acontece no Fragment Shader.
        Isso custa 90% menos bateria do que subdividir a geometria. 
      */}
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
}
