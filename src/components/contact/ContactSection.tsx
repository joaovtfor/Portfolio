"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { contactSchema, ContactFormData } from "@/lib/validations";
import { sendContactEmail } from "@/actions/contact";

export function ContactSection() {
  const [serverState, setServerState] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  // Limpa a mensagem automaticamente para ativar o fade out
  useEffect(() => {
    if (serverState.message) {
      const timer = setTimeout(() => {
        setServerState({ type: null, message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [serverState.message]);

  const onSubmit = async (data: ContactFormData) => {
    setServerState({ type: null, message: "" });
    try {
      console.log("Disparando 5 requisições simultâneas para testar Rate Limiting...");
      
      // Cria um array com 5 requisições para a Server Action
      const promises = Array.from({ length: 5 }).map(() => sendContactEmail(data));
      
      // Aguarda todas responderem
      const responses = await Promise.all(promises);
      
      // Loga os resultados de todas as requisições para ver o bloqueio acontecendo
      console.table(responses);
      
      // Pega o resultado da última requisição (que deve ser o bloqueio do Rate Limiter)
      const finalResponse = responses[responses.length - 1];
      
      if (finalResponse.success) {
        setServerState({ type: "success", message: finalResponse.message });
        reset(); // Limpa o form após sucesso real
      } else {
        setServerState({ type: "error", message: finalResponse.message });
      }

    } catch (error) {
      console.error("Erro no envio", error);
      setServerState({
        type: "error",
        message: "Falha catastrófica ao processar solicitação no servidor.",
      });
    }
  };

  return (
    <section id="contact" className="relative w-full min-h-[100svh] flex flex-col items-center justify-center bg-transparent z-20 py-12 md:py-24 px-6 md:px-12">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-12">
        
        {/* Cabeçalho do Formulário */}
        <div className="flex flex-col gap-4 text-center md:text-left">
          <h2 className="text-4xl md:text-6xl font-serif text-white tracking-[0.1em] uppercase select-none">
            VAMOS CONVERSAR!
          </h2>
          <p className="text-neutral-400 font-sans text-sm md:text-base leading-relaxed max-w-md select-none">
            Pronto para construir o próximo nível da sua aplicação? Me envie os detalhes do projeto e vamos arquitetar juntos.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Nome */}
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
                Nome
              </label>
              <input
                {...register("name")}
                id="name"
                disabled={isSubmitting}
                placeholder="Seu nome"
                className="w-full bg-neutral-900/50 border border-white/10 rounded-none px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--foreground)] transition-all disabled:opacity-50"
              />
              {errors.name && (
                <span className="text-red-400 text-xs mt-1">{errors.name.message}</span>
              )}
            </div>

            {/* Input E-mail */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
                E-mail
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                disabled={isSubmitting}
                placeholder="Seu melhor e-mail"
                className="w-full bg-neutral-900/50 border border-white/10 rounded-none px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--foreground)] transition-all disabled:opacity-50"
              />
              {errors.email && (
                <span className="text-red-400 text-xs mt-1">{errors.email.message}</span>
              )}
            </div>
          </div>

          {/* Textarea Mensagem */}
          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
              Mensagem
            </label>
            <textarea
              {...register("message")}
              id="message"
              disabled={isSubmitting}
              placeholder="Descreva seu projeto ou desafio..."
              rows={5}
              className="w-full bg-neutral-900/50 border border-white/10 rounded-none px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--foreground)] transition-all resize-none disabled:opacity-50"
            />
            {errors.message && (
              <span className="text-red-400 text-xs mt-1">{errors.message.message}</span>
            )}
          </div>

          {/* Feedback de Servidor */}
          <div aria-live="polite" className="h-6 relative">
            <AnimatePresence>
              {serverState.message && (
                <motion.span
                  key="feedback-message"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute text-sm ${serverState.type === "success" ? "text-[var(--foreground)]" : "text-red-400"}`}
                >
                  {serverState.type === "success" ? `>_ ${serverState.message}` : `[ERRO] ${serverState.message}`}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Botão de Submit (CTA) */}
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative overflow-hidden bg-white text-black font-sans uppercase tracking-widest text-xs font-bold px-10 py-4 hover:bg-[var(--foreground)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                {!isSubmitting && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                )}
              </span>
            </button>
          </div>
        </form>

        {/* Terminal Grid Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-white/10 mt-8 w-full">
          {[
            { label: "Email", href: "mailto:joaovtfor@hotmail.com" },
            { label: "LinkedIn", href: "https://linkedin.com/in/joaodefor" },
            { label: "GitHub", href: "https://github.com/joaovtfor" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.label !== "Email" ? "_blank" : undefined}
              rel={link.label !== "Email" ? "noopener noreferrer" : undefined}
              className="group relative flex items-center justify-between p-6 border-r border-b border-white/10 overflow-hidden transition-colors duration-300"
            >
              {/* Efeito de Preenchimento (Terminal Select) */}
              <div className="absolute inset-0 bg-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 ease-[0.16,1,0.3,1] z-0" />

              <span className="relative z-10 font-sans text-xs uppercase tracking-widest font-bold text-neutral-400 group-hover:text-black transition-colors duration-300">
                {link.label}
              </span>

              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="relative z-10 text-neutral-500 group-hover:text-black transition-all duration-500 ease-[0.16,1,0.3,1] group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:scale-110"
              >
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
