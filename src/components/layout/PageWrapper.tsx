"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Preloader } from "./Preloader";
import { CustomCursor } from "./CustomCursor";
import { MobileFloatingMenu } from "./MobileFloatingMenu";
import type { Dictionary, Locale } from "@/dictionaries";
import { pt } from "@/dictionaries/pt";

const WebGLBackground = dynamic(() => import("@/components/webgl/WebGLBackground"), { ssr: false });

export function PageWrapper({ children, dict = pt, locale = 'pt' }: { children: React.ReactNode; dict?: Dictionary; locale?: Locale }) {
  const rootRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <main id="main-content" ref={rootRef} className="block w-full min-h-[100svh] relative bg-background overflow-clip">
      
      <Preloader />
      {!isMobile && mounted && <CustomCursor />}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, ease: "easeInOut" }}
        className="fixed top-0 left-0 w-screen h-[100vh] z-0 pointer-events-none"
        aria-hidden="true"
      >
        {mounted && <WebGLBackground eventSource={rootRef} isMobile={isMobile} />}
      </motion.div>
      
      <div className="relative z-10 block w-full">
        {children}
      </div>

      {!isMobile && mounted && (
        <a
          href={locale === 'pt' ? '/en' : '/pt'}
          className="fixed top-8 right-8 md:right-12 z-50 hidden md:flex items-center gap-2 text-neutral-500 hover:text-[var(--foreground)] font-sans text-xs uppercase tracking-widest transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
          aria-label={dict.menu?.toggleLanguage || "Switch Language"}
        >
          <span className={locale === 'pt' ? 'text-white font-bold' : ''}>PT</span>
          <span className="opacity-40">/</span>
          <span className={locale === 'en' ? 'text-white font-bold' : ''}>EN</span>
        </a>
      )}

      <MobileFloatingMenu dict={dict} locale={locale} />
    </main>
  );
}
