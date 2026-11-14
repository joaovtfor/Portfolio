"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroButtonProps extends HTMLMotionProps<"button"> {
  label: string;
}

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
  initial: { color: "var(--ink)" },
  animate: { color: "var(--ink)" },
  hover: { color: "var(--background)" }
};

export function HeroButton({
  className,
  label,
  ...props
}: HeroButtonProps) {
  return (
    <motion.button
      type="button"
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
      className={cn(
        "relative px-6 py-3 rounded-full font-mono text-xs uppercase tracking-[0.2em] font-bold overflow-hidden pointer-events-auto",
        "bg-transparent flex items-center justify-center gap-3 border border-ink/20 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none",
        className
      )}
      {...props}
    >
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none bg-foreground"
        variants={backgroundVariants}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.span
        className="relative z-10 flex items-center gap-3"
        variants={textVariants}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {label}
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
      </motion.span>
    </motion.button>
  );
}
