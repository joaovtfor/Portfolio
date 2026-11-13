# SDD Task: Shell Persistente, Header e Footer (Perfil A)

## 1. Responsabilidade
Manter, entre navegações, os elementos que dão continuidade à experiência: fundo WebGL, preloader (somente na primeira carga), cursor customizado, header, menu flutuante mobile, footer e o "diretor de cena" que publica o progresso narrativo do scroll.

## 2. Contrato de Renderização
- `src/app/[locale]/layout.tsx` (Server Component) valida o idioma da rota (`isLocale`; inválido ⇒ `notFound()`), lê o `nonce` e renderiza `SiteShell`.
- 404: caminho desconhecido dentro de um idioma (`/pt/x`) usa `[locale]/not-found.tsx`, dentro do shell. Idioma inválido (`/x.txt`) recebe a página 404 padrão do Next, porque o próprio layout raiz é quem recusa a rota.
- `SiteShell` (Client Component): monta `Preloader`, `CustomCursor`, `WebGLBackground` (dynamic, `ssr: false`), `SiteHeader`, `MobileFloatingMenu`, `SceneDirector`, `<main id="main-content">` e `SiteFooter`.
- `SceneDirector` (Client, sem UI): lê os elementos `[data-scene]` e publica no `sceneStore` (Zustand) a seção ativa e o progresso/velocidade transitórios. Nunca manipula objetos 3D.

## 3. Coreografias
- **Abertura (`Preloader`, só na primeira carga):** o nome (`personalInfo.shortName`, em caixa alta) é o indicador de carregamento e termina como título do Hero.
  1. *Entrada:* cortina em duas metades (`bg-background`) cobre a tela, com o `>_` no canto. As letras sobem de trás de uma máscara, só em contorno (`text-outline`), por animação CSS (`animate-intro-rise`): começa no primeiro paint, antes da hidratação.
  2. *Carga:* o cursor vertical (o `_` da marca) pisca no início do nome enquanto o site termina de carregar: fontes e cena WebGL aquecida (`uiStore.isSceneReady`, publicado por `SceneWarmup`). Só então ele varre o nome de uma vez e o preenche (`text-ink`), com o contador em Geist Mono (tiras de dígitos) andando junto. Teto de espera: 4 s.
  3. *Passagem:* no fim da varredura, duas linhas saem do nome até as bordas e a cortina abre nessa linha (uma metade sobe, a outra desce). Na home, o nome se desloca até o `<h1>` do Hero (`[data-intro-target]`), que aparece por baixo e assume o lugar; em outras rotas, ou com âncora na URL, o nome sai pela máscara antes de a cortina abrir.
  - Estado em `uiStore.introPhase`: `playing` → `revealing` (cortina abrindo) → `done` (h1 visível). O Hero só lê esse estado; o `Preloader` só lê `[data-intro-target]`.
  - Por que a varredura espera: a compilação dos shaders no primeiro quadro WebGL trava a thread principal e a própria composição da página por centenas de milissegundos (medido: ~0,7 s em D3D11), e nenhuma animação atravessa esse instante sem saltar. Até ele passar, nada se move rápido na tela.
  - Sem GSAP nem rAF: toda a coreografia usa só `transform`/`opacity`, por CSS e Web Animations API, criada de uma vez com atrasos. Assim roda no compositor mesmo com a thread principal ocupada, e cursor, recorte e contador saem da mesma curva.
  - Duração: varredura e abertura levam ~1,65 s. Do primeiro paint ao Hero revelado, ~2,2 s com cache de shaders e ~3 s em carga fria (desktop de referência).
  - `prefers-reduced-motion`: sem nome nem varredura; a cortina some num fade de 0,3 s.
- Header fixo com `mix-blend-difference`: logo `>_`, links (Sobre, Trabalhos, Experiência), índice "0N / 05" em Geist Mono (o Lab vive em `/labs`, fora da home e do índice), PT/EN e CTA Contato. Links usam Lenis para rolar; fora da home levam a `/{locale}#secao`.
- Footer: nome, ano, hora local de Passo Fundo (atualizada por minuto), redes e "voltar ao topo".
- Cursor: rótulo contextual a partir de `data-cursor-label`.

## 4. Critérios de Aceite
- Ordem de tabulação: skip link → header → conteúdo → footer.
- `aria-current="true"` no link da seção ativa.
- Mobile: header reduzido (logo + índice); ações no menu flutuante.
- Abertura: a cortina é `pointer-events-none`, não captura foco e o conteúdo abaixo continua na árvore de acessibilidade; o contador é o `role="progressbar"` e as cópias do nome são `aria-hidden`. O scroll (Lenis) fica travado só enquanto ela cobre a tela.
- Abertura não atrasa o LCP: o nome preenchido e o texto do Hero são pintados sob a cortina desde o primeiro paint (nada fica em `opacity: 0` à espera do JS).
- Abertura sem saltos: durante a varredura e a abertura da cortina, nenhum quadro acima de ~17 ms e nenhuma tarefa longa (Chrome, GPU real, dev e produção); o contador avança no máximo 4 por quadro.
