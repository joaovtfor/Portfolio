"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useLenis } from "@studio-freight/react-lenis";

import { HeroTitle } from "./HeroTitle";
import { HeroButton } from "./HeroButton";
import { RESUME_DATA } from "@/data/resume";
import { useUIStore } from "@/store/uiStore";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isPreloaderDone = useUIStore((state) => state.isPreloaderDone);
  const lenis = useLenis();

  const handleScrollToContact = () => {
    if (lenis) {
      // Lenis lida perfeitamente com os pins do GSAP e oferece uma rolagem suave
      lenis.scrollTo("#contact", { 
        duration: 8.0, 
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) 
      });
    } else {
      // Fallback de segurança
      const contactEl = document.getElementById("contact");
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

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
          animate={isPreloaderDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 1.6, duration: 1.0, ease: "easeOut" }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 w-full pointer-events-auto"
        >
          {/* Metadados (Role, Focus, Stack) */}
          <div className="flex flex-col gap-1 font-sans text-[10px] sm:text-xs tracking-widest text-neutral-400 uppercase select-none">
            <p><strong className="text-neutral-600 font-bold">Cargo:</strong> {RESUME_DATA.personalInfo.role}</p>
            <p><strong className="text-neutral-600 font-bold">Foco:</strong> {RESUME_DATA.personalInfo.focus}</p>
            <p><strong className="text-neutral-600 font-bold">Stack:</strong> {RESUME_DATA.personalInfo.stack}</p>
          </div>
          
          <div className="flex items-center">
            <HeroButton onClick={handleScrollToContact} />
          </div>
        </motion.div>

      </div>
      
    </section>
  );
}
