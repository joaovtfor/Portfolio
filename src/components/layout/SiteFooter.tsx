"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useLenis } from "lenis/react";
import type { Dictionary } from "@/dictionaries";
import type { Resume } from "@/data/resume";

type FooterInfo = Pick<Resume["personalInfo"], "shortName" | "location" | "timeZone" | "email" | "linkedin" | "github">;

interface SiteFooterProps {
  dict: Dictionary;
  info: FooterInfo;
}

// Hora local formatada no cliente (null no servidor para evitar divergência de hidratação).
function useLocalTime(timeZone: string): string | null {
  const formatter = useMemo(
    () => new Intl.DateTimeFormat("pt-BR", { timeZone, hour: "2-digit", minute: "2-digit" }),
    [timeZone]
  );
  const subscribe = useCallback((onChange: () => void) => {
    const id = window.setInterval(onChange, 15_000);
    return () => window.clearInterval(id);
  }, []);

  return useSyncExternalStore(subscribe, () => formatter.format(new Date()), () => null);
}

export function SiteFooter({ dict, info }: SiteFooterProps) {
  const lenis = useLenis();
  const time = useLocalTime(info.timeZone);

  const links = [
    { label: "Email", href: `mailto:${info.email}` },
    { label: "LinkedIn", href: info.linkedin },
    { label: "GitHub", href: info.github },
  ];

  const backToTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative z-10 border-t border-line bg-background/60 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 md:py-14 grid gap-10 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
        <div className="flex flex-col gap-2">
          <span className="font-serif text-2xl md:text-3xl uppercase text-ink">{info.shortName}</span>
          <span className="font-mono text-xs text-subtle">
            © {new Date().getFullYear()} · {dict.footer.rights}
          </span>
        </div>

        <dl className="font-mono text-xs uppercase tracking-widest">
          <dt className="text-subtle">{dict.footer.localTime}</dt>
          <dd className="mt-1 text-ink tabular-nums">
            {info.location} · <time>{time ?? "--:--"}</time>
          </dd>
        </dl>

        <ul className="flex flex-wrap gap-6 font-mono text-xs uppercase tracking-widest">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="text-muted hover:text-foreground transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={backToTop}
          className="justify-self-start md:justify-self-end font-mono text-xs uppercase tracking-widest text-muted hover:text-ink transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
        >
          {dict.footer.backToTop} <span aria-hidden="true">↑</span>
        </button>
      </div>
    </footer>
  );
}
