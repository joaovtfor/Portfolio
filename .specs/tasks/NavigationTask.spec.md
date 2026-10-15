# SDD Task: Shell Persistente, Header e Footer (Perfil A)

## 1. Responsabilidade
Manter, entre navegações, os elementos que dão continuidade à experiência: fundo WebGL, preloader (somente na primeira carga), cursor customizado, header, menu flutuante mobile, footer e o "diretor de cena" que publica o progresso narrativo do scroll.

## 2. Contrato de Renderização
- `src/app/[locale]/layout.tsx` (Server Component) lê o `nonce` e renderiza `SiteShell`.
- `SiteShell` (Client Component): monta `Preloader`, `CustomCursor`, `WebGLBackground` (dynamic, `ssr: false`), `SiteHeader`, `MobileFloatingMenu`, `SceneDirector`, `<main id="main-content">` e `SiteFooter`.
- `SceneDirector` (Client, sem UI): lê os elementos `[data-scene]` e publica no `sceneStore` (Zustand) a seção ativa e o progresso/velocidade transitórios. Nunca manipula objetos 3D.

## 3. Coreografias
- Header fixo com `mix-blend-difference`: logo `>_`, links (Sobre, Trabalhos, Lab, Experiência), índice "0N / 06" em Geist Mono, PT/EN e CTA Contato. Links usam Lenis para rolar; fora da home levam a `/{locale}#secao`.
- Footer: nome, ano, hora local de Passo Fundo (atualizada por minuto), redes e "voltar ao topo".
- Cursor: rótulo contextual a partir de `data-cursor-label`.

## 4. Critérios de Aceite
- Ordem de tabulação: skip link → header → conteúdo → footer.
- `aria-current="true"` no link da seção ativa.
- Mobile: header reduzido (logo + índice); ações no menu flutuante.
