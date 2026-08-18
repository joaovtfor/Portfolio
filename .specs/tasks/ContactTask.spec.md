# SDD Task: Contato e Edge Server Actions

## 1. Responsabilidade
Ponto final da SPA. Coleta intenções de contato via formulário pragmático, validação isomórfica (Zod) e disparo de transações assíncronas via Edge (Resend), com tratamento rigoroso contra spam.

## 2. Contrato de Comunicação
- **Client Form:** `react-hook-form` + `@hookform/resolvers/zod`.
- **Server Action:** `submitContactForm(data: ContactFormData)`
  - Executa na Cloudflare Edge.
  - Rate Limiting: Verifica cabeçalho X-Forwarded-For para prevenir floods (implementação inicial via Map em memória ou KV básico).

## 3. UI e Acessibilidade (WCAG)
- Feedback visual de Loading gerenciado via `useFormStatus` ou `useTransition`.
- Botão CTA bloqueado durante tráfego.
- Respostas de Sucesso/Erro exibidas em contêiner `<div aria-live="polite">`.
- Os inputs, quando em `focus-visible`, exibem um outline nítido `#85E8EA` simulando um terminal.

## 4. Integração Resend
- Uso do pacote nativo `resend` injetando a chave via `process.env.RESEND_API_KEY`.
- Tratamento explícito de `try/catch`. Nenhuma stack trace vaza para o cliente; erros retornam um genérico "Falha ao processar solicitação no servidor de borda."