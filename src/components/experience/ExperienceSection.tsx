"use client";

import { ExperienceTitle } from "./ExperienceTitle";
import { ExperienceList } from "./ExperienceList";
import type { Dictionary, Locale } from "@/dictionaries";
import type { Resume } from "@/data/resume";

interface ExperienceSectionProps {
  dict: Dictionary;
  resume: Resume;
  locale: Locale;
}

export function ExperienceSection({ dict, resume, locale }: ExperienceSectionProps) {
  return (
    <section
      id="experience"
      data-scene="experience"
      aria-labelledby="experience-title"
      className="relative w-full min-h-[100svh] bg-transparent py-24 md:py-40"
    >
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col md:flex-row gap-12 lg:gap-20">
        <ExperienceTitle dict={dict} resume={resume} locale={locale} />
        <ExperienceList experiences={resume.experiences} />
      </div>
    </section>
  );
}
