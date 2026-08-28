"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";

interface Project {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  image: string;
  link?: string;
  isPrivate?: boolean;
}

interface ProjectCardProps {
  project: Project;
  cardRef: (el: HTMLDivElement | null) => void;
  index?: string;
}

export function ProjectCard({ project, cardRef, index }: ProjectCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  const internalRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(internalRef, { margin: "0px -40% 0px -40%" });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, []);

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
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const CardContent = (
    <div
      ref={setRefs}
      data-active={isActive}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex-shrink-0 w-[75vw] sm:w-[320px] h-[220px] md:w-[600px] md:h-[400px] flex flex-col items-center justify-center border border-white/5 rounded-2xl overflow-hidden group cursor-pointer bg-black/40 backdrop-blur-md"
    >
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 group-data-[active=true]:opacity-100 transition-opacity duration-300 md:duration-700 ease-out overflow-hidden">
        <motion.img 
          src={project.image} 
          alt={project.title} 
          style={{ x: mouseX, y: mouseY }}
          className="w-[110%] h-[110%] -left-[5%] -top-[5%] absolute max-w-none object-cover scale-110 group-hover:scale-100 group-data-[active=true]:scale-100 transition-transform duration-500 md:duration-1000 ease-out" 
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full px-4 transform-gpu transition-transform duration-300 md:duration-700 ease-out group-hover:-translate-y-6 group-data-[active=true]:-translate-y-6">
        <h3 className="text-2xl md:text-4xl font-serif text-white group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] group-data-[active=true]:drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] transition-all duration-500 text-center">
          {project.title}
        </h3>
        <span className="mt-4 md:mt-6 text-[8px] md:text-[10px] tracking-[0.3em] text-neutral-200 md:text-neutral-300 md:text-neutral-500 font-sans uppercase font-bold group-hover:text-[var(--foreground)] group-data-[active=true]:text-[var(--foreground)] group-hover:drop-shadow-[0_0_10px_rgba(133,232,234,0.5)] group-data-[active=true]:drop-shadow-[0_0_10px_rgba(133,232,234,0.5)] transition-all duration-500 text-center">
          {project.subtitle}
        </span>
        
        {project.description && (
          <div className="absolute top-full mt-4 w-[90%] md:w-[75%] opacity-0 group-hover:opacity-100 group-data-[active=true]:opacity-100 transition-opacity duration-300 md:duration-700 delay-100 ease-out">
            <p className="text-[9px] md:text-sm text-neutral-200 md:text-neutral-300 font-sans text-center leading-relaxed font-light">
              {project.description}
            </p>
          </div>
        )}
      </div>

      {project.isPrivate && (
        <div className="absolute top-4 md:top-5 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 w-[120px] h-[28px] bg-white/5 border border-white/10 rounded-full text-white/70 text-[10px] uppercase tracking-widest font-sans backdrop-blur-md z-20">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Privado
        </div>
      )}

      {!project.isPrivate && project.link && (
        <div className="absolute top-6 right-6 md:top-8 md:right-8 opacity-0 -translate-x-4 translate-y-4 group-hover:opacity-100 group-data-[active=true]:opacity-100 group-hover:translate-x-0 group-data-[active=true]:translate-x-0 group-hover:translate-y-0 group-data-[active=true]:translate-y-0 transition-all duration-300 md:duration-700 ease-out z-20 text-white drop-shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </div>
      )}

      {index && (
        <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20 text-white/30 font-serif text-lg md:text-xl italic font-light select-none">
          {index}
        </div>
      )}
    </div>
  );

  if (project.link && !project.isPrivate) {
    return (
      <a 
        href={project.link} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block outline-none flex-shrink-0 snap-center md:snap-align-none perspective-1000 transform-style-3d"
      >
        {CardContent}
      </a>
    );
  }

  return (
    <div className="block outline-none flex-shrink-0 snap-center md:snap-align-none perspective-1000 transform-style-3d">
      {CardContent}
    </div>
  );
}
