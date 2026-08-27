"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    uv.x *= uResolution.x / uResolution.y;
    
    vec2 center = vec2(0.5);
    center.x *= uResolution.x / uResolution.y;
    
    vec2 pointer = uPointer * 0.5 + 0.5;
    pointer.x *= uResolution.x / uResolution.y;
    
    // Movimentação orgânica autônoma (mesmo sem toque)
    float driftX = sin(uTime * 0.3) * 0.15;
    float driftY = cos(uTime * 0.4) * 0.15;
    vec2 organicCenter = center + vec2(driftX, driftY);
    
    // Orb interativo que segue o dedo
    vec2 orbPos = mix(organicCenter, pointer, 0.6);
    
    // Distorção de espaço sutil (dá a sensação de líquido)
    vec2 distortedUv = uv;
    distortedUv.x += sin(uv.y * 5.0 + uTime) * 0.03;
    distortedUv.y += cos(uv.x * 5.0 + uTime) * 0.03;
    
    float dist = distance(distortedUv, orbPos);
    
    // Glow suave (Spotlight líquido)
    float glow = smoothstep(0.8, 0.0, dist);
    
    // Cores - Fiel ao desktop
    vec3 bgColor = vec3(0.01, 0.01, 0.012);
    vec3 orbColor = vec3(0.08, 0.18, 0.18); // Ciano escuro e profundo
    
    // Adiciona dither para evitar "banding" (degraus nas cores no celular)
    float dither = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) * 0.02;
    
    vec3 finalColor = mix(bgColor, orbColor, glow * 0.8) + dither;

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

export function MobileFluidMesh() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  
  // Ref para giroscópio (inclinação do celular)
  const gyroTarget = useRef({ x: 0, y: 0 });
  
  // Posição final consolidada (suavizada)
  const currentPos = useRef({ x: 0, y: 0 });
  
  // Rastreador real de toque (corrige o bug do R3F manter o state.pointer preenchido)
  const isActivelyTouching = useRef(false);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  useEffect(() => {
    // Escuta os eventos de toque reais para devolver o controle ao giroscópio
    const handleTouchStart = () => { isActivelyTouching.current = true; };
    const handleTouchEnd = () => { isActivelyTouching.current = false; };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);

    // Escuta os eventos do Giroscópio
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let x = e.gamma ? e.gamma / 30 : 0;
      let y = e.beta ? (e.beta - 45) / 30 : 0;
      
      x = Math.max(-1, Math.min(1, x));
      y = Math.max(-1, Math.min(1, y));

      gyroTarget.current = { x, y: -y };
    };

    window.addEventListener("deviceorientation", handleOrientation);
    
    if (typeof window.DeviceOrientationEvent !== 'undefined' && typeof (window.DeviceOrientationEvent as any).requestPermission === 'function') {
      // Ignorado para não bloquear a UI, depende do toque no Android.
    }

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  useFrame((state) => {
    if (!materialRef.current) return;
    
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    
    // Agora o sistema sabe exatamente se o dedo está fisicamente na tela
    const isTouching = isActivelyTouching.current;
    
    let targetX = 0;
    let targetY = 0;

    if (isTouching) {
      // Se tiver dedo na tela, vai pro dedo
      targetX = state.pointer.x;
      targetY = state.pointer.y;
    } else {
      // Se não, o "peso" da luz cai pro lado que o celular inclina
      targetX = gyroTarget.current.x;
      targetY = gyroTarget.current.y;
    }
    
    // Interpolação super suave (física de gravidade/inércia)
    currentPos.current.x += (targetX - currentPos.current.x) * 0.05;
    currentPos.current.y += (targetY - currentPos.current.y) * 0.05;
    
    materialRef.current.uniforms.uPointer.value.set(
      currentPos.current.x,
      currentPos.current.y
    );
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={false}
        depthWrite={false}
      />
    </mesh>
  );
}
