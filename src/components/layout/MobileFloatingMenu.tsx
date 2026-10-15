"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { motion, AnimatePresence } from "framer-motion";
import type { Dictionary, Locale } from "@/dictionaries";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const ITEM_CLASSES = "flex items-center gap-3 px-5 py-3 bg-surface/90 backdrop-blur-xl border border-line rounded-full text-ink/90 font-mono text-xs uppercase tracking-widest font-bold shadow-2xl active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none";

export function MobileFloatingMenu({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const menuRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  if (!isMobile) return null;

  const isHome = pathname === `/${locale}`;
  const nextLocale: Locale = locale === "pt" ? "en" : "pt";

  const goToSection = (id: string) => (event: React.MouseEvent) => {
    setIsOpen(false);
    if (!isHome || !lenis) return;
    event.preventDefault();
    lenis.scrollTo(`#${id}`, { duration: 1.4 });
  };

  return (
    <nav ref={menuRef} aria-label={dict.a11y.mainNav} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            id="mobile-menu"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col items-end gap-3 mb-4 origin-bottom-right"
          >
            <li>
              <Link href={`/${locale}#work`} onClick={goToSection("work")} className={ITEM_CLASSES}>
                {dict.nav.work}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}#lab`} onClick={goToSection("lab")} className={ITEM_CLASSES}>
                {dict.nav.lab}
              </Link>
            </li>
            <li>
              <a href={`/${nextLocale}${pathname.slice(locale.length + 1)}`} hrefLang={nextLocale === "pt" ? "pt-BR" : "en"} className={ITEM_CLASSES}>
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                {dict.menu.toggleLanguage}
              </a>
            </li>
            <li>
              <a href={`/cv_${locale}.pdf`} target="_blank" rel="noopener noreferrer" className={ITEM_CLASSES}>
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                {dict.menu.downloadCV}
              </a>
            </li>
            <li>
              <Link
                href={`/${locale}#contact`}
                onClick={goToSection("contact")}
                className="flex items-center gap-3 px-5 py-3 bg-foreground text-background rounded-full font-mono text-xs uppercase tracking-widest font-bold shadow-glow active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-ink focus:outline-none"
              >
                {dict.menu.contact}
              </Link>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-14 h-14 flex flex-col items-center justify-center gap-1.5 bg-background/50 backdrop-blur-xl border border-line rounded-full shadow-2xl active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
        aria-label={dict.a11y.toggleMenu}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        <motion.span
          animate={isOpen ? { rotate: 45, y: 7.5 } : { rotate: 0, y: 0 }}
          className="w-5 h-[2px] bg-ink block rounded-full"
        />
        <motion.span
          animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
          className="w-5 h-[2px] bg-ink block rounded-full"
        />
        <motion.span
          animate={isOpen ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }}
          className="w-5 h-[2px] bg-ink block rounded-full"
        />
      </button>
    </nav>
  );
}
