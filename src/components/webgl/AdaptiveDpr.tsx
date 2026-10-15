"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

const WARMUP_SECONDS = 3;
const SAMPLE_SECONDS = 2;
const MIN_FPS = 45;

// Reduz o DPR para 1 quando a média de FPS cai abaixo do limite (ParticleEngineTask.spec.md).
export function AdaptiveDpr() {
  const setDpr = useThree((state) => state.setDpr);
  const stats = useRef({ elapsed: 0, time: 0, frames: 0, lowered: false });

  useFrame((_, delta) => {
    const current = stats.current;
    if (current.lowered) return;

    current.elapsed += delta;
    if (current.elapsed < WARMUP_SECONDS) return;

    current.time += delta;
    current.frames += 1;
    if (current.time < SAMPLE_SECONDS) return;

    if (current.frames / current.time < MIN_FPS) {
      setDpr(1);
      current.lowered = true;
    }
    current.time = 0;
    current.frames = 0;
  });

  return null;
}
