"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 700, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) {
      const moveCursor = (e: MouseEvent) => {
        cursorX.set(e.clientX - 16); 
        cursorY.set(e.clientY - 16);
      };
      
      const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (
          target.closest('a') || 
          target.closest('button') || 
          target.closest('[data-cursor="hover"]')
        ) {
          setIsHovered(true);
        } else {
          setIsHovered(false);
        }
      };

      window.addEventListener("mousemove", moveCursor);
      window.addEventListener("mouseover", handleMouseOver);
      
      return () => {
        window.removeEventListener("mousemove", moveCursor);
        window.removeEventListener("mouseover", handleMouseOver);
      };
    }
  }, [cursorX, cursorY]);

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
      animate={{
        scale: isHovered ? 1.5 : 0.4,
        backgroundColor: isHovered ? "var(--foreground)" : "rgb(255,255,255)",
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    />
  );
}
