export const LAB_EXPERIMENTS = ["flow-field", "liquid-image"] as const;

export type LabSlug = (typeof LAB_EXPERIMENTS)[number];

export function isLabSlug(value: string): value is LabSlug {
  return (LAB_EXPERIMENTS as readonly string[]).includes(value);
}
