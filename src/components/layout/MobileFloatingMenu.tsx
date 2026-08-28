"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function MobileFloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  const toggleMenu = () => setIsOpen(!isOpen);

  const scrollToContact = () => {
    setIsOpen(false);
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col gap-3 mb-4 origin-bottom-right"
          >
            <a
              href="/cv_pt.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full text-white/90 text-xs uppercase tracking-widest font-sans font-bold shadow-2xl active:scale-95 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Baixar CV
            </a>
            
            <button
              onClick={scrollToContact}
              className="flex items-center gap-3 px-5 py-3 bg-[var(--foreground)] text-black rounded-full text-xs uppercase tracking-widest font-sans font-bold shadow-[0_0_20px_rgba(133,232,234,0.3)] active:scale-95 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Contato
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleMenu}
        className="w-14 h-14 flex flex-col items-center justify-center gap-1.5 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl active:scale-95 transition-transform"
        aria-label="Menu"
      >
        <motion.span 
          animate={isOpen ? { rotate: 45, y: 7.5 } : { rotate: 0, y: 0 }} 
          className="w-5 h-[2px] bg-white block rounded-full"
        />
        <motion.span 
          animate={isOpen ? { opacity: 0 } : { opacity: 1 }} 
          className="w-5 h-[2px] bg-white block rounded-full"
        />
        <motion.span 
          animate={isOpen ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }} 
          className="w-5 h-[2px] bg-white block rounded-full"
        />
      </button>
    </div>
  );
}
