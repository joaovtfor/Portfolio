"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WebGLScene } from "@/components/webgl/Scene";
import { FluidMesh } from "@/components/webgl/FluidMesh";
import { MobileFluidMesh } from "@/components/webgl/MobileFluidMesh";
import { Particles } from "@/components/webgl/Particles";
import { Preloader } from "./Preloader";
import { CustomCursor } from "./CustomCursor";
import { MobileFloatingMenu } from "./MobileFloatingMenu";
import type { Dictionary, Locale } from "@/dictionaries";
import { pt } from "@/dictionaries/pt";

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);
    
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
        {mounted && (
          <WebGLScene eventSource={rootRef}>
            {isMobile ? <MobileFluidMesh /> : <FluidMesh />}
            <Particles />
          </WebGLScene>
        )}
      </motion.div>
      
      <div className="relative z-10 block w-full">
        {children}
      </div>

      <MobileFloatingMenu dict={dict} locale={locale} />
    </main>
  );
}
