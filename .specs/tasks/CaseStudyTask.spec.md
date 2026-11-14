# SDD Task: Estudos de Caso (Perfil A)

## 1. Responsabilidade
Aprofundar cada projeto em `/[locale]/work/[slug]`: contexto, destaques técnicos, stack e acesso (link público ou aviso de projeto privado).

## 2. Contrato de Renderização
- `src/app/[locale]/work/[slug]/page.tsx` (Server Component): busca o projeto em `src/data/projects.ts`; slug inexistente ⇒ `notFound()`. Metadata própria (title/description/OG).
- `CaseStudyView` (Client Component) para coreografias de entrada.
- `CaseStudyVortex` (Client, sem UI): vórtice de partículas da página; mede o conteúdo no DOM e publica posição, raio e força em `sceneStore.frame.vortex`. Nunca toca no 3D.
- Página marca `data-scene="work"` (partículas mantêm a forma de "Trabalhos").

- **Ordem da informação:** o cabeçalho traz, antes da imagem e de qualquer scroll, o título, o subtítulo com a empresa (`subtitle / company`) e os badges de tecnologia (`TechBadges` com toda a `stack`). Depois da imagem: visão geral (`description`) e destaques à esquerda, acesso à direita.

## 3. Coreografias
- Visão geral revelada palavra a palavra pelo scroll (`RevealText`, o mesmo efeito do Sobre), adaptada para não atrasar a leitura: o texto já chega legível (`from` 0.4) e a revelação termina cedo (`top 90%` → `top 55%`). Com `prefers-reduced-motion`, sem animação.
- View transition de elemento compartilhado: `<ViewTransition name="project-{slug}" share="morph" default="none">` no card e no hero do caso.
- Navegação "próximo projeto" ao final; "voltar" retorna a `/{locale}#work`.
- **Vórtice (ligado ao scroll):** cada sub-seção tem um lugar ao lado do seu rótulo: título (`h1`), rótulos de seção (`h2`; "Visão geral" e "Acesso" na mesma faixa contam como um, vale o da esquerda) e "Próximo projeto". O lugar é o espaço livre à direita do rótulo, de preferência na mesma altura (texto, imagens, header fixo e menu flutuante viram uma grade de folga). O vórtice está ao lado de um rótulo quando esse rótulo passa por 45% da altura da tela; entre dois rótulos, percorre um caminho pelos corredores livres da página, proporcional ao scroll (com uma pausa suave perto de cada rótulo), sem rota aleatória. Começa pequeno ao lado do título e cresce a cada seção (diminui ao voltar); o raio também encolhe onde o espaço é estreito (só o centro precisa estar livre). Surge ~0,5 s depois de abrir a página, crescendo a partir de um ponto. Ao sair da página (home ou outra rota) a força vai a 0 e ele some; ao abrir o próximo projeto, recomeça. Com `prefers-reduced-motion`, não existe.

## 4. Critérios de Aceite
- Sem métricas inventadas: conteúdo derivado do currículo e das descrições existentes.
- Links externos com `rel="noopener noreferrer"`.
- Navegação totalmente funcional sem suporte a View Transitions (degradação graciosa).
- Vórtice: no desktop o centro nunca fica sobre texto ou imagem. No mobile os parágrafos ocupam a largura toda e não há corredor entre as seções: no trecho entre dois rótulos ele atravessa o texto por instantes; ao lado de cada rótulo fica no espaço livre.
