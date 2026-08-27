"use server";

import { contactSchema, ContactFormData } from "@/lib/validations";
import { headers } from "next/headers";

// Simples In-Memory Rate Limiter
// Nota: Em ambientes Edge/Serverless (Vercel), variáveis em memória resetam a cada "cold start".
// Para mitigações leves contra bots no mesmo container ativo, funciona perfeitamente.
// Para rate limit estrito global, seria ideal integrar o @upstash/ratelimit com Redis.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_MAX = 3; // Máximo de 3 submissões
const RATE_LIMIT_WINDOW = 1000 * 60 * 60; // Janela de 1 hora

export async function sendContactEmail(data: ContactFormData) {
  try {
    // 1. Re-validação Estrita Isomórfica (Zod) no Servidor
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, message: "Dados inválidos detectados na camada de segurança." };
    }

    const { name, email, message } = parsed.data;

    // 2. Rate Limiting via IP Header
    // Captura o IP real passado pelos load balancers da Vercel/Cloudflare
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "anonymous";
    const now = Date.now();
    const limitRecord = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - limitRecord.lastReset > RATE_LIMIT_WINDOW) {
      // Reseta a janela se o tempo passou
      limitRecord.count = 0;
      limitRecord.lastReset = now;
    }

    if (limitRecord.count >= RATE_LIMIT_MAX) {
      return { success: false, message: "Muitas tentativas. Por favor, tente novamente mais tarde." };
    }

    // Registra tentativa
    limitRecord.count += 1;
    rateLimitMap.set(ip, limitRecord);

    // 3. Integração Resend via Fetch (Edge-Friendly, sem dependência do SDK node-apenas)
    const API_KEY = process.env.RESEND_API_KEY;
    
    if (!API_KEY) {
      console.error("ERRO: RESEND_API_KEY não configurada no ambiente.");
      // Simula sucesso em modo dev se a chave não existir para não quebrar a UI
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
        from: "Portfolio <onboarding@resend.dev>", // Endereço padrão de teste do Resend
        to: "joaovtfor@hotmail.com", // Seu e-mail de recebimento
        reply_to: email, // Para você poder responder direto da sua caixa de entrada
        subject: `Novo contato via Portfolio: ${name}`,
        text: `Nome: ${name}\nE-mail: ${email}\n\nMensagem:\n${message}`,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      console.error("Falha ao disparar Resend:", errorData);
      return { success: false, message: "Falha na comunicação com a provedora de e-mails." };
    }

    // 4. Retorno de Sucesso
    return { success: true, message: "Mensagem recebida com sucesso. Retornarei em breve!" };
    
  } catch (error) {
    console.error("Erro interno na Server Action:", error);
    return { success: false, message: "Erro de execução na camada Edge." };
  }
}
