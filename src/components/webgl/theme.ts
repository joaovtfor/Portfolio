import * as THREE from "three";

// Lê um token de cor (CSS custom property) e devolve seus componentes sRGB, prontos para
// shaders que escrevem direto no framebuffer (sem <colorspace_fragment>). Ver AGENTS.md §5.
export function readThemeColor(variable: string): THREE.Color {
  const color = new THREE.Color();
  if (typeof document === "undefined") return color;

  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  if (value) color.setStyle(value).convertLinearToSRGB();
  return color;
}
