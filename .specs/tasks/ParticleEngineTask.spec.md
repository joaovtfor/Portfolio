# SDD Task: Motor de Partículas GPGPU (Perfil A)

## 1. Responsabilidade
Renderizar o sistema de partículas do fundo com simulação inteiramente na GPU e transformar o 3D em narrativa: cada seção (`data-scene`) define uma forma-alvo, e o scroll faz o morph entre elas.

## 2. Contrato de Renderização
- `ParticleField` (Client, dentro do Canvas R3F): `GPUComputationRenderer` com texturas de posição e velocidade (ping-pong). 256² partículas no desktop, 128² no mobile; `HalfFloatType` quando float não é renderizável.
- Formas geradas uma vez na CPU (e regeneradas em resize) como `DataTexture`: `hero` (logo do React), `about` (icosaedro), `work` (grade ondulada), `lab` (torus knot), `experience` (corda dinâmica + anéis, ver `ExperienceTask.spec.md`), `contact` (terminal `>_`). ~18% das partículas são "poeira" compartilhada entre formas para dar continuidade.
- **Modelos `.glb`** (`public/models/`, `particles/models.ts`): hero, about e contact vêm de modelos amostrados uma vez por sessão — linhas (export em wireframe) e arestas vivas de malhas, além da superfície das malhas. Sem halo ao redor do modelo (a área densa ficava visível e quebrava a imersão; a poeira já cobre a tela). Sem Draco/meshopt (o decoder WASM é bloqueado pela CSP). Enquanto carregam, essas formas são nuvens soltas no mesmo lugar e as partículas se condensam no modelo quando ele chega; falha no carregamento mantém a nuvem.
- Comunicação com o DOM exclusivamente via `sceneStore`/`uiStore` (Zustand): progresso narrativo, velocidade do scroll (Lenis) e atrator de card.

## 3. Coreografias (shader de velocidade)
- Mola em direção ao alvo `mix(formaA, formaB, morph)` + curl noise (amplitude aumenta com a velocidade do scroll).
- Força do ponteiro calculada em espaço de tela (projeção com a matriz view-projection), corrigida pelo aspect ratio.
- Atrator do card em hover cria uma órbita local.
- **Modelos "olham" para o cursor:** cada forma com modelo gira em torno do próprio centro para apontar a frente ao raio do ponteiro (plano 4 unidades à frente do modelo ≈ até 35° nas bordas), com rotação quase imediata (slerp curto, ~60 ms) e mola 3× mais rígida nas partículas do modelo para acompanhar sem atraso. A rotação é aplicada ao alvo no shader, só nas partículas dentro do raio do modelo (a poeira distante não gira).
- Cor do token `--foreground`; brilho cresce com a velocidade da partícula; opacidade por seção (menor em seções de leitura).

## 4. Critérios de Aceite
- `prefers-reduced-motion`: sem simulação; frame estático com a forma da seção atual.
- DPR adaptativo (reduz para 1 quando a média de FPS cai abaixo de 45).
- Fallback sem erro quando o GPGPU não é suportado (fundo CSS + shader de fundo).
- Delta de simulação limitado a 1/30s para evitar explosões após troca de aba; frames com delta 0 não calculam a velocidade do cursor (evita NaN, que apagaria todas as partículas de forma permanente).
