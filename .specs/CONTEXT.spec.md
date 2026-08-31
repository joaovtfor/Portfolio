# SDD: Contexto, Design e Narrativa (Storytelling Scroller)

## 1. Visão Geral do Sistema
O projeto é um portfólio de desenvolvedor arquitetado como uma Single Page Application (SPA) fluida. O padrão principal é o "Storytelling Scroller", onde não há mudança de páginas; toda a navegação e apresentação de conteúdo são guiadas e reveladas pelo scroll vertical do usuário, mirando um padrão de qualidade visual de premiações (Awwwards Top 10).

## 2. Tema e Identidade Visual: "Monolito e Fluido"
A direção de arte estabelece uma tensão visual entre infraestrutura sólida e front-end dinâmico.
- **Cores Estritas:** Apenas `#000000` (Preto/Vazio/Monolito) e `#85E8EA` (Cyan/Energia). Variações visuais ocorrem apenas por opacidades e emissões de luz (*glow*).
- **Tipografia:** Uma dualidade entre uma fonte estrutural, limpa e massiva (ex: Geist Sans ou Inter) para o texto principal, e uma fonte *monospace* (ex: Geist Mono) injetada nativamente pelo Next.js para dados técnicos e acentos de design.

## 3. Micro-interações e WebGL
- **Background Interativo (Desktop):** Um shader GLSL rodando via WebGL/R3F simula um fluido negro que preenche a tela. Ele reage ao ponteiro do mouse, criando distorções sutis e emitindo uma refração Cyan nas bordas.
- **Degradação Graciosa (Mobile e Bateria):** Devido ao alto custo computacional de shaders de fluido, dispositivos móveis e usuários com `prefers-reduced-motion` receberão um *fallback* hiper-otimizado. A sensação de "fluido" será mantida através de gradientes CSS sutis animados via transformações na GPU ou um shader 2D de baixíssima complexidade (ruído Perlin estático), prevenindo o consumo excessivo de bateria sem quebrar a identidade visual.
- **Transições:** Interfaces surgem com precisão matemática através de máscaras conectadas ao scroll. Componentes acionáveis possuem estados de *focus/hover* magnéticos com *glow* limpo.

## 4. Estrutura Narrativa (4 Dobras)
A experiência do usuário é dividida em seções logicamente conectadas:
1. **Hero (A Fundação):** 100vh. Impacto massivo com a tipografia de apresentação. Ponto de inicialização da interatividade do shader fluido de fundo.
2. **Tech & About (A Engenharia):** Exposição da stack e da mentalidade pragmática. Blocos de texto que se revelam conforme a rolagem avança.
3. **Projects (A Execução):** O scroll vertical nativo é interceptado (via GSAP) e transformado em um *scroller* horizontal. Cards de projeto limpos. O *hover* em um card distorce pontualmente o fluido 3D do background.
4. **Contact (O Endpoint):** Formulário restrito e direto. Inputs que, quando focados, simulam terminais com contornos brilhantes em `#85E8EA`. Validado rigidamente antes do envio.