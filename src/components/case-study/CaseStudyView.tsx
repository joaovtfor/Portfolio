"use client";

import { ViewTransition } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import type { Dictionary, Locale } from "@/dictionaries";
import type { Project } from "@/data/projects";

interface CaseStudyViewProps {
  dict: Dictionary;
  locale: Locale;
  project: Project;
  position: { index: number; total: number };
  next: { slug: string; title: string };
}

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const pad = (value: number) => String(value).padStart(2, "0");

export function CaseStudyView({ dict, locale, project, position, next }: CaseStudyViewProps) {
  return (
    <article data-scene="work" className="relative w-full pb-24 md:pb-40">
      <motion.header
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.08 }}
        className="max-w-[1440px] mx-auto px-6 md:px-12 pt-28 md:pt-40"
      >
        <motion.div variants={reveal}>
          <Link
            href={`/${locale}#work`}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted hover:text-ink transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
          >
            <span aria-hidden="true">←</span> {dict.caseStudy.back}
          </Link>
        </motion.div>

        <motion.p variants={reveal} className="mt-12 font-mono text-xs text-subtle tabular-nums">
          {pad(position.index)} / {pad(position.total)}
        </motion.p>
        <motion.h1 variants={reveal} className="mt-3 font-serif text-[clamp(2.75rem,8vw,8rem)] uppercase leading-[0.95] text-ink">
          {project.title}
        </motion.h1>
        <motion.p variants={reveal} className="mt-5 font-mono text-xs md:text-sm uppercase tracking-widest text-foreground">
          {project.subtitle}
        </motion.p>
      </motion.header>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-12 md:mt-16">
        <div className="relative w-full aspect-[16/10] md:aspect-[16/8] overflow-hidden rounded-2xl border border-line">
          <ViewTransition name={`project-${project.slug}`} share="morph" default="none">
            <motion.img
              src={project.image}
              alt={project.title}
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </ViewTransition>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-16 md:mt-24 grid gap-16 md:grid-cols-12">
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={reveal}
          className="md:col-span-7"
          aria-labelledby="overview-title"
        >
          <h2 id="overview-title" className="font-mono text-xs uppercase tracking-widest text-subtle">{dict.caseStudy.overview}</h2>
          <p className="mt-6 font-serif text-2xl md:text-3xl leading-snug text-ink">{project.description}</p>

          <h2 className="mt-16 font-mono text-xs uppercase tracking-widest text-subtle">{dict.caseStudy.highlights}</h2>
          <ol className="mt-6 flex flex-col border-t border-line">
            {project.highlights.map((highlight, i) => (
              <li key={highlight} className="flex gap-6 py-5 border-b border-line">
                <span aria-hidden="true" className="font-mono text-xs text-foreground pt-1">{pad(i + 1)}</span>
                <span className="font-sans text-sm md:text-base text-muted leading-relaxed">{highlight}</span>
              </li>
            ))}
          </ol>
        </motion.section>

        <motion.aside
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={reveal}
          className="md:col-span-4 md:col-start-9 flex flex-col gap-12"
        >
          <div>
            <h2 className="font-mono text-xs uppercase tracking-widest text-subtle">{dict.caseStudy.stack}</h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <li key={item} className="px-3 py-1.5 rounded-full border border-line font-mono text-xs text-ink/80">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-widest text-subtle">{dict.caseStudy.access}</h2>
            {project.link && !project.isPrivate ? (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-full border border-foreground/50 font-mono text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background hover:shadow-glow transition-all duration-300 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
              >
                {dict.caseStudy.visit}
                <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <p className="mt-6 flex items-start gap-3 font-sans text-sm text-muted leading-relaxed">
                <svg aria-hidden="true" className="mt-0.5 shrink-0 text-foreground" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                {dict.caseStudy.privateNotice}
              </p>
            )}
          </div>
        </motion.aside>
      </div>

      <nav aria-label={dict.caseStudy.next} className="max-w-[1440px] mx-auto px-6 md:px-12 mt-24 md:mt-40">
        <Link
          href={`/${locale}/work/${next.slug}`}
          data-cursor-label={dict.cursor.view}
          className="group block border-t border-line pt-10 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-subtle">{dict.caseStudy.next}</span>
          <span className="mt-4 flex items-center justify-between gap-6 font-serif text-[clamp(2rem,6vw,5.5rem)] uppercase leading-none text-ink/40 group-hover:text-ink transition-colors duration-500">
            {next.title}
            <span aria-hidden="true" className="text-foreground transition-transform duration-500 ease-expo-out group-hover:translate-x-3">→</span>
          </span>
        </Link>
      </nav>
    </article>
  );
}
