"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { getContactSchema, ContactFormData } from "@/lib/validations";
import { sendContactEmail } from "@/actions/contact";
import type { Dictionary } from "@/dictionaries";

// Inputs "terminal": fonte mono, prompt `>` e contorno brilhante no foco (ContactTask.spec.md).
const INPUT_CLASSES = "w-full bg-surface/60 border border-line rounded-none pl-9 pr-4 py-3 font-mono text-base md:text-sm text-ink placeholder:text-subtle focus:outline-none focus-visible:border-foreground focus-visible:shadow-glow transition-all disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:shadow-none";

function Prompt() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute left-4 top-3 font-mono text-sm text-foreground">
      &gt;
    </span>
  );
}

export function ContactSection({ dict }: { dict: Dictionary }) {
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
    <section
      id="contact"
      data-scene="contact"
      aria-labelledby="contact-title"
      className="relative w-full min-h-[100svh] flex flex-col items-center justify-center bg-transparent z-20 py-24 px-6 md:px-12"
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-12">

        <div className="flex flex-col gap-4 text-center md:text-left">
          <p aria-hidden="true" className="font-mono text-xs uppercase tracking-widest text-subtle">06 —</p>
          <h2 id="contact-title" className="text-4xl md:text-6xl font-serif text-ink tracking-[0.1em] uppercase">
            {dict.contact.title}
          </h2>
          <p className="text-muted font-sans text-sm md:text-base leading-relaxed max-w-md">
            {dict.contact.description}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="relative flex flex-col gap-6 w-full" noValidate>
          <div aria-hidden="true" className="absolute -left-[9999px] top-0 w-px h-px overflow-hidden">
            <label htmlFor="website">Website</label>
            <input {...register("website")} id="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="font-mono text-xs uppercase tracking-widest text-subtle font-bold">
                {dict.contact.nameLabel}
              </label>
              <div className="relative">
                <Prompt />
                <input
                  {...register("name")}
                  id="name"
                  autoComplete="name"
                  disabled={isSubmitting}
                  placeholder={dict.contact.namePlaceholder}
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-required="true"
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={INPUT_CLASSES}
                />
              </div>
              {errors.name && (
                <span id="name-error" className="font-mono text-danger text-xs mt-1">{errors.name.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-mono text-xs uppercase tracking-widest text-subtle font-bold">
                {dict.contact.emailLabel}
              </label>
              <div className="relative">
                <Prompt />
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  autoComplete="email"
                  disabled={isSubmitting}
                  placeholder={dict.contact.emailPlaceholder}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-required="true"
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={INPUT_CLASSES}
                />
              </div>
              {errors.email && (
                <span id="email-error" className="font-mono text-danger text-xs mt-1">{errors.email.message}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="font-mono text-xs uppercase tracking-widest text-subtle font-bold">
              {dict.contact.messageLabel}
            </label>
            <div className="relative">
              <Prompt />
              <textarea
                {...register("message")}
                id="message"
                disabled={isSubmitting}
                placeholder={dict.contact.messagePlaceholder}
                rows={5}
                aria-invalid={errors.message ? "true" : "false"}
                aria-required="true"
                aria-describedby={errors.message ? "message-error" : undefined}
                className={`${INPUT_CLASSES} resize-none`}
              />
            </div>
            {errors.message && (
              <span id="message-error" className="font-mono text-danger text-xs mt-1">{errors.message.message}</span>
            )}
          </div>

          <div aria-live="polite" role="status" aria-atomic="true" className="min-h-6 relative">
            <AnimatePresence>
              {serverState.message && (
                <motion.span
                  key="feedback-message"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute font-mono text-sm ${serverState.type === "success" ? "text-foreground" : "text-danger"}`}
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
              className="group relative overflow-hidden bg-ink text-background font-mono uppercase tracking-widest text-xs font-bold px-10 py-4 hover:bg-foreground hover:shadow-glow transition-[background-color,box-shadow] duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background focus:outline-none"
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
      </div>
    </section>
  );
}
