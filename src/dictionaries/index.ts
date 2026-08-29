import { pt } from "./pt";
import { en } from "./en";

export type Locale = "pt" | "en";
export const defaultLocale: Locale = "pt";
export const locales: Locale[] = ["pt", "en"];

const dictionaries = {
  pt,
  en,
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export type Dictionary = typeof pt;
