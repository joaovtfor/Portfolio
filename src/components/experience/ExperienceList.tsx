"use client";

import { useRef } from "react";
import { motion, useScroll } from "framer-motion";

export interface ExperienceItem {
  id: number;
  period: string;
  company?: string;
  role: string;
  description: string;
  skills: string[];
}

interface ExperienceListProps {
  experiences: ExperienceItem[];
}

export function ExperienceList({ experiences }: ExperienceListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start center", "end center"]
  });

  return (
    <div ref={listRef} className="relative md:w-3/5 lg:w-2/3 flex flex-col w-full mt-8 md:mt-0">
      
      {/* Linha de Progresso Global (Acende com o Scroll) */}
      <div className="hidden md:block absolute left-[31px] md:left-0 top-16 bottom-16 w-[1px] bg-transparent z-10">
        <motion.div 
          className="w-full bg-[var(--foreground)] origin-top shadow-[0_0_15px_var(--foreground)]"
          style={{ scaleY: scrollYProgress, height: '100%' }}
        />
      </div>

      {experiences.map((exp, i) => (
        <motion.div 
          key={exp.id} 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
          className="group relative flex flex-col py-8 md:py-12 border-t border-white/5 first:border-t-transparent transition-colors hover:bg-white/[0.02] px-4 md:pl-12 md:pr-8 -mx-4 md:-mx-8 md:mx-0 rounded-2xl select-none cursor-default"
        >
          {/* Timeline Line & Dot (Desktop only) */}
          <div className={`hidden md:block absolute left-0 top-0 bottom-0 w-[1px] transition-colors duration-500 ${i === experiences.length - 1 ? 'bg-gradient-to-b from-white/5 to-transparent group-hover:from-white/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
            <motion.div 
              initial={{ backgroundColor: "#171717", borderColor: "rgba(255,255,255,0.2)", boxShadow: "0px 0px 0px rgba(133,232,234,0)" }}
              whileInView={{ backgroundColor: "var(--foreground)", borderColor: "var(--foreground)", boxShadow: "0px 0px 12px var(--foreground)" }}
              viewport={{ once: false, margin: "1000px 0px -50% 0px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute top-12 -left-[5px] w-3 h-3 rounded-full border border-white/20 bg-neutral-900 group-hover:bg-[var(--foreground)] group-hover:border-[var(--foreground)] group-hover:shadow-[0_0_12px_var(--foreground)]" 
            />
          </div>

          {/* Company and Date */}
          <span className="text-[var(--foreground)] text-[10px] font-bold uppercase tracking-widest mb-3 font-sans">
            {exp.company} <span className="text-white/30 mx-2">&bull;</span> {exp.period}
          </span>
          
          {/* Role - Microinteração de deslocamento ultra-suave */}
          <h3 className="text-xl md:text-3xl font-serif text-white mb-2 transform-gpu transition-transform duration-700 ease-out group-hover:translate-x-3">
            {exp.role}
          </h3>
          
          {/* Description */}
          <p className="text-neutral-400 text-xs md:text-sm leading-relaxed mb-6 max-w-2xl font-sans transition-colors duration-500 group-hover:text-neutral-300">
            {exp.description}
          </p>
          
          {/* Skills (Editorial Layout) */}
          <div className="flex flex-wrap items-center mt-2">
            {exp.skills.map((skill, index) => (
              <span 
                key={skill} 
                className="text-[9px] sm:text-[10px] text-neutral-500 font-sans tracking-widest uppercase transition-colors duration-500 group-hover:text-neutral-400"
              >
                {skill}
                {index < exp.skills.length - 1 && (
                  <span className="text-white/10 mx-2 font-light">/</span>
                )}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
