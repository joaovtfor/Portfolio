# SDD Task: Lab de Experimentos WebGL (Perfil A)

## 1. Responsabilidade
Demonstrar domínio de WebGL além do fundo do site: seção `#lab` (`data-scene="lab"`) listando experimentos e rotas `/[locale]/lab/[slug]` com cada experimento em tela cheia.

## 2. Contrato de Renderização
- `LabSection` (Client Component) com cards de experimento (título, descrição, técnicas).
- `src/app/[locale]/lab/[slug]/page.tsx` (Server Component) + `LabExperiment` (Client, `dynamic` com `ssr: false`).
- Enquanto um experimento está aberto, o fundo do shell é pausado (`uiStore.backgroundPaused`) para existir apenas um loop de render ativo.

## 3. Experimentos
1. **flow-field:** o motor GPGPU em modo playground (curl noise, força do ponteiro, clique alterna formas).
2. **liquid-image:** distorção de imagem por shader com ondulação guiada pela velocidade do ponteiro e separação RGB.

## 4. Critérios de Aceite
- Overlay com título, instruções e botão de voltar acessíveis por teclado.
- `prefers-reduced-motion`: experimento renderiza estático com aviso.
- Falha de WebGL exibe mensagem de fallback.
