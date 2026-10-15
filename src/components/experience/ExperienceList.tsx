"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll } from "framer-motion";
import { useLenis } from "lenis/react";
import { useIsTouch } from "@/hooks/useIsTouch";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSceneStore } from "@/store/sceneStore";
import type { ExperienceItem } from "@/data/resume";

interface ExperienceListProps {
  experiences: ExperienceItem[];
}

const MOBILE_MARGIN = 16;
const HIGHLIGHT_SCALE = 1.7;
const HOVER_SCALE = 1.5;
/** A ponta da corda acompanha esta altura da viewport (fração a partir do topo). */
const HEAD_VIEWPORT = 0.62;

interface ExperienceItemCardProps {
  exp: ExperienceItem;
  i: number;
  total: number;
  /** Mobile: o card surge quando a corda alcança a sua dobra. */
  reveal: "in-view" | "reached" | "waiting";
  /** Lado da dobra no mobile: o card entra pelo lado oposto. */
  foldSide: "left" | "right";
  setCardRef: (el: HTMLLIElement | null) => void;
  setDotRef: (el: HTMLDivElement | null) => void;
  showDomTimeline: boolean;
  onHover: (index: number | null) => void;
}

function ExperienceItemCard({ exp, i, total, reveal, foldSide, setCardRef, setDotRef, showDomTimeline, onHover }: ExperienceItemCardProps) {
  const internalRef = useRef<HTMLLIElement>(null);
  const isInView = useInView(internalRef, { margin: "-40% 0px -40% 0px" });
  const isTouch = useIsTouch();

  const isActive = isTouch ? isInView : false;
  const fromX = foldSide === "right" ? -48 : 48;

  const setRefs = (el: HTMLLIElement | null) => {
    internalRef.current = el;
    setCardRef(el);
  };

  const motionProps =
    reveal === "in-view"
      ? {
          initial: { opacity: 0, y: 40 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-50px" },
          transition: { duration: 0.8, delay: i * 0.15, ease: "easeOut" as const },
        }
      : {
          initial: { opacity: 0, x: fromX },
          animate: reveal === "reached" ? { opacity: 1, x: 0 } : { opacity: 0, x: fromX },
          transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <motion.li
      ref={setRefs}
      data-active={isActive}
      onMouseEnter={() => onHover(i)}
      onMouseLeave={() => onHover(null)}
      {...motionProps}
      className="group relative flex flex-col py-8 md:py-12 border-t border-line first:border-t-transparent transition-colors hover:bg-ink/[0.02] px-4 md:pl-12 md:pr-8 md:mx-0 rounded-2xl max-md:my-14 max-md:border max-md:border-line max-md:bg-background/70 max-md:backdrop-blur-md"
    >
      <div aria-hidden="true" className={`hidden md:block absolute left-0 top-0 bottom-0 w-[1px] transition-colors duration-500 ${i === total - 1 ? 'bg-gradient-to-b from-ink/5 to-transparent' : 'bg-ink/5'}`}>
        {/* Ponto da timeline: com o WebGL ativo vira só referência de posição para o anel de partículas. */}
        <div
          ref={setDotRef}
          className={`absolute top-12 -left-[5px] w-3 h-3 rounded-full border border-foreground bg-foreground shadow-glow-strong transition-opacity duration-500 ${showDomTimeline ? "opacity-100" : "opacity-0"}`}
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
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hovered = useRef<number | null>(null);
  const reachedRef = useRef(0);
  const [reachedCount, setReachedCount] = useState(0);

  const isMobile = useMediaQuery("(max-width: 767px)");
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start center", "end center"]
  });

  // Mede a geometria da timeline e publica a corda no sceneStore (ExperienceTask.spec.md).
  // Desktop: a linha vertical da timeline; mobile: zigue-zague de borda a borda com uma dobra por card.
  const publish = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const { rope } = useSceneStore.getState().frame;

    const headY = window.innerHeight * HEAD_VIEWPORT;
    const path: number[] = [];
    const cumulative: number[] = [];
    const milestones: { x: number; y: number; scale: number; reached: boolean }[] = [];
    const scaleFor = (i: number) =>
      (experiences[i].highlight ? HIGHLIGHT_SCALE : 1) * (hovered.current === i ? HOVER_SCALE : 1);

    if (!isMobile) {
      const track = trackRef.current?.getBoundingClientRect();
      if (!track) return;
      const x = track.left + track.width / 2;
      path.push(x, track.top, x, track.bottom);
      cumulative.push(0, 1);
      const fill = Math.min(1, Math.max(0, (headY - track.top) / Math.max(track.height, 1)));
      rope.fill = fill;

      dotRefs.current.forEach((dot, i) => {
        if (!dot || i >= experiences.length) return;
        const rect = dot.getBoundingClientRect();
        const y = rect.top + rect.height / 2;
        const t = (y - track.top) / Math.max(track.height, 1);
        milestones.push({ x, y, scale: scaleFor(i), reached: rope.fill >= t });
      });
    } else {
      const rect = list.getBoundingClientRect();
      const right = window.innerWidth - MOBILE_MARGIN;
      path.push(MOBILE_MARGIN, rect.top);
      cardRefs.current.forEach((card, i) => {
        if (!card || i >= experiences.length) return;
        path.push(i % 2 === 0 ? right : MOBILE_MARGIN, card.getBoundingClientRect().top + 24);
      });

      // Comprimento acumulado em pixels, normalizado para 0–1.
      let total = 0;
      cumulative.push(0);
      for (let v = 1; v < path.length / 2; v++) {
        total += Math.hypot(path[v * 2] - path[v * 2 - 2], path[v * 2 + 1] - path[v * 2 - 1]);
        cumulative.push(total);
      }
      for (let v = 0; v < cumulative.length; v++) cumulative[v] /= Math.max(total, 1);

      // A ponta da corda fica na altura HEAD_VIEWPORT: acha o segmento que cruza essa altura
      // (o comprimento dos trechos horizontais não atrasa a construção).
      let fill = headY >= path[path.length - 1] ? 1 : 0;
      for (let v = 1; v < cumulative.length; v++) {
        const y0 = path[v * 2 - 1];
        const y1 = path[v * 2 + 1];
        if (headY >= y0 && headY < y1) {
          fill = cumulative[v - 1] + ((headY - y0) / Math.max(y1 - y0, 1)) * (cumulative[v] - cumulative[v - 1]);
          break;
        }
      }
      rope.fill = fill;

      for (let i = 0; i + 1 < cumulative.length; i++) {
        milestones.push({ x: path[(i + 1) * 2], y: path[(i + 1) * 2 + 1], scale: scaleFor(i), reached: rope.fill >= cumulative[i + 1] - 0.001 });
      }
    }

    rope.path = path;
    rope.cumulative = cumulative;
    rope.milestones = milestones;

    const reached = milestones.filter((milestone) => milestone.reached).length;
    if (reached !== reachedRef.current) {
      reachedRef.current = reached;
      setReachedCount(reached);
    }
  }, [experiences, isMobile]);

  useLenis(publish, [publish]);

  useEffect(() => {
    publish();
    window.addEventListener("resize", publish);
    return () => {
      window.removeEventListener("resize", publish);
      const { rope } = useSceneStore.getState().frame;
      rope.path = [];
      rope.cumulative = [];
      rope.milestones = [];
    };
  }, [publish]);

  const onHover = (index: number | null) => {
    hovered.current = index;
    publish();
  };

  // Sem simulação (reduced motion), a linha e os pontos DOM continuam como fallback visual.
  const showDomTimeline = Boolean(reduceMotion);

  return (
    <div ref={listRef} className="relative w-full md:w-1/2 flex flex-col mt-8 md:mt-0">
      <div ref={trackRef} aria-hidden="true" className="hidden md:block absolute md:left-0 top-16 bottom-16 w-[1px] bg-transparent z-10">
        {showDomTimeline && (
          <motion.div
            className="w-full bg-foreground origin-top shadow-glow-strong"
            style={{ scaleY: scrollYProgress, height: '100%' }}
          />
        )}
      </div>

      <ol className="w-full relative">
        {experiences.map((exp, i) => (
          <ExperienceItemCard
            key={exp.id}
            exp={exp}
            i={i}
            total={experiences.length}
            reveal={isMobile && !reduceMotion ? (i < reachedCount ? "reached" : "waiting") : "in-view"}
            foldSide={i % 2 === 0 ? "right" : "left"}
            setCardRef={(el) => { cardRefs.current[i] = el; }}
            setDotRef={(el) => { dotRefs.current[i] = el; }}
            showDomTimeline={showDomTimeline}
            onHover={onHover}
          />
        ))}
      </ol>
    </div>
  );
}
