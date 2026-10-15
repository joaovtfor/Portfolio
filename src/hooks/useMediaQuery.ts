"use client";

import { useCallback, useSyncExternalStore } from "react";

// Media query sincronizada com o navegador; `false` no servidor e durante a hidratação.
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

const subscribeNoop = () => () => {};

// `true` apenas após a hidratação (substitui o padrão `mounted` com setState em effect).
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}
