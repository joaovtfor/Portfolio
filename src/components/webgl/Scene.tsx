"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface WebGLSceneProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  eventSource?: React.RefObject<HTMLElement | null>;
}

export function WebGLScene({ children, className, eventSource, ...props }: WebGLSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Intersection Observer Nativo
    // Evita o uso pesado do requestAnimationFrame quando o canvas não está visível
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      {
        threshold: 0, // Dispara exatamente ao cruzar o limite da tela
        rootMargin: "50px", // Margem de segurança para acordar a GPU pouco antes de aparecer
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full relative", className)}
      {...props}
    >
      <Canvas
        // Define o elemento pai como fonte de eventos de mouse, evitando que o HTML sobreposto os bloqueie
        eventSource={(eventSource || containerRef) as unknown as React.RefObject<HTMLElement>}
        eventPrefix="client"
        
        // Controle de Performance Absoluto:
        frameloop={inView ? "always" : "never"}
        
        // Clamping do DevicePixelRatio:
        dpr={[1, 1.5]}
        
        camera={{ position: [0, 0, 5], fov: 45 }}
        
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {/* Placeholder para as futuras malhas (meshes) e materiais */}
        {children}
      </Canvas>
    </div>
  );
}
