import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(100, "Nome muito longo"),
  email: z.string().email("Por favor, insira um e-mail válido"),
  message: z.string()
    .min(10, "Sua mensagem deve ter no mínimo 10 caracteres")
    .max(1000, "Sua mensagem atingiu o limite de caracteres (1000)"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
