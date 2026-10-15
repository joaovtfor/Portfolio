import { pt } from "./pt";
import { en } from "./en";

export type Locale = "pt" | "en";
export const defaultLocale: Locale = "pt";
export const locales: Locale[] = ["pt", "en"];

const dictionaries = {
  pt,
  en,
};

// Normaliza o segmento de rota `[locale]` (string) para um Locale suportado.
export function toLocale(value: string | undefined): Locale {
  return value === "en" ? "en" : defaultLocale;
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export type Dictionary = typeof pt;
