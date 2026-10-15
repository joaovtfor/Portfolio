"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Dictionary } from "@/dictionaries";
import type { Resume } from "@/data/resume";

gsap.registerPlugin(ScrollTrigger);

interface AboutSectionProps {
  dict: Dictionary;
  resume: Resume;
}

export function AboutSection({ dict, resume }: AboutSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const manifestoRef = useRef<HTMLParagraphElement>(null);

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

        <div className="md:col-span-4 lg:col-start-9 md:pt-16">
          <h3 className="font-mono text-xs uppercase tracking-widest text-subtle">{dict.about.stackTitle}</h3>
          <ul className="mt-6 flex flex-col divide-y divide-line border-y border-line">
            {resume.skillGroups.map((group) => (
              <li key={group.label} className="py-5">
                <p className="font-mono text-xs uppercase tracking-widest text-foreground">{group.label}</p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-muted">
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
