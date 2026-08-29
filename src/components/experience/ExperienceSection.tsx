"use client";

import { ExperienceTitle } from "./ExperienceTitle";
import { ExperienceList } from "./ExperienceList";
import { Dictionary } from "@/dictionaries";
import { getResume } from "@/data/resume";

interface ExperienceSectionProps {
  dict: Dictionary;
  resume: ReturnType<typeof getResume>;
  locale?: string;
}

export function ExperienceSection({ dict, resume, locale }: ExperienceSectionProps) {
  return (
    <section className="relative w-full min-h-[100svh] bg-transparent py-12 md:py-40">
      
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col md:flex-row gap-12 lg:gap-20">
        
        <ExperienceTitle dict={dict} resume={resume} locale={locale} />
        <ExperienceList experiences={resume.experiences} />

      </div>
    </section>
  );
}
