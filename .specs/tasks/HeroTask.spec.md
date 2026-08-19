# SDD Task: Hero Section

## 1. Responsabilidade
Renderizar a primeira dobra (100vh) com impacto visual imediato ("Monolito"). Apresentar o título principal, ancorar a tipografia massiva e servir como ponto de inicialização do canvas WebGL.

## 2. Contrato de Componentes
- `HeroSection` (Server Component - Wrapper).
- `HeroTitle` (Client Component - Aplica animações de entrada via Framer Motion).
- `FluidCanvas` (Client Component - R3F).

## 3. Comportamento WebGL (FluidCanvas)
- Shader customizado em GLSL que simula um fluido viscoso `#000000`.
- O shader reage ao vetor de movimento do ponteiro (Mouse/Touch).
- As extremidades/bordas do fluido aplicam um efeito de refração sutil emitindo a cor `#85E8EA`.
- **Constraint de Performance:** O R3F deve suspender a renderização se o container não estiver visível (Intersection Observer nativo do Drei).

## 4. Critérios de Aceite e Acessibilidade
- Título encapsulado na tag `<h1>` apropriada (SEO/Acessibilidade).
- Escala tipográfica deve usar CSS `clamp()` para fluidez do mobile ao 4K.
- Elementos HTML/UI devem possuir `pointer-events-none` no fundo e focar no botão primário de CTA, que usará pseudo-elementos de glow.
