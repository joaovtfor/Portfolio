"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { WebGLScene } from "@/components/webgl/Scene";
import { FluidMesh } from "@/components/webgl/FluidMesh";
import { Particles } from "@/components/webgl/Particles";

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);

  return (
    <main ref={rootRef} className="block w-full min-h-screen relative bg-background">
      
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
