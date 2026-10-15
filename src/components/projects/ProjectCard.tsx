"use client";

import { useRef, ViewTransition } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import type { Dictionary, Locale } from "@/dictionaries";
import type { Project } from "@/data/projects";
import { useUIStore } from "@/store/uiStore";
import { useIsTouch } from "@/hooks/useIsTouch";

interface ProjectCardProps {
  project: Project;
  cardRef: (el: HTMLDivElement | null) => void;
  index: string;
  dict: Dictionary;
  locale: Locale;
}

export function ProjectCard({ project, cardRef, index, dict, locale }: ProjectCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  const internalRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(internalRef, { margin: "0px -40% 0px -40%" });
  const isTouch = useIsTouch();

  const setInteractivePosition = useUIStore((s) => s.setInteractivePosition);
  const clearInteractivePosition = useUIStore((s) => s.clearInteractivePosition);

  const isActive = isTouch ? isInView : false;

  const setRefs = (el: HTMLDivElement | null) => {
    internalRef.current = el;
    cardRef(el);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * -0.04);
    y.set((e.clientY - centerY) * -0.04);
    setInteractivePosition(project.slug, centerX, centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    clearInteractivePosition(project.slug);
  };

  // O `group` fica no link focável para que `group-focus-visible` reaja ao teclado.
  return (
    <Link
      href={`/${locale}/work/${project.slug}`}
      data-active={isActive}
      data-cursor-label={dict.cursor.view}
      aria-label={`${project.title} — ${dict.projects.viewCase}`}
      className="group block flex-shrink-0 snap-center md:snap-align-none rounded-2xl focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
    >
      <div
        ref={setRefs}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-[78vw] sm:w-[340px] h-[240px] md:w-[600px] md:h-[400px] flex flex-col items-center justify-center border border-line rounded-2xl overflow-hidden bg-surface/40 backdrop-blur-md"
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          <ViewTransition name={`project-${project.slug}`} share="morph" default="none">
            <motion.img
              src={project.image}
              alt=""
              loading="lazy"
              decoding="async"
              style={{ x: mouseX, y: mouseY }}
              className="w-[110%] h-[110%] -left-[5%] -top-[5%] absolute max-w-none object-cover scale-110 grayscale-[40%] group-hover:scale-100 group-hover:grayscale-0 group-data-[active=true]:scale-100 group-data-[active=true]:grayscale-0 group-focus-visible:scale-100 group-focus-visible:grayscale-0 transition-[transform,filter] duration-500 md:duration-1000 ease-out"
            />
          </ViewTransition>
          <div className="absolute inset-0 bg-background/75 group-hover:bg-background/55 group-data-[active=true]:bg-background/55 group-focus-visible:bg-background/55 transition-colors duration-500" />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full px-4 transform-gpu transition-transform duration-300 md:duration-700 ease-out group-hover:-translate-y-6 group-data-[active=true]:-translate-y-6 group-focus-visible:-translate-y-6">
          <h3 className="text-2xl md:text-4xl font-serif text-ink group-hover:drop-shadow-ink group-data-[active=true]:drop-shadow-ink transition-all duration-500 text-center">
            {project.title}
          </h3>
          <span className="mt-4 md:mt-6 font-mono text-xs tracking-[0.2em] text-muted uppercase text-center group-hover:text-foreground group-data-[active=true]:text-foreground group-focus-visible:text-foreground group-hover:drop-shadow-glow transition-colors duration-500">
            {project.subtitle}
          </span>

          <div className="absolute top-full mt-4 w-[90%] md:w-[75%] opacity-0 group-hover:opacity-100 group-data-[active=true]:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 md:duration-700 delay-100 ease-out">
            <p className="text-xs md:text-sm text-muted font-sans text-center leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>

        {project.isPrivate && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 px-3 h-7 bg-ink/5 border border-line rounded-full text-ink/70 font-mono text-xs uppercase tracking-widest backdrop-blur-md z-20">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            {dict.projects.private}
          </div>
        )}

        <div aria-hidden="true" className="absolute top-6 right-6 md:top-8 md:right-8 opacity-0 -translate-x-4 translate-y-4 group-hover:opacity-100 group-data-[active=true]:opacity-100 group-focus-visible:opacity-100 group-hover:translate-x-0 group-data-[active=true]:translate-x-0 group-focus-visible:translate-x-0 group-hover:translate-y-0 group-data-[active=true]:translate-y-0 group-focus-visible:translate-y-0 transition-all duration-300 md:duration-700 ease-out z-20 text-ink">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </div>

        <div aria-hidden="true" className="absolute top-6 left-6 md:top-8 md:left-8 z-20 font-mono text-xs text-ink/40 select-none">
          {index}
        </div>
      </div>
    </Link>
  );
}
