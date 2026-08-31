# SDD: Infraestrutura e Base Tecnológica

## 1. Stack Base (Contratos)
- **Framework:** Next.js (App Router, Edge Runtime).
- **Ambiente Local:** Containers Docker standalone via Docker Desktop, priorizando orquestração otimizada via `docker-compose.yml`.
- **Estilização:** Tailwind CSS + Radix UI (Componentes Headless acessíveis).
- **Motion UI:** Framer Motion (para transições de mount/unmount e layouts compartilhados) + GSAP (para controle refinado de timeline e scroll hijacking).
- **3D/Shaders:** `@react-three/fiber` (R3F) encapsulando o contexto WebGL de forma isolada.

## 2. Qualidade e Resiliência (Lint/Tipagem)
- TypeScript Strict Mode: **Obrigatório**.
- `any`: **Proibido**.
- Type casting forçado (`as Type`): Permitido apenas ao interceptar dados não estruturados de APIs de terceiros.
- Dependabot e Actions de CI (Lint + Type Check) devem barrar merges na branch `main`.

## 3. Segurança By Design (OWASP)
- **Edge Middleware:** Implementação de CSP (Content Security Policy) com `nonce` injetado via Headers no ciclo de request.
- **Validação E2E:** `Zod` usado de forma isomórfica (Client e Server). Nenhuma payload avança para o Resend sem passar por `schema.parse()`.

## 4. Build e Deploy
- **Target:** Cloudflare Pages (inicialmente `[project].pages.dev`).
- **Engine:** Node (via `pnpm`).
- **Comandos Agente:**
  - Dev: `pnpm run dev` (executado preferencialmente dentro do container Docker)
  - Prod Build: `pnpm run build`
  
## 5. Padrão de Especificação de Features (SDD Templates)
Para manter o princípio YAGNI e guiar múltiplos agentes, toda nova funcionalidade deve ser documentada em .specs/tasks/ seguindo um de dois perfis:

### Perfil A: UI/Visual Feature (Ex: Hero, WebGL, UI)
Focado em visualização sem tráfego de dados sensíveis.
1. **Responsabilidade:** Papel do componente na interface.
2. **Contrato de Renderização:** Divisão estrita entre Server Components e Client Components.
3. **Coreografias:** Definição de gatilhos visuais (GSAP, Framer, Shaders).
4. **Crit�rios de Aceite:** Acessibilidade (WCAG), contraste e responsividade.

### Perfil B: Data/Action Feature (Ex: Forms, APIs)
Focado em rotas que interagem com o exterior ou mutacionam dados.
1. **Responsabilidade:** Fluxo da informação.
2. **Contrato de Dados:** Schemas estritos (Zod) isomórficos (Client/Server).
3. **Segurança (OWASP):** Sanitização, tratativas contra Bots/Spam e Rate Limiting.
4. **Integrações:** Tratamento de erros seguro (sem vazar stack trace) para APIs externas (ex: Resend).
