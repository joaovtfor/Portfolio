# SDD Task: Lab de Experimentos WebGL (Perfil A)

## 1. Responsabilidade
Área de testes de layout e WebGL **fora da home**: rota `/[locale]/labs` (`data-scene="lab"`) listando experimentos e rotas `/[locale]/labs/[slug]` com cada experimento em tela cheia. Sem link no header/menu; `noindex` e fora do sitemap.

## 2. Contrato de Renderização
- `/[locale]/labs/page.tsx` renderiza `LabSection` (Client Component) com cards de experimento (título, descrição, técnicas).
- `src/app/[locale]/labs/[slug]/page.tsx` (Server Component) + `LabExperimentView` (Client; experimentos via `dynamic` com `ssr: false`). O "voltar" leva a `/[locale]/labs`.
- Enquanto um experimento está aberto, o fundo do shell é pausado (`uiStore.backgroundPaused`) para existir apenas um loop de render ativo.

## 3. Experimentos
1. **flow-field:** o motor GPGPU em modo playground (curl noise, força do ponteiro, clique alterna formas).
2. **liquid-image:** distorção de imagem por shader com ondulação guiada pela velocidade do ponteiro e separação RGB.
3. **background-studio:** compara variações do fundo do site (`BackgroundMesh` com `variant`) atrás do motor de partículas real: `fluid` (atual), `dots` (matriz de pontos com ondulação no ponteiro), `topographic` (curvas de nível de um relevo suave próprio, com colina sob o ponteiro; sem o passo de fluido), `aurora` (manchas suaves, sem o passo de fluido), `terminal` (varredura CRT sutil + grão), `ascii` (campo como grade de caracteres `. : - + #`), `grid` (blueprint com linhas mestras e pulso), `oscilloscope` (traços com ondas que crescem perto do ponteiro), `rain` (colunas de blocos caindo devagar) e `void` (só grão e vinheta). Barra de botões acessível (`aria-pressed`), teclas 1–9 e 0 trocam a variação e P liga/desliga as partículas. O estúdio abre no fundo atual do site (`SITE_BACKGROUND`, hoje `terminal`).

## 4. Critérios de Aceite
- Overlay com título, instruções e botão de voltar acessíveis por teclado.
- `prefers-reduced-motion`: experimento renderiza estático com aviso.
- Falha de WebGL exibe mensagem de fallback.
