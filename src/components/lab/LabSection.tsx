"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Dictionary, Locale } from "@/dictionaries";
import { LAB_EXPERIMENTS } from "@/data/lab";

interface LabSectionProps {
  dict: Dictionary;
  locale: Locale;
}

export function LabSection({ dict, locale }: LabSectionProps) {
  return (
    <section
      id="lab"
      data-scene="lab"
      aria-labelledby="lab-title"
      className="relative w-full min-h-[100svh] flex items-center py-24 md:py-40"
    >
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-xl">
          <p aria-hidden="true" className="font-mono text-xs uppercase tracking-widest text-subtle">04 —</p>
          <h2 id="lab-title" className="mt-3 text-3xl md:text-4xl font-serif text-ink tracking-[0.1em] uppercase">
            {dict.lab.title}
          </h2>
          <p className="mt-4 text-muted font-sans text-sm md:text-base leading-relaxed">{dict.lab.description}</p>
        </div>

        <ul className="mt-16 grid gap-6 md:grid-cols-2">
          {LAB_EXPERIMENTS.map((slug, i) => {
            const experiment = dict.lab.experiments[slug];
            return (
              <motion.li
                key={slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={`/${locale}/lab/${slug}`}
                  data-cursor-label={dict.cursor.open}
                  className="group relative flex flex-col justify-between min-h-[280px] md:min-h-[340px] p-8 md:p-10 rounded-2xl border border-line bg-surface/40 backdrop-blur-md overflow-hidden hover:border-foreground/50 focus-visible:border-foreground transition-colors duration-500 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
                >
                  <span aria-hidden="true" className="absolute -right-6 -bottom-10 font-mono text-[9rem] md:text-[12rem] leading-none text-ink/[0.04] group-hover:text-foreground/10 transition-colors duration-700 select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="relative">
                    <p className="font-mono text-xs uppercase tracking-widest text-foreground">
                      {experiment.techniques.join(" · ")}
                    </p>
                    <h3 className="mt-4 font-serif text-3xl md:text-4xl uppercase text-ink">{experiment.title}</h3>
                    <p className="mt-4 max-w-sm font-sans text-sm text-muted leading-relaxed">{experiment.description}</p>
                  </div>

                  <span className="relative mt-10 inline-flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-ink/80 group-hover:text-ink">
                    {dict.lab.open}
                    <span aria-hidden="true" className="transition-transform duration-500 ease-expo-out group-hover:translate-x-2">→</span>
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
