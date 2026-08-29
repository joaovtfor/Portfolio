"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { getContactSchema, ContactFormData } from "@/lib/validations";
import { sendContactEmail } from "@/actions/contact";
import type { Dictionary } from "@/dictionaries";
import { pt } from "@/dictionaries/pt";

export function ContactSection({ dict = pt }: { dict?: Dictionary }) {
  const contactSchema = getContactSchema(dict);

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
      const response = await sendContactEmail(data);
      
      if (response.success) {
        setServerState({ type: "success", message: dict.contact.successMsg });
        reset();
      } else {
        let msg = dict.contact.errorMsg;
        if (response.errorType === "validation") msg = dict.contact.validationError;
        else if (response.errorType === "rateLimit") msg = dict.contact.rateLimitError;
        
        setServerState({ type: "error", message: msg });
      }
    } catch (error) {
      console.error("Erro no envio", error);
      setServerState({
        type: "error",
        message: dict.contact.errorMsg,
      });
    }
  };

  return (
    <section id="contact" className="relative w-full min-h-[100svh] flex flex-col items-center justify-center bg-transparent z-20 py-12 md:py-24 px-6 md:px-12">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-12">
        
        <div className="flex flex-col gap-4 text-center md:text-left">
          <h2 className="text-4xl md:text-6xl font-serif text-white tracking-[0.1em] uppercase select-none">
            {dict.contact.title}
          </h2>
          <p className="text-neutral-400 font-sans text-sm md:text-base leading-relaxed max-w-md select-none">
            {dict.contact.description}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
                {dict.contact.nameLabel}
              </label>
              <input
                {...register("name")}
                id="name"
                disabled={isSubmitting}
                placeholder={dict.contact.namePlaceholder}
                aria-invalid={errors.name ? "true" : "false"}
                aria-required="true"
                aria-describedby={errors.name ? "name-error" : undefined}
                className="w-full bg-neutral-900/50 border border-white/10 rounded-none px-4 py-3 text-base md:text-sm text-white placeholder:text-neutral-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--foreground)] transition-all disabled:opacity-50 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus-visible:ring-red-500"
              />
              {errors.name && (
                <span id="name-error" className="text-red-400 text-xs mt-1">{errors.name.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
                {dict.contact.emailLabel}
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                disabled={isSubmitting}
                placeholder={dict.contact.emailPlaceholder}
                aria-invalid={errors.email ? "true" : "false"}
                aria-required="true"
                aria-describedby={errors.email ? "email-error" : undefined}
                className="w-full bg-neutral-900/50 border border-white/10 rounded-none px-4 py-3 text-base md:text-sm text-white placeholder:text-neutral-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--foreground)] transition-all disabled:opacity-50 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus-visible:ring-red-500"
              />
              {errors.email && (
                <span id="email-error" className="text-red-400 text-xs mt-1">{errors.email.message}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
              {dict.contact.messageLabel}
            </label>
            <textarea
              {...register("message")}
              id="message"
              disabled={isSubmitting}
              placeholder={dict.contact.messagePlaceholder}
              rows={5}
              aria-invalid={errors.message ? "true" : "false"}
              aria-required="true"
              aria-describedby={errors.message ? "message-error" : undefined}
              className="w-full bg-neutral-900/50 border border-white/10 rounded-none px-4 py-3 text-base md:text-sm text-white placeholder:text-neutral-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--foreground)] transition-all resize-none disabled:opacity-50 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus-visible:ring-red-500"
            />
            {errors.message && (
              <span id="message-error" className="text-red-400 text-xs mt-1">{errors.message.message}</span>
            )}
          </div>

          <div aria-live="polite" role="status" aria-atomic="true" className="h-6 relative">
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
                  {serverState.type === "success" ? `${dict.contact.successPrefix} ${serverState.message}` : `${dict.contact.errorPrefix} ${serverState.message}`}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative overflow-hidden bg-white text-black font-sans uppercase tracking-widest text-xs font-bold px-10 py-4 hover:bg-[var(--foreground)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isSubmitting ? dict.contact.sending : dict.contact.sendBtn}
                {!isSubmitting && (
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                )}
              </span>
            </button>
          </div>
        </form>

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
              className="group relative flex items-center justify-between p-6 border-r border-b border-white/10 overflow-hidden transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none"
            >
              <div className="absolute inset-0 bg-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 ease-[0.16,1,0.3,1] z-0" />

              <span className="relative z-10 font-sans text-xs uppercase tracking-widest font-bold text-neutral-400 group-hover:text-black transition-colors duration-300">
                {link.label}
              </span>

              <svg 
                aria-hidden="true"
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
