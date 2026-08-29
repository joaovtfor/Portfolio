import { z } from "zod";
import type { Dictionary } from "@/dictionaries";

export function getContactSchema(dict: Dictionary) {
  return z.object({
    name: z.string()
      .trim()
      .min(2, dict.contact.validation.nameMin)
      .max(100, dict.contact.validation.nameMax),
    email: z.string()
      .trim()
      .email(dict.contact.validation.emailInvalid),
    message: z.string()
      .trim()
      .min(10, dict.contact.validation.messageMin)
      .max(1000, dict.contact.validation.messageMax),
  });
}

export type ContactFormData = z.infer<ReturnType<typeof getContactSchema>>;
