"use client";

import { useRef } from "react";
import { motion, useScroll, useInView } from "framer-motion";
import { useIsTouch } from "@/hooks/useIsTouch";
import type { ExperienceItem } from "@/data/resume";

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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
      className="group relative flex flex-col py-8 md:py-12 border-t border-line first:border-t-transparent transition-colors hover:bg-ink/[0.02] px-4 md:pl-12 md:pr-8 -mx-4 md:mx-0 rounded-2xl"
    >
      <div aria-hidden="true" className={`hidden md:block absolute left-0 top-0 bottom-0 w-[1px] transition-colors duration-500 ${i === total - 1 ? 'bg-gradient-to-b from-ink/5 to-transparent group-hover:from-ink/10 group-data-[active=true]:from-ink/10' : 'bg-ink/5 group-hover:bg-ink/10 group-data-[active=true]:bg-ink/10'}`}>
        <motion.div
          aria-hidden="true"
          initial={{ backgroundColor: "var(--surface)", borderColor: "var(--line)", boxShadow: "0px 0px 0px transparent" }}
          whileInView={{ backgroundColor: "var(--foreground)", borderColor: "var(--foreground)", boxShadow: "0px 0px 12px var(--foreground)" }}
          viewport={{ once: false, margin: "1000px 0px -50% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute top-12 -left-[5px] w-3 h-3 rounded-full border border-line bg-surface group-hover:bg-foreground group-data-[active=true]:bg-foreground group-hover:border-foreground group-data-[active=true]:border-foreground group-hover:shadow-glow-strong group-data-[active=true]:shadow-glow-strong"
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3 font-mono text-xs uppercase tracking-widest">
        <span className="text-foreground font-bold">{exp.company}</span>
        <span aria-hidden="true" className="text-ink/30">&bull;</span>
        <span className="text-subtle">{exp.period}</span>
        {exp.highlight && (
          <span className="ml-auto md:ml-0 px-2.5 py-1 rounded-full border border-foreground/40 text-foreground normal-case tracking-normal shadow-glow">
            {exp.highlight}
          </span>
        )}
      </div>

      <h3 className="text-xl md:text-3xl font-serif text-ink mb-2 transform-gpu transition-transform duration-300 md:duration-700 ease-out group-hover:translate-x-3 group-data-[active=true]:translate-x-3">
        {exp.role}
      </h3>

      <p className="text-muted text-sm leading-relaxed mb-6 max-w-2xl font-sans transition-colors duration-500 group-hover:text-ink/80 group-data-[active=true]:text-ink/80">
        {exp.description}
      </p>

      <ul className="flex flex-wrap items-center gap-y-1 font-mono text-xs text-subtle uppercase tracking-widest transition-colors duration-500 group-hover:text-muted group-data-[active=true]:text-muted">
        {exp.skills.map((skill, index) => (
          <li key={skill}>
            {skill}
            {index < exp.skills.length - 1 && (
              <span aria-hidden="true" className="text-ink/20 mx-2">&bull;</span>
            )}
          </li>
        ))}
      </ul>
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
    <div ref={listRef} className="relative w-full md:w-1/2 flex flex-col mt-8 md:mt-0">
      <div aria-hidden="true" className="hidden md:block absolute md:left-0 top-16 bottom-16 w-[1px] bg-transparent z-10">
        <motion.div
          className="w-full bg-foreground origin-top shadow-glow-strong"
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
