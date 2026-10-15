"use client";

import { useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import type { Dictionary, Locale } from "@/dictionaries";
import type { LabSlug } from "@/data/lab";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useUIStore } from "@/store/uiStore";

const FlowFieldExperiment = dynamic(() => import("./experiments/FlowFieldExperiment"), { ssr: false });
const LiquidImageExperiment = dynamic(() => import("./experiments/LiquidImageExperiment"), { ssr: false });

interface LabExperimentViewProps {
  dict: Dictionary;
  locale: Locale;
  slug: LabSlug;
}

export function LabExperimentView({ dict, locale, slug }: LabExperimentViewProps) {
  const setBackgroundPaused = useUIStore((state) => state.setBackgroundPaused);
  const reduceMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const experiment = dict.lab.experiments[slug];

  // Um único loop de render ativo: o fundo do shell pausa enquanto o experimento está aberto.
  useEffect(() => {
    setBackgroundPaused(true);
    return () => setBackgroundPaused(false);
  }, [setBackgroundPaused]);

  return (
    <section data-scene="lab" aria-labelledby="experiment-title" className="relative w-full h-[100svh] overflow-hidden bg-background">
      <div className="absolute inset-0">
        {slug === "flow-field" ? (
          <FlowFieldExperiment isMobile={isMobile} fallback={dict.lab.webglError} />
        ) : (
          <LiquidImageExperiment fallback={dict.lab.webglError} />
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pt-24 pb-24 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-8 bg-gradient-to-t from-background/90 via-background/40 to-transparent">
        <div className="max-w-md">
          <Link
            href={`/${locale}#lab`}
            className="pointer-events-auto inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted hover:text-ink transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
          >
            <span aria-hidden="true">←</span> {dict.lab.back}
          </Link>
          <h1 id="experiment-title" className="mt-6 font-serif text-4xl md:text-6xl uppercase text-ink leading-none">
            {experiment.title}
          </h1>
          <p className="mt-4 font-sans text-sm text-muted leading-relaxed">{experiment.description}</p>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-foreground">
            <span aria-hidden="true">&gt; </span>
            {reduceMotion ? dict.lab.reducedMotion : experiment.instructions}
          </p>
        </div>

        <dl className="font-mono text-xs uppercase tracking-widest">
          <dt className="text-subtle">{dict.lab.techniques}</dt>
          <dd className="mt-2 text-ink">{experiment.techniques.join(" · ")}</dd>
        </dl>
      </div>
    </section>
  );
}
