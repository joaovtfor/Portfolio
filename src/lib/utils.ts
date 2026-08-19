import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitário base da arquitetura para mesclar classes do Tailwind de forma inteligente.
 * Resolve conflitos de especificidade (ex: p-4 vs p-8) e aceita condicionais.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
