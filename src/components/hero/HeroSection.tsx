"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

import { HeroTitle } from "./HeroTitle";
import { HeroButton } from "./HeroButton";
import { RESUME_DATA } from "@/data/resume";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    // 'h-[100dvh]' respeita a barra de endereços do celular (evita quebra de layout)
    <section ref={sectionRef} className="relative w-full h-[100dvh] overflow-hidden">
      


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
            <p><strong className="text-neutral-600 font-bold">Role:</strong> {RESUME_DATA.personalInfo.role}</p>
            <p><strong className="text-neutral-600 font-bold">Focus:</strong> {RESUME_DATA.personalInfo.focus}</p>
            <p><strong className="text-neutral-600 font-bold">Stack:</strong> {RESUME_DATA.personalInfo.stack}</p>
          </div>
          
          <div className="flex items-center">
            <HeroButton />
          </div>
        </motion.div>

      </div>
      
    </section>
  );
}
