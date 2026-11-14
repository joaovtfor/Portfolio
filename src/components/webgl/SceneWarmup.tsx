"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useUIStore } from "@/store/uiStore";

// Os shaders compilam no primeiro quadro desenhado, e isso trava a thread principal e a composição
// da página por centenas de milissegundos. Três quadros garantem que esse custo já foi pago.
const WARMUP_FRAMES = 3;

interface SceneWarmupProps {
  /** Adia a contagem enquanto o conteúdo ainda prepara algo pesado (ex.: modelos sendo convertidos em formas). */
  hold?: boolean;
}

/**
 * Avisa a abertura (`Preloader`, via `uiStore.isSceneReady`) de que a cena já renderizou os primeiros
 * quadros. A varredura e a cortina só rodam depois disso, para não coincidirem com a travada.
 */
export function SceneWarmup({ hold = false }: SceneWarmupProps) {
  const frames = useRef(0);

  useFrame(() => {
    if (hold || frames.current >= WARMUP_FRAMES) return;
    frames.current += 1;
    if (frames.current === WARMUP_FRAMES) useUIStore.getState().setSceneReady();
  });

  return null;
}
