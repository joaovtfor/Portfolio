"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";

export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const setPreloaderDone = useUIStore((state) => state.setPreloaderDone);

  useEffect(() => {
    let current = 0;
    
    // Simula o progresso de carregamento de forma cinemática e rápida
    const updateProgress = () => {
      // Velocidade aleatória para parecer um carregamento real
      current += Math.random() * 15;
      
      if (current >= 100) {
        current = 100;
        setProgress(100);
        // Pequena pausa no 100% para o usuário ler, antes de abrir a cortina
        setTimeout(() => {
          setIsLoading(false);
          setPreloaderDone(); // Avisa o restante do site que a animação inicial pode começar
        }, 500); 
      } else {
        setProgress(Math.floor(current));
        requestAnimationFrame(() => setTimeout(updateProgress, 30));
      }
    };
    
    // Inicia após um curtíssimo delay
    setTimeout(updateProgress, 100);
  }, [setPreloaderDone]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[10000] bg-background flex flex-col items-center justify-center pointer-events-none"
        >
          <div className="flex flex-col items-center gap-4">
            {/* Logo / Monograma */}
            <span className="font-serif text-[var(--foreground)] text-4xl md:text-5xl font-bold tracking-widest flex items-center">
              <span className="text-white mr-1">&gt;</span>_
            </span>
            
            {/* Contador */}
            <div className="text-white/40 font-mono text-sm tracking-[0.3em] mt-4 flex items-center gap-4">
              <div className="w-[100px] h-[1px] bg-white/10 relative overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-[var(--foreground)]"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <span className="w-8 text-right">{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
