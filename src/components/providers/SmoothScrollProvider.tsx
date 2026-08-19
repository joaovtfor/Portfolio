"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

// Registra o plugin globalmente no client-side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    // Sincroniza o Ticker do GSAP com o RequestAnimationFrame do Lenis.
    // Isso garante que as animações de ScrollTrigger rodem perfeitamente alinhadas
    // com a taxa de atualização do monitor, sem jittering.
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    // Ajustes cruciais para Mobile (Barra de endereços)
    // Previne que o recolhimento/expansão da barra do Chrome/Safari no mobile 
    // force um recálculo brutal das posições quebrando o layout.
    ScrollTrigger.config({ ignoreMobileResize: true });

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      autoRaf={false} // Desabilita o RAF interno para o GSAP Ticker comandar
      options={{
        lerp: 0.1, // Interpolação suave (0 a 1)
        duration: 1.2,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
