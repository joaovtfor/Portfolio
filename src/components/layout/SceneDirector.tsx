"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { SCENES, toSceneIndex, useSceneStore } from "@/store/sceneStore";

// Sem UI: lê as seções `[data-scene]` e publica no sceneStore a seção ativa e o progresso
// contínuo entre elas. Nunca manipula objetos 3D (ver NavigationTask.spec.md).
export function SceneDirector() {
  const pathname = usePathname();

  useEffect(() => {
    const { frame } = useSceneStore.getState();
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
    frame.sequence = elements.length ? elements.map((el) => toSceneIndex(el.dataset.scene)) : [0];

    const measure = () => {
      if (!elements.length) {
        frame.progress = 0;
        return;
      }

      const center = window.innerHeight / 2;
      let index = 0;
      let t = 0;

      elements.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= center) {
          index = i;
          // A transição para a forma seguinte ocupa o fim da seção: 25% dela, limitado a 35% da
          // viewport (seções longas, como a Experiência, mantêm a forma até o último conteúdo).
          const span = Math.max(1, Math.min(rect.height * 0.25, window.innerHeight * 0.35));
          t = Math.min(1, Math.max(0, (center - (rect.bottom - span)) / span));
        }
      });

      frame.progress = index + t * t * (3 - 2 * t);

      const scene = SCENES.find((name) => name === elements[index].dataset.scene) ?? "hero";
      const { activeScene, setActiveScene } = useSceneStore.getState();
      if (activeScene !== scene) setActiveScene(scene);
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [pathname]);

  useLenis((lenis) => {
    useSceneStore.getState().frame.velocity = Math.min(1, Math.abs(lenis.velocity) / 40);
  });

  return null;
}
