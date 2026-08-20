"use client";

import { motion, Variants } from "framer-motion";

export function HeroTitle() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center w-full z-10 select-none pointer-events-none"
    >
      <motion.h1 
        variants={itemVariants}
        className="font-serif text-[12vw] md:text-[10vw] font-medium tracking-normal leading-none uppercase text-white mix-blend-difference whitespace-nowrap"
      >
        João de For
      </motion.h1>
    </motion.div>
  );
}
