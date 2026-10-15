# SDD: Infraestrutura e Base Tecnológica

## 1. Stack Base (Contratos)
- **Framework:** Next.js 16 (App Router, runtime Node.js). O Edge Runtime está deprecated e não deve ser usado.
- **Ambiente Local:** Containers Docker standalone via Docker Desktop, priorizando orquestração otimizada via `docker-compose.yml`.
- **Estilização:** Tailwind CSS v4 (CSS-first: tokens em `@theme` no `src/app/globals.css`). Primitivos headless (ex.: Radix UI) apenas quando houver necessidade real.
- **Motion UI:** Framer Motion (mount/unmount e micro-interações) + GSAP/ScrollTrigger (timelines e scroll) + Lenis (`lenis/react`) sincronizado ao ticker do GSAP.
- **3D/Shaders:** `@react-three/fiber` (R3F) encapsulando o contexto WebGL de forma isolada; simulação GPGPU via `GPUComputationRenderer` do three.

## 2. Qualidade e Resiliência (Lint/Tipagem)
- TypeScript Strict Mode: **Obrigatório**.
- `any`: **Proibido**.
- Type casting forçado (`as Type`): Permitido apenas ao interceptar dados não estruturados de APIs de terceiros.
- CI (GitHub Actions) executa type-check, lint e o build do Worker (OpenNext) em PRs e pushes para `main`/`develop`. Dependabot mira `develop`.

## 3. Segurança By Design (OWASP)
- **Proxy (`src/proxy.ts`):** CSP com `nonce` por request (`'strict-dynamic'`), exigindo renderização dinâmica das páginas. Headers estáticos de segurança (HSTS, nosniff, frame, referrer, permissions) ficam em `next.config.ts`.
- **Validação E2E:** `Zod` usado de forma isomórfica (Client e Server). Nenhuma payload avança para o Resend sem passar pelo schema.
- **Anti-abuso:** honeypot no formulário, rate limit por `cf-connecting-ip` (best-effort por isolate) e, para um limite mais forte, o binding de Rate Limiting do Workers (regras de rate limiting do WAF só filtram por método a partir do plano Business).

## 4. Build e Deploy
- **Target:** Cloudflare Workers via adaptador OpenNext (`@opennextjs/cloudflare`), configurado em `wrangler.jsonc` e `open-next.config.ts`. URL pública definida por `NEXT_PUBLIC_SITE_URL`.
- **Engine:** Node (via `pnpm`, versão fixada em `packageManager`).
- **Comandos Agente:**
  - Dev: `pnpm run dev` (executado preferencialmente dentro do container Docker)
  - Build Next: `pnpm run build`
  - Preview do Worker: `pnpm run preview`
  - Deploy: `pnpm run deploy`

## 5. Padrão de Especificação de Features (SDD Templates)
Para manter o princípio YAGNI e guiar múltiplos agentes, toda nova funcionalidade deve ser documentada em .specs/tasks/ seguindo um de dois perfis:

### Perfil A: UI/Visual Feature (Ex: Hero, WebGL, UI)
Focado em visualização sem tráfego de dados sensíveis.
1. **Responsabilidade:** Papel do componente na interface.
2. **Contrato de Renderização:** Divisão estrita entre Server Components e Client Components.
3. **Coreografias:** Definição de gatilhos visuais (GSAP, Framer, Shaders).
4. **Critérios de Aceite:** Acessibilidade (WCAG), contraste e responsividade.

### Perfil B: Data/Action Feature (Ex: Forms, APIs)
Focado em rotas que interagem com o exterior ou mutacionam dados.
1. **Responsabilidade:** Fluxo da informação.
2. **Contrato de Dados:** Schemas estritos (Zod) isomórficos (Client/Server).
3. **Segurança (OWASP):** Sanitização, tratativas contra Bots/Spam e Rate Limiting.
4. **Integrações:** Tratamento de erros seguro (sem vazar stack trace) para APIs externas (ex: Resend).
