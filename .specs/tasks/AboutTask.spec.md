# SDD Task: Seção Sobre / Stack (Perfil A)

## 1. Responsabilidade
Segunda dobra ("A Engenharia"): manifesto curto de posicionamento, resumo profissional e stack agrupada, com dados vindos de `src/data/resume.ts` (fonte: currículo).

## 2. Contrato de Renderização
- `AboutSection` (Client Component): seção `#about`, `data-scene="about"`.
- Texto integral presente no DOM (SEO/leitores de tela); a animação altera apenas opacidade.

## 3. Coreografias
- Manifesto revelado palavra a palavra com GSAP ScrollTrigger (`scrub`). Com `prefers-reduced-motion`, texto exibido sem animação.
- Grupos de stack (Criativo, Core, Engenharia, Back-end & Mobile) com labels em Geist Mono.

## 4. Critérios de Aceite
- `<h2>` da seção; contraste AA para texto corrido; mínimo `text-xs`.
- Layout em coluna única no mobile; duas colunas a partir de `md`.
