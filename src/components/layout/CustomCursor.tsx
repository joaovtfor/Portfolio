"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CURSOR_SIZE = 32;

export function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 700, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - CURSOR_SIZE / 2);
      cursorY.set(e.clientY - CURSOR_SIZE / 2);
    };

    // Rótulo contextual vem de `data-cursor-label` (ex.: "Ver" nos cards de projeto).
    const handleMouseOver = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const labelled = e.target.closest<HTMLElement>("[data-cursor-label]");
      setLabel(labelled?.dataset.cursorLabel ?? null);
      setIsHovered(Boolean(labelled || e.target.closest("a, button, [data-cursor='hover']")));
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  const scale = label ? 2.6 : isHovered ? 1.5 : 0.4;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] hidden md:flex items-center justify-center"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        mixBlendMode: label ? "normal" : "difference",
      }}
      animate={{
        scale,
        backgroundColor: isHovered ? "var(--foreground)" : "var(--ink)",
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {label && (
        <span className="font-mono text-[5px] font-bold uppercase tracking-widest text-background">
          {label}
        </span>
      )}
    </motion.div>
  );
}
