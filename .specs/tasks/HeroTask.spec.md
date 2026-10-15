# SDD Task: Hero Section

## 1. Responsabilidade
Renderizar a primeira dobra (100svh) com impacto visual imediato ("Monolito"): statement de posicionamento (Creative Front-End Engineer), nome em tipografia display massiva e o CTA primário para os trabalhos.

## 2. Contrato de Componentes
- `HeroSection` (Client Component - coreografia de entrada após o preloader).
- `HeroTitle` (Client Component - animação letra a letra via Framer Motion).
- `HeroButton` (Client Component - CTA "Ver trabalhos", rola até `#work`).
- O fundo WebGL **não** pertence ao hero: vive no shell (ver `NavigationTask.spec.md`). A seção marca `data-scene="hero"` para o motor de partículas formar o monolito.

## 3. Comportamento
- Statement e metadados (cargo, foco, stack) usam a voz técnica (Geist Mono), mínimo `text-xs`.
- O CTA rola com Lenis (≤ 2s) e é instantâneo com `prefers-reduced-motion`.
- Contato não é o CTA primário: fica persistente no header.

## 4. Critérios de Aceite e Acessibilidade
- Título encapsulado na tag `<h1>` apropriada (SEO/Acessibilidade).
- Escala tipográfica deve usar CSS `clamp()` para fluidez do mobile ao 4K.
- Elementos decorativos com `pointer-events-none`; textos informativos selecionáveis.
