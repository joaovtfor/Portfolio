"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

interface RevealTextProps {
  text: string;
  className?: string;
  /** Opacidade das palavras antes da revelação: quanto maior, mais legível o texto já chega. */
  from?: number;
  /** Trecho do scroll que conduz a revelação (sintaxe do ScrollTrigger). */
  start?: string;
  end?: string;
}

/**
 * Parágrafo revelado palavra a palavra pelo scroll. O texto integral permanece no DOM (só a opacidade
 * muda); com `prefers-reduced-motion` ele é exibido sem animação.
 */
export function RevealText({ text, className, from = 0.12, start = "top 80%", end = "bottom 45%" }: RevealTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const words = ref.current?.querySelectorAll("[data-word]");
      if (!words?.length) return;

      gsap.fromTo(
        words,
        { opacity: from },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: ref.current, start, end, scrub: true },
        }
      );
    });
    return () => mm.revert();
  }, { scope: ref, dependencies: [text, from, start, end], revertOnUpdate: true });

  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((word, i) => (
        <span key={i} data-word className="inline-block mr-[0.25em]">
          {word}
        </span>
      ))}
    </p>
  );
}
