"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface WebGLSceneProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function WebGLScene({ children, className, ...props }: WebGLSceneProps) {
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
        // Controle de Performance Absoluto:
        // 'always': loop contínuo (necessário para Shaders e animações WebGL)
        // 'never': desliga a GPU, poupa bateria e processamento no mobile
        frameloop={inView ? "always" : "never"}
        
        // Clamping do DevicePixelRatio:
        // Telas Retina de celular têm DPR 3 ou 4. Renderizar 3D nisso destrói a GPU.
        // Travamos o teto em 1.5. A qualidade visual se mantém altíssima, mas a performance decola.
        dpr={[1, 1.5]}
        
        camera={{ position: [0, 0, 5], fov: 45 }}
        
        // Eventos ativados nativamente para o WebGL rastrear o ponteiro
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
