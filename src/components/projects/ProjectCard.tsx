"use client";

interface Project {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

interface ProjectCardProps {
  project: Project;
  cardRef: (el: HTMLDivElement | null) => void;
}

export function ProjectCard({ project, cardRef }: ProjectCardProps) {
  return (
    <div
      ref={cardRef}
      className="relative flex-shrink-0 w-[320px] h-[220px] md:w-[600px] md:h-[400px] flex flex-col items-center justify-center border border-white/5 rounded-2xl overflow-hidden group cursor-pointer bg-black/40 backdrop-blur-md"
    >
      {/* Background Image (Hover Reveal) */}
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000 ease-out" 
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center transform-gpu transition-transform duration-500 group-hover:scale-105">
        <h3 className="text-3xl md:text-5xl font-serif text-white group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] transition-all duration-500 text-center px-4">
          {project.title}
        </h3>
        <span className="mt-4 md:mt-6 text-[8px] md:text-[10px] tracking-[0.3em] text-neutral-500 font-sans uppercase font-bold group-hover:text-neutral-300 group-hover:drop-shadow-md transition-all duration-500">
          {project.subtitle}
        </span>
      </div>
    </div>
  );
}
