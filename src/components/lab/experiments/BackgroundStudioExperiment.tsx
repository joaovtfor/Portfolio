"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { BACKGROUND_VARIANTS, BackgroundMesh, type BackgroundVariant } from "@/components/webgl/BackgroundMesh";
import { ParticleField } from "@/components/webgl/ParticleField";
import { AdaptiveDpr } from "@/components/webgl/AdaptiveDpr";

interface BackgroundStudioExperimentProps {
  isMobile: boolean;
  fallback: string;
  labels: {
    variants: Record<BackgroundVariant, string>;
    particles: string;
    controls: string;
  };
}

// Compara as variações do fundo do site atrás das partículas reais (o clique alterna a forma).
// Teclas 1–5 trocam a variação; P liga/desliga as partículas.
export default function BackgroundStudioExperiment({ isMobile, fallback, labels }: BackgroundStudioExperimentProps) {
  const shouldReduceMotion = useReducedMotion();
  const [variant, setVariant] = useState<BackgroundVariant>("fluid");
  const [showParticles, setShowParticles] = useState(true);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const index = Number(event.key) - 1;
      if (index >= 0 && index < BACKGROUND_VARIANTS.length) setVariant(BACKGROUND_VARIANTS[index]);
      if (event.key.toLowerCase() === "p") setShowParticles((visible) => !visible);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative w-full h-full">
      <Canvas
        frameloop={shouldReduceMotion ? "demand" : "always"}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        fallback={<p className="p-12 font-mono text-sm text-muted">{fallback}</p>}
        className="cursor-crosshair"
      >
        <BackgroundMesh quality={isMobile ? "low" : "high"} variant={variant} />
        {showParticles && <ParticleField isMobile={isMobile} driver="click" />}
        <AdaptiveDpr />
      </Canvas>

      <div
        role="toolbar"
        aria-label={labels.controls}
        className="absolute inset-x-0 top-24 md:top-28 mx-auto flex w-fit max-w-[calc(100%-2rem)] flex-wrap justify-center gap-1 rounded-full border border-line bg-background/70 p-1 backdrop-blur-md font-mono text-[10px] md:text-xs uppercase tracking-widest"
      >
        {BACKGROUND_VARIANTS.map((name, i) => (
          <button
            key={name}
            type="button"
            aria-pressed={variant === name}
            onClick={() => setVariant(name)}
            className="rounded-full px-3 py-2 text-muted transition-colors duration-300 hover:text-ink aria-pressed:bg-foreground aria-pressed:text-background focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
          >
            <span aria-hidden="true" className="hidden md:inline opacity-50">{i + 1} </span>
            {labels.variants[name]}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={showParticles}
          onClick={() => setShowParticles((visible) => !visible)}
          className="rounded-full border border-line px-3 py-2 text-muted transition-colors duration-300 hover:text-ink aria-pressed:border-foreground/60 aria-pressed:text-foreground focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
        >
          <span aria-hidden="true" className="hidden md:inline opacity-50">P </span>
          {labels.particles}
        </button>
      </div>
    </div>
  );
}
