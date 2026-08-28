"use server";

import { contactSchema, ContactFormData } from "@/lib/validations";
import { headers } from "next/headers";

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 1000 * 60 * 60;

export async function sendContactEmail(data: ContactFormData) {
  try {
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, message: "Dados inválidos detectados na camada de segurança." };
    }

    const { name, email, message } = parsed.data;

    const headersList = await headers();
    const rawIp = headersList.get("x-forwarded-for") || "anonymous";
    const ip = rawIp.split(",")[0].trim();
    const now = Date.now();
    const limitRecord = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - limitRecord.lastReset > RATE_LIMIT_WINDOW) {
      limitRecord.count = 0;
      limitRecord.lastReset = now;
    }

    for (const [key, record] of rateLimitMap.entries()) {
      if (now - record.lastReset > RATE_LIMIT_WINDOW) rateLimitMap.delete(key);
    }

    if (limitRecord.count >= RATE_LIMIT_MAX) {
      return { success: false, message: "Muitas tentativas. Por favor, tente novamente mais tarde." };
    }

    limitRecord.count += 1;
    rateLimitMap.set(ip, limitRecord);

    const API_KEY = process.env.RESEND_API_KEY;
    
    if (!API_KEY) {
      console.error("ERRO: RESEND_API_KEY não configurada no ambiente.");
      if (process.env.NODE_ENV === "development") {
        console.log("[DEV MODE] E-mail simulado:", parsed.data);
        return { success: true, message: "Mensagem recebida com sucesso. Retornarei em breve!" };
      }
      return { success: false, message: "Erro de configuração no servidor de e-mail." };
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio <onboarding@resend.dev>",
        to: "joaovtfor@hotmail.com",
        reply_to: email,
        subject: `Novo contato via Portfolio: ${name}`,
        text: `Nome: ${name}\nE-mail: ${email}\n\nMensagem:\n${message}`,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      console.error("Falha ao disparar Resend:", errorData);
      return { success: false, message: "Falha na comunicação com a provedora de e-mails." };
    }

    return { success: true, message: "Mensagem recebida com sucesso. Retornarei em breve!" };
    
  } catch (error) {
    console.error("Erro interno na Server Action:", error);
    return { success: false, message: "Erro de execução na camada Edge." };
  }
}
