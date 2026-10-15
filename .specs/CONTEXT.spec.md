# SDD: Contexto, Design e Narrativa (Storytelling Scroller)

## 1. Visão Geral do Sistema
O projeto é o portfólio de um **Creative Front-End Engineer** (WebGL, motion e interfaces de alta performance), arquitetado como um "Storytelling Scroller": a home é uma narrativa revelada pelo scroll vertical, mirando o padrão de premiações (Awwwards). Rotas secundárias (estudos de caso e experimentos do Lab) aprofundam o conteúdo sem quebrar a continuidade visual, graças a um shell persistente (fundo WebGL, header, cursor) e a view transitions.

## 2. Tema e Identidade Visual: "Monolito e Fluido"
A direção de arte estabelece uma tensão visual entre infraestrutura sólida e front-end dinâmico.
- **Paleta (tokens em `src/app/globals.css`):** `#000000` (background/monolito) e `#85E8EA` (foreground/energia) são as cores de marca. Para hierarquia tipográfica existem apenas tokens derivados: `ink` (texto principal), `muted`, `subtle`, `line` (bordas), `surface` e `danger` (erros). Brilhos usam `shadow-glow`/`drop-shadow-glow`. Nenhuma cor literal fora dos tokens.
- **Tipografia (tríade):**
  - *Display / "Monolito":* Playfair Display (serif, caixa alta) para nomes, títulos de seção e de projetos.
  - *Voz técnica:* Geist Mono para labels, índices, períodos, métricas e microcopy de sistema (`>_`, `[ERRO]`).
  - *Texto corrido:* Geist Sans.
  - Tamanho mínimo de texto informativo: `text-xs` (12px). Escala fluida `--text-*` obrigatória.
- **Motivo de marca:** o glifo `>_` (terminal) aparece no preloader, no header e na forma final das partículas na seção de contato.

## 3. Micro-interações e WebGL
- **Fundo persistente:** um único canvas WebGL vive no shell (layout) e sobrevive às navegações. Ele contém um shader de fundo fluido (ruído com *domain warping* e borda cyan reagindo ao ponteiro) e o motor de partículas GPGPU (ver `tasks/ParticleEngineTask.spec.md`).
- **Narrativa 3D:** cada seção define uma forma-alvo para as partículas (morph guiado pelo scroll). O 3D conta a história; não é papel de parede.
- **Degradação graciosa:** mobile usa menos partículas e shader mais leve; `prefers-reduced-motion` renderiza um frame estático sob demanda; falha de WebGL cai para o fundo CSS.
- **Transições:** revelações conectadas ao scroll, botões magnéticos, cursor com rótulos contextuais e view transitions (elemento compartilhado) entre card e estudo de caso.

## 4. Estrutura Narrativa (Home)
1. **Hero (A Fundação):** statement de posicionamento + nome. Partículas formam o monolito.
2. **Sobre (A Engenharia):** manifesto revelado palavra a palavra e stack agrupada.
3. **Trabalhos (A Execução):** scroll horizontal (GSAP) com cards visuais que levam aos estudos de caso.
4. **Lab (A Experimentação):** experimentos WebGL interativos.
5. **Experiência (A Trajetória):** timeline com métricas em destaque.
6. **Contato (O Endpoint):** formulário estilo terminal; partículas convergem no `>_`. Footer com redes, hora local e voltar ao topo.

Persistente em todas as rotas: header mínimo (logo `>_`, navegação, índice da seção, PT/EN, CTA de contato) e menu flutuante no mobile.
