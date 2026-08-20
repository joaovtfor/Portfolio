"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { WebGLScene } from "@/components/webgl/Scene";
import { FluidMesh } from "@/components/webgl/FluidMesh";
import { Particles } from "@/components/webgl/Particles";
import { HeroTitle } from "./HeroTitle";
import { HeroButton } from "./HeroButton";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    // 'h-[100dvh]' respeita a barra de endereços do celular (evita quebra de layout)
    <section ref={sectionRef} className="relative w-full h-[100dvh] overflow-hidden">
      
      {/* 
        Canvas de Fundo (Absoluto) 
        Fade-in ultra suave para que o WebGL não apareça de forma brusca no carregamento.
      */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, ease: "easeInOut" }}
        className="absolute inset-0 w-full h-full z-0 bg-background"
      >
        <WebGLScene eventSource={sectionRef}>
          <FluidMesh />
          <Particles />
        </WebGLScene>
      </motion.div>

      {/* Camada de Conteúdo HTML (Z-index superior) */}
      <div className="relative z-10 flex flex-col w-full h-full max-w-[1440px] mx-auto pointer-events-none p-6 md:p-12">
        
        {/* Espaçador flexível para empurrar o título pro centro */}
        <div className="flex-1 flex items-center justify-center">
          <HeroTitle />
        </div>
        
        {/* Barra Inferior (Metadados e CTA) 
            Sincronizada para aparecer apenas depois que o título estiver estabilizado.
        */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1.0, ease: "easeOut" }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 w-full pointer-events-auto"
        >
          {/* Metadados (Role, Focus, Stack) */}
          <div className="flex flex-col gap-1 font-sans text-[10px] sm:text-xs tracking-widest text-neutral-400 uppercase select-none">
            <p><strong className="text-neutral-600 font-bold">Role:</strong> Frontend Engineer</p>
            <p><strong className="text-neutral-600 font-bold">Focus:</strong> High-Performance UI</p>
            <p><strong className="text-neutral-600 font-bold">Stack:</strong> Next.js, TypeScript, UI/UX Design</p>
          </div>
          
          <div className="flex items-center">
            <HeroButton />
          </div>
        </motion.div>

      </div>
      
    </section>
  );
}
