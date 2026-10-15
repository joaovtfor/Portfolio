"use client";

import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

interface WebGLSceneProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  eventSource?: React.RefObject<HTMLElement | null>;
  paused?: boolean;
}

export function WebGLScene({ children, className, eventSource, paused = false, ...props }: WebGLSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const setSceneReady = useUIStore((state) => state.setSceneReady);

  // O canvas de fundo é fixo e sempre visível: o loop só para em abas ocultas (rAF) ou quando pausado
  // (ex.: experimento do Lab aberto). Com reduced motion, renderiza sob demanda (frame estático).
  const frameloop = paused ? "never" : shouldReduceMotion ? "demand" : "always";

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("w-full h-full relative", className)}
      {...props}
    >
      <Canvas
        eventSource={(eventSource || containerRef) as unknown as React.RefObject<HTMLElement>}
        eventPrefix="client"
        frameloop={frameloop}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        onCreated={setSceneReady}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </Canvas>
    </div>
  );
}
