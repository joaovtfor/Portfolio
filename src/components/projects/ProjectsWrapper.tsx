"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ProjectCard } from "./ProjectCard";
import { PROJECTS_DATA } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

export function ProjectsWrapper() {
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

      const tween = gsap.to(scrollContainer, {
        x: scrollAmount,
        ease: "none",
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
        }
      });

      let containerLeft = scrollContainer.getBoundingClientRect().left;
      const cachedCards = cardsRef.current.map(card => {
        if (!card) return null;
        return {
          offsetLeft: card.offsetLeft,
          offsetWidth: card.offsetWidth
        };
      });

      const updateMetrics = () => {
        containerLeft = scrollContainer.getBoundingClientRect().left;
      };

      window.addEventListener("scroll", updateMetrics, { passive: true });
      window.addEventListener("resize", updateMetrics, { passive: true });

      const updateCards = () => {
        if (!cardsRef.current || !scrollContainer) return;
        
        const windowCenter = window.innerWidth / 2;
        
        cardsRef.current.forEach((card, i) => {
          if (!card || !cachedCards[i]) return;
          
          const cached = cachedCards[i]!;
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

      gsap.ticker.add(updateCards);

      return () => {
        gsap.ticker.remove(updateCards);
        window.removeEventListener("scroll", updateMetrics);
        window.removeEventListener("resize", updateMetrics);
      };
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full h-[70vh] md:h-screen bg-transparent z-20 pointer-events-none"
    >
      <div 
        className="w-full h-full flex items-center overflow-x-auto md:overflow-hidden snap-x snap-mandatory hide-scrollbar"
        style={{ 
          perspective: "1500px",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)" 
        }}
      >
        <div 
          ref={scrollRef} 
          className="relative flex items-center h-full w-max px-8 md:pl-[12vw] md:pr-[calc(50vw-300px)] gap-6 md:gap-10 pointer-events-auto"
        >
          <div className="flex-shrink-0 flex flex-col justify-center w-[300px] md:w-[400px] mr-2 md:mr-16 snap-center md:snap-align-none">
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-serif text-white tracking-[0.1em] select-none uppercase">
              Projetos
            </h2>
            <p className="text-neutral-400 font-sans text-[clamp(0.875rem,2vw,1rem)] mt-2 leading-relaxed">
              Unindo design refinado e código escalável para entregar <span className="text-[var(--foreground)] font-medium">soluções digitais únicas</span>, convertendo complexidade em conversão e performance.
            </p>
            
            <div className="flex md:hidden items-center gap-3 mt-8 text-neutral-500 animate-pulse">
              <span className="text-[10px] tracking-widest uppercase font-bold font-sans">Deslize para explorar</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </div>

          {PROJECTS_DATA.map((project, i) => (
            <ProjectCard 
              key={project.id}
              project={project} 
              index={String(i + 1).padStart(2, "0")}
              cardRef={(el) => { cardsRef.current[i] = el; }} 
            />
          ))}
        </div>
      </div>

      <div 
        ref={progressBarContainerRef}
        className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 w-[80vw] max-w-[1200px] h-[1px] bg-white/10 z-30 pointer-events-none opacity-0"
      >
        <div 
          ref={progressBarRef} 
          className="w-full h-full bg-[var(--foreground)] origin-left shadow-[0_0_10px_var(--foreground)]" 
          style={{ transform: "scaleX(0)" }}
        />
      </div>

    </section>
  );
}
