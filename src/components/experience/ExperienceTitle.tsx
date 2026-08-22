"use client";

import { motion } from "framer-motion";

export function ExperienceTitle() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="w-full md:w-2/5 lg:w-1/3 flex flex-col items-center md:sticky md:top-32 h-fit self-start md:pl-4 lg:pl-8"
    >
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-white tracking-[0.1em] select-none text-center">
        EXPERIENCE
      </h2>
      
      <p className="text-neutral-400 mt-6 font-sans text-sm md:text-base leading-relaxed max-w-sm text-center">
        Uma jornada dedicada a construir arquiteturas robustas e interfaces de alta performance, unindo design de ponta à engenharia de software.
      </p>
      
      <motion.a 
        href="/cv.pdf" 
        target="_blank"
        rel="noopener noreferrer"
        initial={{ boxShadow: "0px 0px 0px rgba(133,232,234,0)" }}
        whileInView={{ boxShadow: "0px 0px 15px rgba(133,232,234,0.3)" }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1.5, delay: 0.8 }}
        className="mt-10 group relative flex items-center justify-center gap-3 px-8 py-4 border border-white/10 rounded-full text-[10px] md:text-xs font-sans uppercase tracking-widest text-white/80 hover:text-white hover:border-[var(--foreground)] transition-colors duration-500 overflow-hidden"
      >
        <span className="relative z-10">Baixar Currículo</span>
        <svg className="relative z-10 w-4 h-4 transform group-hover:translate-y-1 transition-transform duration-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {/* Efeito de brilho de fundo no hover */}
        <div className="absolute inset-0 bg-[var(--foreground)] opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
      </motion.a>
    </motion.div>
  );
}
