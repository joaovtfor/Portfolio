"use client";

import { RefObject } from "react";
import { WebGLScene } from "./Scene";
import { FluidMesh } from "./FluidMesh";
import { MobileFluidMesh } from "./MobileFluidMesh";
import { Particles } from "./Particles";

interface WebGLBackgroundProps {
  eventSource: RefObject<HTMLElement | null>;
  isMobile: boolean;
}

export default function WebGLBackground({ eventSource, isMobile }: WebGLBackgroundProps) {
  return (
    <WebGLScene eventSource={eventSource as RefObject<HTMLElement>}>
      {isMobile ? <MobileFluidMesh /> : <FluidMesh />}
      <Particles />
    </WebGLScene>
  );
}
