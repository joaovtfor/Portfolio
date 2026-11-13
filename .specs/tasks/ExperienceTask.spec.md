# SDD Task: Experiência — Corda de Partículas (Perfil A)

## 1. Responsabilidade
Transformar a timeline da seção `#experience` (`data-scene="experience"`) numa "corda" de partículas condensadas que é construída conforme o scroll, com um marco em anel para cada experiência. A dupla hélice foi removida.

## 2. Contrato de Renderização
- `ExperienceList` (Client, DOM): continua dona do layout e do progresso de scroll (`useScroll`). Via `useRopePublisher`, mede a geometria em pixels a cada scroll/resize e publica no `sceneStore.frame.rope` (Zustand, mutação transitória): caminho em NDC (até 12 vértices), progresso de preenchimento (0–1 do comprimento) e marcos (posição, escala, ativo, hover). Nunca manipula objetos 3D.
- `ParticleField` (WebGL) lê `frame.rope` e passa como uniforms ao shader de velocidade. Uma textura de parâmetros (`ropeParams`, gerada com as formas) classifica cada partícula da forma `experience`: corda (com parâmetro `t` no comprimento), anel (índice do marco e ângulo) ou espera (posição estática solta).
- **Desktop:** o caminho é a linha da timeline (topo → base); os marcos ficam nos pontos de cada card.
- **Mobile (< 768px):** o caminho começa na esquerda e faz zigue-zague ocupando toda a largura; cada dobra (alternando direita/esquerda) é o marco de um card.

## 2.1 Conteúdo do card
Dados em `ExperienceItem` (`src/data/resume.ts`). Ordem de leitura: empresa e período (+ métrica `highlight`, quando houver), cargo, entregas e tecnologias.
- **`bullets`:** até 4 frases curtas, uma por linha, cada uma com uma entrega ou resultado. Substituem o parágrafo de descrição.
- **`skills`:** apenas tecnologias, exibidas como badges (`TechBadges`, `src/components/ui/TechBadges.tsx`). Práticas e resultados (SSO, BI, Web Vitals…) ficam nos bullets.
- Texto de apoio do título: `{anos}+ anos` seguido de uma frase curta (`dict.experience.description`).

## 3. Coreografias
- **Construção:** partículas com `t ≤ preenchimento` travam na corda (mola mais rígida, curl noise quase nulo → leitura de linha única). Na frente de construção, um enxame converge para a ponta; o restante espera solto.
- **Cursor:** a força do ponteiro dispersa a corda ("explode"), e a mola a recompõe. No desktop a corda é rígida, então ela se curva em volta do cursor e volta à linha sem vaivém.
- **Precisão no desktop (só nesta seção):** a corda construída e os anéis ficam presos à timeline do DOM durante o scroll. O `ParticleField` mede quanto a corda andou no quadro (primeiro vértice do caminho, em NDC → mundo) e o shader de posição desloca essas partículas exatamente isso (`uRopeShift`; o quanto cada uma "rola" vai no canal w da textura de velocidade). A mola delas é rígida (300) e criticamente amortecida, inclusive no enxame perto da ponta, para a partícula travar na linha quase sem convergir. A ponta segue o scroll sem suavização. Resultado: rolando, a linha continua fina e cada anel fica na altura do cabeçalho do card. No mobile (`uRopeTrack` = 0) o comportamento anterior continua.
- **Marcos (anel proporcional):** ao ser alcançado, cada marco forma um anel de partículas orbitando a corda. Experiências com `highlight` (métrica) têm anel maior; o hover no card expande o anel.
- **Mobile:** cada card surge quando a corda alcança sua dobra, com fade e translate vindo do lado oposto à dobra.

## 4. Critérios de Aceite
- `prefers-reduced-motion` (sem simulação): a linha e os pontos DOM da timeline continuam visíveis como fallback; no mobile os cards aparecem sem animação.
- Texto dos cards legível sobre a corda no mobile (fundo translúcido com blur).
- Nenhuma cor literal; nenhum `any`/cast.
