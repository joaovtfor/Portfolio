# SDD Task: Motor de Partículas GPGPU (Perfil A)

## 1. Responsabilidade
Renderizar o sistema de partículas do fundo com simulação inteiramente na GPU e transformar o 3D em narrativa: cada seção (`data-scene`) define uma forma-alvo, e o scroll faz o morph entre elas.

## 2. Contrato de Renderização
- `ParticleField` (Client, dentro do Canvas R3F): `GPUComputationRenderer` com texturas de posição e velocidade (ping-pong). 256² partículas no desktop, 128² no mobile; `HalfFloatType` quando float não é renderizável.
- Formas geradas uma vez na CPU (e regeneradas em resize) como `DataTexture`: `hero` (monolito), `about` (esfera), `work` (grade ondulada), `lab` (torus knot), `experience` (hélice vertical), `contact` (glifo `>_`). ~18% das partículas são "poeira" compartilhada entre formas para dar continuidade.
- Comunicação com o DOM exclusivamente via `sceneStore`/`uiStore` (Zustand): progresso narrativo, velocidade do scroll (Lenis) e atrator de card.

## 3. Coreografias (shader de velocidade)
- Mola em direção ao alvo `mix(formaA, formaB, morph)` + curl noise (amplitude aumenta com a velocidade do scroll).
- Força do ponteiro calculada em espaço de tela (projeção com a matriz view-projection), corrigida pelo aspect ratio.
- Atrator do card em hover cria uma órbita local.
- Cor do token `--foreground`; brilho cresce com a velocidade da partícula; opacidade por seção (menor em seções de leitura).

## 4. Critérios de Aceite
- `prefers-reduced-motion`: sem simulação; frame estático com a forma da seção atual.
- DPR adaptativo (reduz para 1 quando a média de FPS cai abaixo de 45).
- Fallback sem erro quando o GPGPU não é suportado (fundo CSS + shader de fundo).
- Delta de simulação limitado a 1/30s para evitar explosões após troca de aba.
