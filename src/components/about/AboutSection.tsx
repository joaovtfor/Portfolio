"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Dictionary } from "@/dictionaries";
import type { Resume } from "@/data/resume";
import { useSceneStore } from "@/store/sceneStore";

gsap.registerPlugin(ScrollTrigger);

interface AboutSectionProps {
  dict: Dictionary;
  resume: Resume;
}

/** Folga (px) entre o painel da stack, o modelo 3D e a borda inferior da tela. */
const SLOT_GAP = 24;

export function AboutSection({ dict, resume }: AboutSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const manifestoRef = useRef<HTMLParagraphElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  // Publica no sceneStore o espaço livre abaixo do painel fixo (posição em que ele fica preso), para o
  // icosaedro caber nele em qualquer altura de tela. O WebGL converte para coordenadas de mundo.
  useEffect(() => {
    const setAboutSlot = useSceneStore.getState().setAboutSlot;
    const desktop = window.matchMedia("(min-width: 768px)");
    const round = (value: number) => Math.round(value * 1000) / 1000;

    const measure = () => {
      const panel = stackRef.current;
      if (!panel || !desktop.matches) {
        setAboutSlot(null);
        return;
      }
      const rect = panel.getBoundingClientRect();
      const stickyTop = parseFloat(getComputedStyle(panel).top) || 0;
      const width = window.innerWidth;
      const height = window.innerHeight;
      setAboutSlot({
        left: round(rect.left / width),
        right: round(rect.right / width),
        top: round(Math.min(stickyTop + rect.height + SLOT_GAP, height) / height),
        bottom: round((height - SLOT_GAP) / height),
      });
    };

    // Cada mudança regenera as formas de partículas: espera o resize assentar.
    let timer = 0;
    const scheduleMeasure = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 150);
    };

    measure();
    const observer = new ResizeObserver(scheduleMeasure);
    if (stackRef.current) observer.observe(stackRef.current);
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      setAboutSlot(null);
    };
  }, []);

  // Manifesto revelado palavra a palavra; o texto integral permanece no DOM (só a opacidade muda).
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const words = manifestoRef.current?.querySelectorAll("[data-word]");
      if (!words?.length) return;

      gsap.fromTo(
        words,
        { opacity: 0.12 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: {
            trigger: manifestoRef.current,
            start: "top 80%",
            end: "bottom 45%",
            scrub: true,
          },
        }
      );
    });
    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="about"
      data-scene="about"
      aria-labelledby="about-title"
      className="relative w-full min-h-[100svh] py-24 md:py-40"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 grid gap-16 md:grid-cols-12">
        <div className="md:col-span-8 lg:col-span-7">
          <h2 id="about-title" className="font-mono text-xs uppercase tracking-widest text-foreground">
            <span aria-hidden="true" className="text-subtle">02 — </span>
            {dict.about.title}
          </h2>

          <p ref={manifestoRef} className="mt-8 font-serif text-2xl md:text-3xl lg:text-4xl leading-tight text-ink">
            {resume.manifesto.split(" ").map((word, i) => (
              <span key={i} data-word className="inline-block mr-[0.25em]">
                {word}
              </span>
            ))}
          </p>

          <p className="mt-10 max-w-2xl font-sans text-sm md:text-base leading-relaxed text-muted">
            {resume.summary}
          </p>

          <dl className="mt-10 grid gap-6 sm:grid-cols-2 font-mono text-xs uppercase tracking-widest">
            <div>
              <dt className="text-subtle">{dict.about.educationLabel}</dt>
              <dd className="mt-2 text-ink normal-case tracking-normal font-sans text-sm">
                {resume.education.degree} · {resume.education.institution}
                <span className="block text-subtle">{resume.education.conclusion}</span>
              </dd>
            </div>
            <div>
              <dt className="text-subtle">{dict.about.languageLabel}</dt>
              <dd className="mt-2 text-ink normal-case tracking-normal font-sans text-sm">{resume.language}</dd>
            </div>
          </dl>
        </div>

        {/* Desktop: a stack fica fixa (sticky, logo abaixo do header) num painel compacto enquanto o texto
            rola; o icosaedro de partículas ocupa o espaço livre abaixo dele (forma `about` em shapes.ts). */}
        <div ref={stackRef} className="md:col-span-4 lg:col-start-9 md:self-start md:sticky md:top-24 short:top-20 md:rounded-2xl md:border md:border-line md:bg-background/30 md:backdrop-blur-md md:px-6 md:py-5 short:py-3">
          <h3 className="font-mono text-xs uppercase tracking-widest text-subtle">{dict.about.stackTitle}</h3>
          <ul className="mt-6 md:mt-3 short:mt-2 flex flex-col divide-y divide-line border-y border-line">
            {resume.skillGroups.map((group) => (
              <li key={group.label} className="py-5 md:py-2.5 short:py-1.5">
                <p className="font-mono text-xs uppercase tracking-widest text-foreground">{group.label}</p>
                <p className="mt-2 md:mt-1 short:mt-0.5 font-sans text-sm md:text-xs leading-relaxed short:leading-snug text-muted">
                  {group.items.join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
