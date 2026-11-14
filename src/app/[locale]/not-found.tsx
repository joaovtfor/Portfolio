"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary, toLocale } from "@/dictionaries";

// O fundo WebGL, o cursor e o header vêm do shell persistente do layout.
export default function NotFound() {
  const pathname = usePathname();
  const currentLocale = toLocale(pathname?.split("/")[1]);
  const dict = getDictionary(currentLocale);

  return (
    <section data-scene="hero" className="relative w-full h-[100svh] flex flex-col items-center justify-center overflow-hidden">
      <div className="z-10 flex flex-col items-center text-center px-6">
        <h1 className="font-serif text-[clamp(4rem,10vw,8rem)] text-ink font-medium uppercase leading-none mix-blend-difference">
          404
        </h1>
        <p className="mt-4 text-muted font-mono tracking-widest uppercase text-xs md:text-sm">
          {dict.notFound.message}
        </p>
        <Link
          href={`/${currentLocale}`}
          className="mt-12 px-8 py-4 border border-ink/20 rounded-full text-ink font-mono text-xs uppercase tracking-widest font-bold hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
        >
          {dict.notFound.back}
        </Link>
      </div>
    </section>
  );
}
