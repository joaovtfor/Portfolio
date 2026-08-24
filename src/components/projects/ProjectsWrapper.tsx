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
      snap: {
        snapTo: (value) => {
          // Calcula dinamicamente onde cada cartão fica perfeitamente centralizado
          const maxScroll = scrollContainer.scrollWidth - window.innerWidth;
          const windowCenter = window.innerWidth / 2;
          const points = [0]; // 0 é o bloco de introdução
          
          cardsRef.current.forEach((card) => {
            if (card) {
              // Encontra o centro do cartão
              let targetX = (card.offsetLeft + card.offsetWidth / 2) - windowCenter;
              // Previne valores impossíveis
              targetX = Math.max(0, Math.min(targetX, maxScroll));
              // Converte a posição horizontal em "progresso de scroll" de 0 a 1
              points.push(targetX / maxScroll);
            }
          });

          // Retorna o ponto mais próximo de onde o usuário soltou o scroll
          return points.reduce((prev, curr) => 
            Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
          );
        },
        duration: { min: 0.2, max: 0.6 },
        delay: 0.0, // Snap instantâneo sem pausa
        ease: "power2.out"
      },
      onUpdate: (self) => {
        // Atualiza a barra de progresso perfeitamente sincronizada com o ScrollTrigger
        if (progressBarRef.current) {
          gsap.set(progressBarRef.current, { scaleX: self.progress });
        }
      },
      onToggle: (self) => {
        // Faz a barra inteira aparecer gradativamente apenas quando a seção está travada (pin ativa)
        // e desaparecer assim que o usuário sai da seção.
        if (progressBarContainerRef.current) {
          gsap.to(progressBarContainerRef.current, {
            opacity: self.isActive ? 1 : 0,
            duration: 0.4,
            ease: "power2.out"
          });
        }
      }
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
      className="relative w-full h-screen bg-transparent z-20 pointer-events-none"
    >
      
      {/* Wrapper com Máscara de Desfoque (Void) e Perspectiva 3D */}
      <div 
        className="w-full h-full flex items-center overflow-hidden"
        style={{ 
          perspective: "1500px",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)" 
        }}
      >
        {/* 
          Container de Scroll: 
          Começa alinhado à esquerda (pl-[10vw]) para a introdução.
          Termina com padding dinâmico (pr-[50vw-300px]) para o último card ficar exatamente no centro no final do scroll.
        */}
        <div 
          ref={scrollRef} 
          className="relative flex items-center h-full w-max pl-[6vw] md:pl-[12vw] pr-[calc(50vw-160px)] md:pr-[calc(50vw-300px)] gap-6 md:gap-10 pointer-events-auto"
        >
          
          {/* Intro (Esquerda) */}
          <div className="flex-shrink-0 flex flex-col justify-center w-[300px] md:w-[400px] mr-8 md:mr-16">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white tracking-[0.1em] select-none uppercase">
              Projetos
            </h2>
            <p className="text-neutral-400 mt-6 font-sans text-sm md:text-base max-w-sm leading-relaxed">
              Unindo design refinado e código escalável para entregar <span className="text-[var(--foreground)] font-medium">soluções digitais únicas</span>, convertendo complexidade em conversão e performance.
            </p>
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

      {/* Barra de Progresso Global Cinemática (Fora da máscara para não sofrer fade lateral) */}
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
