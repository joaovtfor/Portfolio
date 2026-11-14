# SDD Task: Contato e Server Actions

## 1. Responsabilidade
Ponto final da narrativa. Coleta intenções de contato via formulário pragmático, validação isomórfica (Zod) e disparo de transações assíncronas (Resend), com tratamento rigoroso contra spam. Seção `#contact`, `data-scene="contact"` (partículas formam o `>_`).

## 2. Contrato de Comunicação
- **Client Form:** `react-hook-form` + `@hookform/resolvers/zod`.
- **Server Action:** `sendContactEmail(data: ContactFormData)`
  - Executa no Worker (runtime Node).
  - Honeypot (`website`) no schema compartilhado: preenchido ⇒ sucesso silencioso sem envio.
  - Rate Limiting: chave `cf-connecting-ip` (não forjável); Map em memória é best-effort por isolate. Limite mais forte: binding de Rate Limiting do Workers (o WAF só filtra POST a partir do plano Business).

## 3. UI e Acessibilidade (WCAG)
- Feedback visual de Loading gerenciado via estado de submissão do formulário.
- Botão CTA bloqueado durante tráfego.
- Respostas de Sucesso/Erro exibidas em contêiner `<div aria-live="polite">`, com microcopy objetiva (sem alarmismo).
- Os inputs, quando em `focus-visible`, exibem um outline nítido `foreground` simulando um terminal (prompt `>` em Geist Mono).

## 4. Integração Resend
- Chamada à API REST do Resend com `process.env.RESEND_API_KEY`.
- Tratamento explícito de `try/catch`. Nenhuma stack trace vaza para o cliente; erros retornam mensagem genérica localizada.
