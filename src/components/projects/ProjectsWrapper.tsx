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

  useGSAP(() => {
    const section = sectionRef.current;
    const scrollContainer = scrollRef.current;
    if (!section || !scrollContainer) return;

    // Cálculo do scroll horizontal baseado na largura total dos itens vs largura da tela
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
      scrub: 1, // Suavidade para interligar ao scroll vertical
      invalidateOnRefresh: true, // Responsividade absoluta no resize
    });

    // Ticker para o efeito côncavo 3D em tempo real
    const updateCards = () => {
      if (!cardsRef.current || !scrollContainer) return;
      
      const windowCenter = window.innerWidth / 2;
      const containerRect = scrollContainer.getBoundingClientRect();
      
      cardsRef.current.forEach((card) => {
        if (!card) return;
        
        // Correção de Glitch (Feedback Loop): 
        // Não usar card.getBoundingClientRect() pois ele lê os transforms já aplicados (rotateY, scale),
        // o que causa tremedeira quando interagimos (hover) ou atualizamos as propriedades.
        // A matemática abaixo calcula o centro exato ignorando as transformações 3D:
        const cardCenter = containerRect.left + card.offsetLeft + (card.offsetWidth / 2);
        
        // Distância do centro do cartão até o centro da tela
        const distance = cardCenter - windowCenter;
        
        // Normaliza a distância (-1 para borda esquerda, 0 para centro, 1 para borda direita)
        // Usamos um valor um pouco maior que a largura da tela para suavizar a curva
        const progress = distance / (window.innerWidth * 0.8);
        
        // Matemática do Côncavo (Cilindro Interno) - Curvatura suavizada
        // Cartões na direita viram para a esquerda (-Y), cartões na esquerda viram para a direita (+Y)
        const rotateY = progress * -15; // Reduzido de -35 para -15
        
        // Encolhe levemente nas bordas
        const scale = 1 - Math.abs(progress) * 0.05; // Reduzido de 0.15 para 0.05
        
        // Empurra para trás no eixo Z criando profundidade
        const z = -Math.abs(progress) * 50; // Reduzido de 150 para 50
        
        // Escurece um pouco os cartões que não estão no foco
        const opacity = 1 - Math.abs(progress) * 0.2; // Reduzido de 0.3 para 0.2
        
        // Ajuste de zIndex dinâmico para evitar que as bordas giradas 3D roubem o clique do card central
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
    };

  }, { scope: sectionRef });

  return (
    // z-20 para garantir que passe por cima do canvas de fundo 
    <section 
      ref={sectionRef} 
      className="relative w-full h-screen bg-transparent z-20 flex items-center overflow-hidden pointer-events-none" 
      style={{ perspective: "1500px" }}
    >
      
      {/* 
        Container de Scroll: 
        Começa alinhado à esquerda (pl-[10vw]) para a introdução.
        Termina com padding dinâmico (pr-[50vw-300px]) para o último card ficar exatamente no centro no final do scroll.
        Removido o transformStyle: preserve-3d para que o zIndex do React domine os hitboxes do hover.
      */}
      <div 
        ref={scrollRef} 
        className="relative flex items-center h-full w-max pl-[6vw] md:pl-[12vw] pr-[calc(50vw-160px)] md:pr-[calc(50vw-300px)] gap-6 md:gap-10 pointer-events-auto"
      >
        
        {/* Intro (Esquerda) */}
        <div className="flex-shrink-0 flex flex-col justify-center w-[300px] md:w-[400px] mr-8 md:mr-16">
          <span className="text-[var(--foreground)] font-bold tracking-widest text-xs uppercase mb-4">
            Portfólio
          </span>
          <h2 className="text-5xl md:text-7xl font-serif text-white leading-tight">
            Selected<br />Works
          </h2>
          <p className="text-neutral-400 mt-6 font-sans text-sm md:text-base max-w-sm leading-relaxed">
            Uma curadoria de projetos focados em performance, arquitetura robusta e interações imersivas feitas sob medida.
          </p>
        </div>

        {PROJECTS_DATA.map((project, i) => (
          <ProjectCard 
            key={project.id}
            project={project} 
            cardRef={(el) => { cardsRef.current[i] = el; }} 
          />
        ))}
      </div>

    </section>
  );
}
