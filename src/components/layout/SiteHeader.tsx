"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";
import type { Dictionary, Locale } from "@/dictionaries";
import { SCENES, useSceneStore, type SceneName } from "@/store/sceneStore";

const NAV_ITEMS: { id: SceneName; key: keyof Dictionary["nav"] }[] = [
  { id: "about", key: "about" },
  { id: "work", key: "work" },
  { id: "lab", key: "lab" },
  { id: "experience", key: "experience" },
];

interface SiteHeaderProps {
  dict: Dictionary;
  locale: Locale;
  name: string;
}

export function SiteHeader({ dict, locale, name }: SiteHeaderProps) {
  const pathname = usePathname();
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();
  const activeScene = useSceneStore((state) => state.activeScene);

  const isHome = pathname === `/${locale}`;
  const nextLocale: Locale = locale === "pt" ? "en" : "pt";
  const localizedPath = `/${nextLocale}${pathname.slice(locale.length + 1)}`;
  const sectionNumber = String(SCENES.indexOf(activeScene) + 1).padStart(2, "0");
  const sectionTotal = String(SCENES.length).padStart(2, "0");

  // Na home, rola com Lenis; nas demais rotas o Link navega para `/{locale}#secao`.
  const scrollToSection = (id: SceneName | "top") => (event: React.MouseEvent) => {
    if (!isHome || !lenis) return;
    event.preventDefault();
    lenis.scrollTo(id === "top" ? 0 : `#${id}`, { duration: 1.6, immediate: Boolean(reduceMotion) });
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 pointer-events-none">
      <div className="flex items-center justify-between gap-6 px-6 md:px-12 py-5 md:py-7 text-ink mix-blend-difference">
        <Link
          href={`/${locale}`}
          onClick={scrollToSection("top")}
          aria-label={`${name}, ${dict.nav.home}`}
          className="pointer-events-auto font-mono text-lg font-bold tracking-tight focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
        >
          <span aria-hidden="true">&gt;</span>
          <span aria-hidden="true" className="text-foreground">_</span>
        </Link>

        <nav aria-label={dict.a11y.mainNav} className="hidden md:block pointer-events-auto">
          <ul className="flex items-center gap-8 font-mono text-xs uppercase tracking-widest">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/${locale}#${item.id}`}
                  onClick={scrollToSection(item.id)}
                  aria-current={isHome && activeScene === item.id ? "true" : undefined}
                  className="text-muted hover:text-ink aria-[current=true]:text-ink transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
                >
                  {dict.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest">
          {isHome && (
            <span className="tabular-nums select-none">
              <span className="sr-only">{dict.a11y.currentSection}: </span>
              {sectionNumber}
              <span aria-hidden="true" className="text-subtle"> / {sectionTotal}</span>
            </span>
          )}

          <a
            href={localizedPath}
            hrefLang={nextLocale === "pt" ? "pt-BR" : "en"}
            aria-label={dict.a11y.switchLanguage}
            className="hidden md:inline-flex items-center gap-2 pointer-events-auto text-subtle hover:text-ink transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
          >
            <span className={locale === "pt" ? "text-ink font-bold" : ""}>PT</span>
            <span aria-hidden="true">/</span>
            <span className={locale === "en" ? "text-ink font-bold" : ""}>EN</span>
          </a>

          <Link
            href={`/${locale}#contact`}
            onClick={scrollToSection("contact")}
            className="hidden md:inline-flex pointer-events-auto px-4 py-2 rounded-full border border-ink/30 hover:bg-ink hover:text-background transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
          >
            {dict.nav.contact}
          </Link>
        </div>
      </div>
    </header>
  );
}
