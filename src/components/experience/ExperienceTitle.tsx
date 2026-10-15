"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMemo } from "react";
import type { Dictionary, Locale } from "@/dictionaries";
import type { Resume } from "@/data/resume";

interface ExperienceTitleProps {
  dict: Dictionary;
  resume: Resume;
  locale: Locale;
}

export function ExperienceTitle({ dict, resume, locale }: ExperienceTitleProps) {
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

  const yearsOfExperience = useMemo(() => {
    const allYears = resume.experiences.flatMap((exp) => {
      const matches = exp.period.match(/\b(19|20)\d{2}\b/g);
      return matches ? matches.map(Number) : [];
    });

    if (allYears.length === 0) return 1;

    const earliest = Math.min(...allYears);
    const current = new Date().getFullYear();
    return Math.max(1, current - earliest);
  }, [resume.experiences]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="w-full md:w-1/2 flex flex-col items-center md:items-start md:sticky md:top-[30svh] h-fit self-start pt-12 md:pt-0 md:pl-4 lg:pl-8 z-20"
    >
      <p aria-hidden="true" className="font-mono text-xs uppercase tracking-widest text-subtle">05 —</p>
      <h2 id="experience-title" className="mt-3 text-3xl lg:text-4xl font-serif text-ink tracking-[0.1em] text-center md:text-left uppercase break-words w-full">
        {dict.experience.title}
      </h2>

      <div className="mt-6 flex flex-col items-center md:items-start">
        <span className="font-mono text-foreground text-lg md:text-xl mb-1 text-center md:text-left">
          {yearsOfExperience}+ {dict.experience.years}
        </span>
        <p className="text-muted font-sans text-sm md:text-base leading-relaxed max-w-sm text-center md:text-left">
          {dict.experience.description}
        </p>
      </div>

      <motion.a
        href={`/cv_${locale}.pdf`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ boxShadow: "0px 0px 0px transparent" }}
        whileInView={{ boxShadow: "0px 0px 15px var(--foreground)" }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1.5, delay: 0.8 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ x: mouseX, y: mouseY }}
        className="mt-10 group relative flex items-center justify-center gap-3 px-8 py-4 border border-line rounded-full font-mono text-xs uppercase tracking-widest text-ink/80 hover:text-ink hover:border-foreground transition-colors duration-500 overflow-hidden focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
      >
        <span className="relative z-10">{dict.experience.downloadCV}</span>
        <svg aria-hidden="true" className="relative z-10 w-4 h-4 transform group-hover:translate-y-1 transition-transform duration-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <div className="absolute inset-0 bg-foreground opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
      </motion.a>
    </motion.div>
  );
}
