"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  hover: { 
    scale: 1.05, 
    borderColor: "var(--foreground)", 
    transition: { duration: 0.3 } 
  },
  tap: { scale: 0.95 }
};

const backgroundVariants: Variants = {
  initial: { y: "101%" },
  animate: { y: "101%" },
  hover: { y: "0%" }
};

const textVariants: Variants = {
  initial: { color: "rgb(255,255,255)" },
  animate: { color: "rgb(255,255,255)" },
  hover: { color: "var(--background)" }
};

export function HeroButton({
  className,
  ...props
}: HTMLMotionProps<"button">) {
  return (
    <motion.button
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
      className={cn(
        "relative px-6 py-2 rounded-full font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold overflow-hidden pointer-events-auto",
        "bg-transparent flex items-center justify-center border border-white/20",
        className
      )}
      {...props}
    >
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundColor: "var(--foreground)" }}
        variants={backgroundVariants}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.span
        className="relative z-10"
        variants={textVariants}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        Iniciar projeto
      </motion.span>
    </motion.button>
  );
}
