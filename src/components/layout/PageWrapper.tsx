"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { WebGLScene } from "@/components/webgl/Scene";
import { FluidMesh } from "@/components/webgl/FluidMesh";
import { Particles } from "@/components/webgl/Particles";
import { Preloader } from "./Preloader";
import { CustomCursor } from "./CustomCursor";

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);

  // Garante que o site sempre seja carregado no topo (Pixel 0),
  // desativando o comportamento padrão do navegador de lembrar o último scroll.
  // Isso é crucial para sites com GSAP ScrollTrigger e storytelling.
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <main ref={rootRef} className="block w-full min-h-screen relative bg-background">
      
      <Preloader />
      <CustomCursor />

      {/* 
        Canvas de Fundo Global (Fixed)
        Substitui as múltiplas instâncias para otimizar memória e GPU.
        Escuta eventos de mouse de todo o documento.
      */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, ease: "easeInOut" }}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      >
        <WebGLScene eventSource={rootRef}>
          <FluidMesh />
          <Particles />
        </WebGLScene>
      </motion.div>
      
      {/* Camada de Conteúdo */}
      <div className="relative z-10 block w-full">
        {children}
      </div>

    </main>
  );
}
