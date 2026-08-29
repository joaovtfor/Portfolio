"use client";

import { motion } from "framer-motion";
import { useLenis } from "@studio-freight/react-lenis";
import { useRef } from "react";

import { HeroTitle } from "./HeroTitle";
import { HeroButton } from "./HeroButton";
import { useUIStore } from "@/store/uiStore";
import { Dictionary } from "@/dictionaries";
import { getResume } from "@/data/resume";

interface HeroSectionProps {
  dict: Dictionary;
  resume: ReturnType<typeof getResume>;
}

export function HeroSection({ dict, resume }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isPreloaderDone = useUIStore((state) => state.isPreloaderDone);
  const lenis = useLenis();

  const handleScrollToContact = () => {
    if (lenis) {
      lenis.scrollTo("#contact", { 
        duration: 8.0, 
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) 
      });
    } else {
      const contactEl = document.getElementById("contact");
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section ref={sectionRef} className="relative w-full h-[100svh] overflow-hidden">
      
      <div className="relative z-10 flex flex-col w-full h-full max-w-[1440px] mx-auto pointer-events-none p-6 md:p-12">
        
        <div className="flex-1 flex items-center justify-center">
          <HeroTitle name="JOÃO DE FOR" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isPreloaderDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 1.6, duration: 1.0, ease: "easeOut" }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 w-full pointer-events-auto"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 1.5rem)' }}
        >
          <div className="flex flex-col gap-1 font-sans text-[10px] sm:text-xs tracking-widest text-neutral-400 uppercase select-none">
            <p><strong className="text-neutral-400 font-bold">{dict.hero.roleLabel}:</strong> {resume.personalInfo.role}</p>
            <p><strong className="text-neutral-400 font-bold">{dict.hero.focusLabel}:</strong> {resume.personalInfo.focus}</p>
            <p><strong className="text-neutral-400 font-bold">{dict.hero.stackLabel}:</strong> {resume.personalInfo.stack}</p>
          </div>
          
          <div className="flex items-center">
            <HeroButton dict={dict} onClick={handleScrollToContact} />
          </div>
        </motion.div>

      </div>
      
    </section>
  );
}
