"use client";

import { useState, useEffect } from "react";

export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  return isTouch;
}
