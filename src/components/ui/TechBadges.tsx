import { cn } from "@/lib/utils";

interface TechBadgesProps {
  items: string[];
  /** Nome acessível da lista (ex.: "Stack"). */
  label?: string;
  /** Mostra só os primeiros `max` itens e resume o restante em "+N". */
  max?: number;
  className?: string;
}

/** Badges de tecnologia: usados nos cards de projeto, no estudo de caso e na experiência. */
export function TechBadges({ items, label, max, className }: TechBadgesProps) {
  const visible = max ? items.slice(0, max) : items;
  const rest = items.length - visible.length;

  return (
    <ul aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {visible.map((item) => (
        <li key={item} className="px-2.5 py-1 rounded-full border border-line bg-background/40 font-mono text-xs text-ink/80">
          {item}
        </li>
      ))}
      {rest > 0 && (
        <li className="px-2.5 py-1 rounded-full border border-line bg-background/40 font-mono text-xs text-subtle">
          +{rest}
        </li>
      )}
    </ul>
  );
}
