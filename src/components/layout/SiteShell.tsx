"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useLenis } from "lenis/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Preloader } from "./Preloader";
import { CustomCursor } from "./CustomCursor";
import { MobileFloatingMenu } from "./MobileFloatingMenu";
import { SceneDirector } from "./SceneDirector";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import type { Dictionary, Locale } from "@/dictionaries";
import type { Resume } from "@/data/resume";
import { useHydrated, useMediaQuery } from "@/hooks/useMediaQuery";
import { useUIStore } from "@/store/uiStore";

const WebGLBackground = dynamic(() => import("@/components/webgl/WebGLBackground"), { ssr: false });

interface SiteShellProps {
  children: React.ReactNode;
  dict: Dictionary;
  locale: Locale;
  info: Pick<Resume["personalInfo"], "shortName" | "location" | "timeZone" | "email" | "linkedin" | "github">;
}

// Elementos persistentes entre navegações (ver NavigationTask.spec.md): o canvas WebGL
// sobrevive às trocas de rota e o preloader roda apenas na primeira carga.
export function SiteShell({ children, dict, locale, info }: SiteShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const backgroundPaused = useUIStore((state) => state.backgroundPaused);
  const pathname = usePathname();
  const lenis = useLenis();

  // Primeira carga sempre começa no topo (a intro e os pins do GSAP dependem disso).
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);

  // Após cada navegação: rola até a âncora (ex.: `/pt#work`) depois que os pins foram medidos.
  useEffect(() => {
    if (!lenis) return;
    const hash = window.location.hash;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        if (hash && document.querySelector(hash)) lenis.scrollTo(hash, { immediate: true, force: true });
        else lenis.scrollTo(0, { immediate: true, force: true });
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, lenis]);

  return (
    <div ref={rootRef} className="relative">
      <Preloader label={dict.a11y.loading} />
      {hydrated && !isMobile && <CustomCursor />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: backgroundPaused ? 0 : 1 }}
        transition={{ duration: backgroundPaused ? 0.4 : 3, ease: "easeInOut" }}
        className="fixed top-0 left-0 w-screen h-[100lvh] z-0 pointer-events-none"
        aria-hidden="true"
      >
        {hydrated && <WebGLBackground eventSource={rootRef} isMobile={isMobile} paused={backgroundPaused} />}
      </motion.div>

      <SceneDirector />
      <SiteHeader dict={dict} locale={locale} name={info.shortName} />

      <main id="main-content" className="relative z-10 block w-full min-h-[100svh] overflow-clip">
        {children}
      </main>

      <SiteFooter dict={dict} info={info} />
      <MobileFloatingMenu dict={dict} locale={locale} />
    </div>
  );
}
