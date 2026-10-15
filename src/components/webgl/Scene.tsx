"use client";

import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

interface WebGLSceneProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  eventSource?: React.RefObject<HTMLElement | null>;
}

export function WebGLScene({ children, className, eventSource, ...props }: WebGLSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const setSceneReady = useUIStore((state) => state.setSceneReady);

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
        // O canvas é um fundo fixo, sempre visível: o loop só para em abas ocultas (rAF).
        // Com reduced motion, renderiza sob demanda (frame estático).
        frameloop={shouldReduceMotion ? "demand" : "always"}
        dpr={[1, 1.5]}
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
