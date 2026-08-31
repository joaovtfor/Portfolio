"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { getDictionary, type Locale } from "@/dictionaries";

const WebGLBackground = dynamic(() => import("@/components/webgl/WebGLBackground"), { ssr: false });

export const runtime = "edge";

export default function NotFound() {
  const rootRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(max-width: 768px)").matches;
    }
    return false;
  });
  const [mounted, setMounted] = useState(false);

  // Extrair o locale direto da URL atual (fallback para pt)
  const currentLocale = (pathname?.split("/")[1] === "en" ? "en" : "pt") as Locale;
  const dict = getDictionary(currentLocale);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <main ref={rootRef} className="relative w-full h-[100svh] bg-background flex flex-col items-center justify-center overflow-hidden">
      {!isMobile && mounted && <CustomCursor />}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="fixed top-0 left-0 w-screen h-[100vh] z-0 pointer-events-none"
        aria-hidden="true"
      >
        {mounted && <WebGLBackground eventSource={rootRef} isMobile={isMobile} />}
      </motion.div>

      <div className="z-10 flex flex-col items-center text-center px-6">
        <h1 className="font-serif text-[clamp(4rem,10vw,8rem)] text-white font-medium uppercase leading-none mix-blend-difference select-none">
          404
        </h1>
        <p className="mt-4 text-neutral-400 font-sans tracking-widest uppercase text-xs md:text-sm">
          {dict.notFound.message}
        </p>
        <Link 
          href={`/${currentLocale}`}
          className="mt-12 px-8 py-4 border border-white/20 rounded-full text-white text-xs uppercase tracking-widest font-sans font-bold hover:bg-[var(--foreground)] hover:text-black hover:border-[var(--foreground)] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none pointer-events-auto"
        >
          {dict.notFound.back}
        </Link>
      </div>
    </main>
  );
}
