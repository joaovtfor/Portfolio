# SDD Task: Hero Section

## 1. Responsabilidade
Renderizar a primeira dobra (100svh) com impacto visual imediato ("Monolito"): statement de posicionamento (Creative Front-End Engineer), nome em tipografia display massiva e o CTA primário para os trabalhos.

## 2. Contrato de Componentes
- `HeroSection` (Client Component). Na primeira carga nasce pintado sob a cortina da abertura (`uiStore.introPhase`, ver `NavigationTask.spec.md`): statement e metadados só assentam (translate, sem fade) quando ela abre. Ao voltar para a home por navegação não há cortina, e eles entram com fade.
- `HeroTitle` (Client Component). Na primeira carga não anima: o nome da abertura chega pronto a esta posição e o `<h1>` (marcado com `data-intro-target`) assume o lugar dele. Ao voltar para a home, o nome entra letra a letra via Framer Motion.
- `HeroButton` (Client Component - CTA "Ver trabalhos", rola até `#work`).
- O fundo WebGL **não** pertence ao hero: vive no shell (ver `NavigationTask.spec.md`). A seção marca `data-scene="hero"` para o motor de partículas formar o logo do React (modelo `.glb`).

## 3. Comportamento
- Statement e metadados (cargo, foco, stack) usam a voz técnica (Geist Mono), mínimo `text-xs`.
- O CTA rola com Lenis (≤ 2s) e é instantâneo com `prefers-reduced-motion`.
- Contato não é o CTA primário: fica persistente no header.

## 4. Critérios de Aceite e Acessibilidade
- Título encapsulado na tag `<h1>` apropriada (SEO/Acessibilidade).
- Escala tipográfica deve usar CSS `clamp()` para fluidez do mobile ao 4K.
- Elementos decorativos com `pointer-events-none`; textos informativos selecionáveis.
- As caixas de letra do `<h1>` (uma por letra, sem kerning, espaço de `0.3em`, `text-hero`, `leading-none`) são as mesmas do nome no `Preloader`; mudar um lado sem o outro faz a passagem da abertura aparecer.
