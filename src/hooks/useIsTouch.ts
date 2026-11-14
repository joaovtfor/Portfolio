"use client";

import { useMediaQuery } from "./useMediaQuery";

export function useIsTouch() {
  return useMediaQuery("(hover: none)");
}
