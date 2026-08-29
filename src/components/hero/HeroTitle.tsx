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
}

export function HeroTitle({ name }: HeroTitleProps) {
  const isPreloaderDone = useUIStore((state) => state.isPreloaderDone);
  const title = name || "JOÃO DE FOR";
  const letters = title.split("");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isPreloaderDone ? "show" : "hidden"}
      className="flex items-center justify-center w-full z-10 select-none pointer-events-none"
    >
      <h1 aria-label={title} className="font-serif text-[clamp(2.5rem,10vw,12rem)] font-medium tracking-normal leading-none uppercase text-white mix-blend-difference whitespace-nowrap flex select-none">
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
