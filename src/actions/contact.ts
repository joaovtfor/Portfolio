"use server";

import { getContactSchema, ContactFormData } from "@/lib/validations";
import { headers } from "next/headers";
import { pt } from "@/dictionaries/pt";

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 1000 * 60 * 60;

const serverSchema = getContactSchema(pt);

export async function sendContactEmail(data: ContactFormData) {
  try {
    const parsed = serverSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, errorType: "validation" };
    }

    const { name, email, message } = parsed.data;

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "anonymous";
    const now = Date.now();
    const limitRecord = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - limitRecord.lastReset > RATE_LIMIT_WINDOW) {
      limitRecord.count = 0;
      limitRecord.lastReset = now;
    }

    if (limitRecord.count >= RATE_LIMIT_MAX) {
      return { success: false, errorType: "rateLimit" };
    }

    limitRecord.count += 1;
    rateLimitMap.set(ip, limitRecord);

    const API_KEY = process.env.RESEND_API_KEY;
    
    if (!API_KEY) {
      console.error("ERRO: RESEND_API_KEY não configurada no ambiente.");
      if (process.env.NODE_ENV === "development") {
        console.log("[DEV MODE] E-mail simulado:", parsed.data);
        return { success: true };
      }
      return { success: false, errorType: "serverError" };
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
      return { success: false, errorType: "serverError" };
    }

    return { success: true };
    
  } catch (error) {
    console.error("Erro interno na Server Action:", error);
    return { success: false, errorType: "serverError" };
  }
}
