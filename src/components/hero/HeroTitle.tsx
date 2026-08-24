"use client";

import { motion, Variants } from "framer-motion";
import { useUIStore } from "@/store/uiStore";

export function HeroTitle() {
  const isPreloaderDone = useUIStore((state) => state.isPreloaderDone);
  const title = "JOÃO DE FOR";
  const letters = title.split("");

  // Orquestração do Container
  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      // Atraso aumentado para 0.6s, aguardando a cortina preta subir quase por completo
      // antes de iniciar a queda das letras.
      transition: { staggerChildren: 0.08, delayChildren: 0.6 },
    },
  };

  // Física de Entrada de cada Letra
  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 80, filter: "blur(15px)" },
    show: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] } // Easing de "Ease Out Expo"
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isPreloaderDone ? "show" : "hidden"}
      className="flex items-center justify-center w-full z-10 select-none pointer-events-none"
    >
      <h1 className="font-serif text-[12vw] md:text-[10vw] font-medium tracking-normal leading-none uppercase text-white mix-blend-difference whitespace-nowrap flex select-none">
        {letters.map((char, i) => (
          <motion.span
            key={i}
            variants={letterVariants}
            // Mantemos apenas a física de levante sem o glow para uma estética mais limpa
            whileHover={{
              scale: 1.05,
              y: -10, // Levanta levemente a letra
              transition: { duration: 0.2, type: "spring", stiffness: 300 }
            }}
            // select-none bloqueia a seleção de texto
            className="pointer-events-auto cursor-default select-none"
            style={{ 
              display: "inline-block",
              width: char === " " ? "0.3em" : "auto",
              willChange: "transform, filter"
            }}
          >
            {char}
          </motion.span>
        ))}
      </h1>
    </motion.div>
  );
}
