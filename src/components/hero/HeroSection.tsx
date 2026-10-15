"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";

import { HeroTitle } from "./HeroTitle";
import { HeroButton } from "./HeroButton";
import { useUIStore } from "@/store/uiStore";
import { Dictionary } from "@/dictionaries";

interface HeroSectionProps {
  dict: Dictionary;
  name: string;
  info: { role: string; focus: string; stack: string };
}

export function HeroSection({ dict, name, info }: HeroSectionProps) {
  const isPreloaderDone = useUIStore((state) => state.isPreloaderDone);
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();

  const handleScrollToWork = () => {
    if (lenis) {
      lenis.scrollTo("#work", {
        duration: 1.6,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        immediate: Boolean(reduceMotion),
      });
    } else {
      document.getElementById("work")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  const meta = [
    { label: dict.hero.roleLabel, value: info.role },
    { label: dict.hero.focusLabel, value: info.focus },
    { label: dict.hero.stackLabel, value: info.stack },
  ];

  return (
    <section id="top" data-scene="hero" className="relative w-full h-[100svh] overflow-hidden">
      <div className="relative z-10 flex flex-col w-full h-full max-w-[1440px] mx-auto pointer-events-none px-6 pt-24 pb-6 md:px-12 md:pt-28 md:pb-12">

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isPreloaderDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="max-w-xl font-mono text-xs md:text-sm uppercase tracking-widest text-muted leading-relaxed"
        >
          <span aria-hidden="true" className="text-foreground">&gt; </span>
          {dict.hero.statement}
        </motion.p>

        <div className="flex-1 flex items-center justify-center">
          <HeroTitle name={name} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isPreloaderDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 1.4, duration: 1.0, ease: "easeOut" }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 w-full pointer-events-auto"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-widest">
            {meta.map((item) => (
              <div key={item.label} className="contents">
                <dt className="text-subtle">{item.label}</dt>
                <dd className="text-muted">{item.value}</dd>
              </div>
            ))}
          </dl>

          <HeroButton label={dict.hero.cta} onClick={handleScrollToWork} />
        </motion.div>

      </div>
    </section>
  );
}
