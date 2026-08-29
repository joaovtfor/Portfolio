"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Dictionary } from "@/dictionaries";

interface HeroButtonProps extends HTMLMotionProps<"button"> {
  dict: Dictionary;
}

export function HeroButton({
  className,
  dict,
  ...props
}: HeroButtonProps) {
  return (
    <motion.button
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
        hover: { 
          scale: 1.05, 
          borderColor: "var(--foreground)", 
          transition: { duration: 0.3 } 
        },
        tap: { scale: 0.95 }
      }}
      className={cn(
        "relative px-6 py-2 rounded-full font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold overflow-hidden pointer-events-auto",
        "bg-transparent flex items-center justify-center border border-white/20 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none",
        className
      )}
      aria-label={dict.hero.scrollText}
      {...props}
    >
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundColor: "var(--foreground)" }}
        variants={{
          initial: { y: "101%" },
          animate: { y: "101%" },
          hover: { y: "0%" }
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.span
        className="relative z-10"
        variants={{
          initial: { color: "#ffffff" },
          animate: { color: "#ffffff" },
          hover: { color: "var(--background)" }
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {dict.hero.scrollText}
      </motion.span>
    </motion.button>
  );
}
