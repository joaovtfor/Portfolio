# SDD Task: Seção Sobre / Stack (Perfil A)

## 1. Responsabilidade
Segunda dobra ("A Engenharia"): frase de abertura, resumo profissional e stack agrupada, com dados vindos de `src/data/resume.ts` (fonte: currículo).

**Tom dos textos (vale para o site inteiro):** simples, direto e pragmático, para um recrutador entender o contexto em segundos. A frase de abertura (`manifesto`) diz cargo, nível e desde quando; o resumo (`summary`) diz onde trabalha hoje, com quê e três resultados concretos, em frases curtas. Sem jargão inflado e sem repetir a lista de tecnologias que já está no painel da stack.

## 2. Contrato de Renderização
- `AboutSection` (Client Component): seção `#about`, `data-scene="about"`.
- `RevealText` (`src/components/ui/RevealText.tsx`, Client Component compartilhado com o estudo de caso): parágrafo revelado palavra a palavra. Props `from` (opacidade inicial), `start` e `end` (trecho do scroll).
- Texto integral presente no DOM (SEO/leitores de tela); a animação altera apenas opacidade.

## 3. Coreografias
- Frase de abertura revelada palavra a palavra com GSAP ScrollTrigger (`scrub`), via `RevealText` com os valores padrão (`from` 0.12, `top 80%` → `bottom 45%`). Com `prefers-reduced-motion`, texto exibido sem animação.
- Grupos de stack (Criativo, Core, Engenharia, Back-end & Mobile) com labels em Geist Mono.
- **Sticky scroll (desktop):** a coluna da stack fica fixa (`sticky`, logo abaixo do header) num painel compacto e translúcido (`bg-background/30`, `backdrop-blur-md`) enquanto manifesto, resumo e formação rolam. O icosaedro de partículas ocupa o espaço livre abaixo do painel: `AboutSection` mede o painel (topo fixo + altura) em resize (com debounce) e publica `sceneStore.aboutSlot` (frações da viewport); o motor regenera a forma `about` para caber nesse espaço com folga para a rotação, então o tamanho acompanha a altura da tela. Em telas baixas (variante `short`: desktop com altura ≤ 760px) o painel compacta espaçamentos. No mobile (coluna única) o fluxo é normal e o slot é nulo.

## 4. Critérios de Aceite
- `<h2>` da seção; contraste AA para texto corrido; mínimo `text-xs`.
- Layout em coluna única no mobile; duas colunas a partir de `md`.
