"use client";

import { useRef } from "react";
import { motion, useScroll, useInView } from "framer-motion";
import { useIsTouch } from "@/hooks/useIsTouch";

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

function ExperienceItemCard({ exp, i, total }: { exp: ExperienceItem; i: number; total: number }) {
  const internalRef = useRef<HTMLLIElement>(null);
  const isInView = useInView(internalRef, { margin: "-40% 0px -40% 0px" });
  const isTouch = useIsTouch();

  const isActive = isTouch ? isInView : false;

  return (
    <motion.li 
      ref={internalRef}
      data-active={isActive}
      key={exp.id} 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
      className="group relative flex flex-col py-8 md:py-12 border-t border-white/5 first:border-t-transparent transition-colors hover:bg-white/[0.02] px-4 md:pl-12 md:pr-8 -mx-4 md:-mx-8 md:mx-0 rounded-2xl select-none cursor-default"
    >
      <div aria-hidden="true" className={`hidden md:block absolute left-0 top-0 bottom-0 w-[1px] transition-colors duration-300 md:duration-500 ${i === total - 1 ? 'bg-gradient-to-b from-white/5 to-transparent group-hover:from-white/10 group-data-[active=true]:from-white/10' : 'bg-white/5 group-hover:bg-white/10 group-data-[active=true]:bg-white/10'}`}>
        <motion.div 
          aria-hidden="true"
          initial={{ backgroundColor: "rgb(23,23,23)", borderColor: "rgba(255,255,255,0.2)", boxShadow: "0px 0px 0px transparent" }}
          whileInView={{ backgroundColor: "var(--foreground)", borderColor: "var(--foreground)", boxShadow: "0px 0px 12px var(--foreground)" }}
          viewport={{ once: false, margin: "1000px 0px -50% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute top-12 -left-[5px] w-3 h-3 rounded-full border border-white/20 bg-neutral-900 group-hover:bg-[var(--foreground)] group-data-[active=true]:bg-[var(--foreground)] group-hover:border-[var(--foreground)] group-data-[active=true]:border-[var(--foreground)] group-hover:shadow-[0_0_12px_var(--foreground)] group-data-[active=true]:shadow-[0_0_12px_var(--foreground)]" 
        />
      </div>

      <span className="text-[var(--foreground)] text-[10px] font-bold uppercase tracking-widest mb-3 font-sans">
        {exp.company} <span aria-hidden="true" className="text-white/30 mx-2">&bull;</span> {exp.period}
      </span>
      
      <h3 className="text-xl md:text-3xl font-serif text-white mb-2 transform-gpu transition-transform duration-300 md:duration-700 ease-out group-hover:translate-x-3 group-data-[active=true]:translate-x-3">
        {exp.role}
      </h3>
      
      <p className="text-neutral-300 md:text-neutral-400 text-xs md:text-sm leading-loose md:leading-relaxed mb-6 max-w-2xl font-sans transition-colors duration-300 md:duration-500 group-hover:text-neutral-300 group-data-[active=true]:text-neutral-300">
        {exp.description}
      </p>
      
      <div className="flex flex-wrap items-center mt-2">
        {exp.skills.map((skill, index) => (
          <span 
            key={skill} 
            className="text-[9px] sm:text-[10px] text-neutral-500 font-sans tracking-widest uppercase transition-colors duration-300 md:duration-500 group-hover:text-neutral-300 md:text-neutral-400 group-data-[active=true]:text-neutral-300 md:text-neutral-400"
          >
            {skill}
            {index < exp.skills.length - 1 && (
              <span aria-hidden="true" className="text-white/20 mx-2">&bull;</span>
            )}
          </span>
        ))}
      </div>
    </motion.li>
  );
}

export function ExperienceList({ experiences }: ExperienceListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start center", "end center"]
  });

  return (
    <div ref={listRef} className="relative w-full md:w-1/2 lg:w-1/2 flex flex-col mt-8 md:mt-0">
      <div aria-hidden="true" className="hidden md:block absolute md:left-0 top-16 bottom-16 w-[1px] bg-transparent z-10">
        <motion.div 
          className="w-full bg-[var(--foreground)] origin-top shadow-[0_0_15px_var(--foreground)]"
          style={{ scaleY: scrollYProgress, height: '100%' }}
        />
      </div>

      <ol className="w-full relative">
        {experiences.map((exp, i) => (
          <ExperienceItemCard key={exp.id} exp={exp} i={i} total={experiences.length} />
        ))}
      </ol>
    </div>
  );
}
