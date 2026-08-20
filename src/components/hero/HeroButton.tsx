"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export function HeroButton({
  className,
  ...props
}: HTMLMotionProps<"button">) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative px-6 py-2 rounded-full font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold overflow-hidden group pointer-events-auto",
        "bg-transparent text-white border border-white/20 hover:border-white/60",
        "transition-colors duration-500",
        className
      )}
      {...props}
    >
      {/* Efeito de Glow Interno (Hover) */}
      <div className="absolute inset-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <span className="relative z-10">Open to Work</span>
    </motion.button>
  );
}
