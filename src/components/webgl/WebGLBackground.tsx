"use client";

import { RefObject } from "react";
import { WebGLScene } from "./Scene";
import { BackgroundMesh } from "./BackgroundMesh";
import { ParticleField } from "./ParticleField";
import { AdaptiveDpr } from "./AdaptiveDpr";

interface WebGLBackgroundProps {
  eventSource: RefObject<HTMLElement | null>;
  isMobile: boolean;
  paused: boolean;
}

export default function WebGLBackground({ eventSource, isMobile, paused }: WebGLBackgroundProps) {
  return (
    <WebGLScene eventSource={eventSource} paused={paused}>
      <BackgroundMesh quality={isMobile ? "low" : "high"} />
      <ParticleField isMobile={isMobile} />
      <AdaptiveDpr />
    </WebGLScene>
  );
}
