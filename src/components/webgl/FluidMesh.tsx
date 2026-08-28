"use client";

import { useFrame } from "@react-three/fiber";
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
uniform vec2 uPointer;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    uv.x *= uResolution.x / uResolution.y;
    
    vec2 center = vec2(0.5);
    center.x *= uResolution.x / uResolution.y;
    
    vec2 normPointer = uPointer * 0.5 + 0.5;
    vec2 pointer = normPointer;
    pointer.x *= uResolution.x / uResolution.y;
    
    vec2 orbPos = mix(center, pointer, 0.4);
    
    float dist = distance(uv, orbPos);
    
    float glow = smoothstep(0.7, 0.0, dist);
    
    vec3 bgColor = vec3(0.01, 0.01, 0.012);
    vec3 orbColor = vec3(0.12, 0.15, 0.15);
    
    float dither = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) * 0.02;
    
    vec3 finalColor = mix(bgColor, orbColor, glow) + dither;

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

export function FluidMesh() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const isTouchDevice = useRef(false);
  const gyroTarget = useRef({ x: 0, y: 0 });

  useEffect(() => {
    isTouchDevice.current = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    if (isTouchDevice.current) {
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
      uPointer: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  useFrame((state) => {
    if (!materialRef.current) return;
    
    const res = materialRef.current.uniforms.uResolution.value;
    if (res.x !== state.size.width || res.y !== state.size.height) {
      res.set(state.size.width, state.size.height);
    }

    const targetX = isTouchDevice.current ? gyroTarget.current.x : state.pointer.x;
    const targetY = isTouchDevice.current ? gyroTarget.current.y : state.pointer.y;

    const lerpFactor = 0.05;
    materialRef.current.uniforms.uPointer.value.x += (targetX - materialRef.current.uniforms.uPointer.value.x) * lerpFactor;
    materialRef.current.uniforms.uPointer.value.y += (targetY - materialRef.current.uniforms.uPointer.value.y) * lerpFactor;
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
        depthTest={false}
      />
    </mesh>
  );
}
