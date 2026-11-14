"use client";

import { motion, Variants } from "framer-motion";
import { useUIStore } from "@/store/uiStore";

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.6 },
  },
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 80, filter: "blur(15px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] }
  },
};

interface HeroTitleProps {
  name: string;
  /** Primeira carga: a abertura (Preloader) entrega o nome já montado nesta posição. */
  fromIntro: boolean;
}

export function HeroTitle({ name, fromIntro }: HeroTitleProps) {
  const introDone = useUIStore((state) => state.introPhase === "done");
  const title = name.toUpperCase();
  const letters = title.split("");

  return (
    <motion.div
      variants={containerVariants}
      // Vindo da abertura não há segunda animação: o h1 só assume o lugar do nome dela.
      // Ao voltar para a home por navegação, o nome entra letra a letra.
      initial={fromIntro ? false : "hidden"}
      animate="show"
      className="flex items-center justify-center w-full z-10 pointer-events-none"
    >
      <h1
        data-intro-target
        aria-label={name}
        // Invisível (mas ainda na árvore de acessibilidade) enquanto o nome da abertura está na tela.
        // Sem `cn`: o tailwind-merge trata `text-hero` e `text-ink` como conflito e descarta o tamanho.
        className={`font-serif text-hero font-medium tracking-normal leading-none uppercase text-ink mix-blend-difference whitespace-nowrap flex${
          fromIntro && !introDone ? " motion-safe:opacity-0" : ""
        }`}
      >
        {letters.map((char, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            variants={letterVariants}
            whileHover={{
              scale: 1.05,
              y: -10,
              transition: { duration: 0.2, type: "spring", stiffness: 300 }
            }}
            className="pointer-events-auto cursor-default"
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
