"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ProjectCard } from "./ProjectCard";
import type { Dictionary, Locale } from "@/dictionaries";
import type { Project } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

interface ProjectsWrapperProps {
  dict: Dictionary;
  projects: Project[];
  locale: Locale;
}

// Converte "texto <highlight>destaque</highlight> texto" em nós React (sem innerHTML).
function renderHighlight(text: string) {
  const [before, rest = ""] = text.split("<highlight>");
  const [highlight, after = ""] = rest.split("</highlight>");
  return (
    <>
      {before}
      {highlight && <span className="text-foreground font-medium">{highlight}</span>}
      {after}
    </>
  );
}

export function ProjectsWrapper({ dict, projects, locale }: ProjectsWrapperProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressBarContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const scrollContainer = scrollRef.current;
    if (!section || !scrollContainer) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const scrollAmount = () => -(scrollContainer.scrollWidth - window.innerWidth);

      // Métricas de layout (sem transform) recalculadas a cada refresh do ScrollTrigger (load/resize).
      let containerBaseLeft = 0;
      let cachedCards: ({ offsetLeft: number; offsetWidth: number } | null)[] = [];

      const cacheMetrics = () => {
        containerBaseLeft = scrollContainer.parentElement?.getBoundingClientRect().left ?? 0;
        cachedCards = cardsRef.current.map((card) =>
          card ? { offsetLeft: card.offsetLeft, offsetWidth: card.offsetWidth } : null
        );
      };

      // Executa apenas quando o deslocamento horizontal muda (inclusive durante a suavização do scrub).
      const updateCards = () => {
        const containerLeft = containerBaseLeft + Number(gsap.getProperty(scrollContainer, "x"));
        const windowCenter = window.innerWidth / 2;

        cardsRef.current.forEach((card, i) => {
          const cached = cachedCards[i];
          if (!card || !cached) return;

          const cardCenter = containerLeft + cached.offsetLeft + (cached.offsetWidth / 2);
          const distance = cardCenter - windowCenter;
          const progress = distance / (window.innerWidth * 0.8);

          const rotateY = progress * -15;
          const scale = 1 - Math.abs(progress) * 0.05;
          const z = -Math.abs(progress) * 50;
          const opacity = 1 - Math.abs(progress) * 0.2;
          const zIndex = Math.round((1 - Math.abs(progress)) * 100);

          gsap.set(card, {
            rotateY,
            scale,
            z,
            opacity,
            zIndex,
            transformPerspective: 1200,
            transformOrigin: "center center"
          });
        });
      };

      const tween = gsap.to(scrollContainer, {
        x: scrollAmount,
        ease: "none",
        onUpdate: updateCards,
      });

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${scrollContainer.scrollWidth - window.innerWidth}`,
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true,
        snap: {
          snapTo: (value) => {
            const maxScroll = scrollContainer.scrollWidth - window.innerWidth;
            const windowCenter = window.innerWidth / 2;
            const points = [0];
            
            cardsRef.current.forEach((card) => {
              if (card) {
                let targetX = (card.offsetLeft + card.offsetWidth / 2) - windowCenter;
                targetX = Math.max(0, Math.min(targetX, maxScroll));
                points.push(targetX / maxScroll);
              }
            });

            return points.reduce((prev, curr) => 
              Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
            );
          },
          duration: { min: 0.2, max: 0.6 },
          delay: 0.0,
          ease: "power2.out"
        },
        onUpdate: (self) => {
          if (progressBarRef.current) {
            gsap.set(progressBarRef.current, { scaleX: self.progress });
          }
        },
        onToggle: (self) => {
          if (progressBarContainerRef.current) {
            gsap.to(progressBarContainerRef.current, {
              opacity: self.isActive ? 1 : 0,
              duration: 0.4,
              ease: "power2.out"
            });
          }
        },
        onRefresh: () => {
          cacheMetrics();
          updateCards();
        }
      });

      return () => {
        // Transforms aplicados nos callbacks não são registrados no contexto do matchMedia.
        gsap.set(cardsRef.current.filter(Boolean), { clearProps: "transform,opacity,zIndex" });
      };
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      id="work"
      data-scene="work"
      aria-labelledby="work-title"
      className="relative w-full h-[80svh] md:h-screen bg-transparent z-20 pointer-events-none"
    >
      <div 
        className="w-full h-full flex items-center overflow-x-auto md:overflow-hidden snap-x snap-mandatory mask-fade-x"
        style={{ perspective: "1500px" }}
      >
        <div 
          ref={scrollRef} 
          className="relative flex items-center h-full w-max px-8 md:pl-[12vw] md:pr-[calc(50vw-300px)] gap-6 md:gap-10 pointer-events-auto"
        >
          <div className="flex-shrink-0 flex flex-col justify-center w-[260px] md:w-[480px] mr-2 md:mr-16 snap-center md:snap-align-none">
            <p aria-hidden="true" className="font-mono text-xs uppercase tracking-widest text-subtle">03 —</p>
            <h2 id="work-title" className="mt-3 text-3xl md:text-4xl font-serif text-ink tracking-[0.1em] uppercase">
              {dict.projects.title}
            </h2>
            <p className="text-muted font-sans text-sm md:text-base mt-3 leading-relaxed">
              {renderHighlight(dict.projects.description)}
            </p>
            
            <div className="flex md:hidden items-center gap-3 mt-8 text-subtle animate-pulse">
              <span className="font-mono text-xs tracking-widest uppercase font-bold">{dict.projects.mobileHint}</span>
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </div>

          {projects.map((project, i) => (
            <ProjectCard 
              key={project.slug}
              project={project} 
              dict={dict}
              locale={locale}
              index={String(i + 1).padStart(2, "0")}
              cardRef={(el) => { cardsRef.current[i] = el; }} 
            />
          ))}
        </div>
      </div>

      <div 
        ref={progressBarContainerRef}
        className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 w-[80vw] max-w-[1200px] h-[1px] bg-line z-30 pointer-events-none opacity-0"
      >
        <div 
          ref={progressBarRef} 
          className="w-full h-full bg-foreground origin-left shadow-glow-strong" 
          style={{ transform: "scaleX(0)" }}
        />
      </div>

    </section>
  );
}
