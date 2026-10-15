"use client";

import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { ParticleField } from "@/components/webgl/ParticleField";
import { AdaptiveDpr } from "@/components/webgl/AdaptiveDpr";

interface FlowFieldExperimentProps {
  isMobile: boolean;
  fallback: string;
}

// Motor GPGPU do fundo em modo playground: o clique alterna entre as formas.
export default function FlowFieldExperiment({ isMobile, fallback }: FlowFieldExperimentProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Canvas
      frameloop={shouldReduceMotion ? "demand" : "always"}
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      fallback={<p className="p-12 font-mono text-sm text-muted">{fallback}</p>}
      className="cursor-crosshair"
    >
      <ParticleField isMobile={isMobile} driver="click" />
      <AdaptiveDpr />
    </Canvas>
  );
}
