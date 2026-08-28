"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { RESUME_DATA } from "@/data/resume";

const yearsOfExperience = (() => {
  const allYears = RESUME_DATA.experiences.flatMap((exp) => {
    const matches = [exp.period].join(" ").match(/\b(19|20)\d{2}\b/g);
    return matches ? matches.map(Number) : [];
  });
  if (allYears.length === 0) return 1;
  const earliest = Math.min(...allYears);
  const current = new Date().getFullYear();
  return Math.max(1, current - earliest);
})();

export function ExperienceTitle() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.25);
    y.set((e.clientY - centerY) * 0.25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="w-full md:w-1/2 lg:w-1/2 flex flex-col items-center md:items-start md:sticky md:top-[30svh] h-fit self-start pt-12 md:pt-0 md:pl-4 lg:pl-8 z-20"
    >
      <h2 className="text-2xl md:text-3xl lg:text-[clamp(2.5rem,4vw,4rem)] font-serif text-white tracking-[0.1em] select-none text-center md:text-left uppercase break-words w-full">
        Experiência
      </h2>
      
      <div className="mt-6 flex flex-col items-center md:items-start">
        <span className="text-[var(--foreground)] font-serif italic text-lg md:text-xl mb-1 text-center md:text-left">
          Há {yearsOfExperience} anos
        </span>
        <p className="text-neutral-400 font-sans text-sm md:text-base leading-relaxed max-w-sm text-center md:text-left">
          ... em uma jornada dedicada a construir arquiteturas robustas e interfaces de alta performance, unindo design de ponta à engenharia de software.
        </p>
      </div>
      
      <motion.a 
        href="/cv_pt.pdf" 
        target="_blank"
        rel="noopener noreferrer"
        initial={{ boxShadow: "0px 0px 0px transparent" }}
        whileInView={{ boxShadow: "0px 0px 15px var(--foreground)" }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1.5, delay: 0.8 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ x: mouseX, y: mouseY }}
        className="mt-10 group relative flex items-center justify-center gap-3 px-8 py-4 border border-white/10 rounded-full text-[10px] md:text-xs font-sans uppercase tracking-widest text-white/80 hover:text-white hover:border-[var(--foreground)] transition-colors duration-500 overflow-hidden"
      >
        <span className="relative z-10">Baixar Currículo</span>
        <svg className="relative z-10 w-4 h-4 transform group-hover:translate-y-1 transition-transform duration-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <div className="absolute inset-0 bg-[var(--foreground)] opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
      </motion.a>
    </motion.div>
  );
}
