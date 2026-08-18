# AGENTS.md: Diretrizes de Orquestração e Processo

## 1. Regra de Ouro (Contexto antes do Código)
Nenhum agente autônomo está autorizado a gerar, refatorar ou modificar código sem antes ler o arquivo `.spec.md` correspondente à feature/task atual. O desenvolvimento é estritamente guiado pelas definições do SDD.

## 2. Pragmatismo e YAGNI
Contexto é rei. Adapte a arquitetura ao tamanho e momento do projeto. Aplique YAGNI (You Aren't Gonna Need It) de forma rigorosa; resolva o problema atual da forma mais simples possível sem comprometer o futuro. Elimine abstrações desnecessárias.

## 3. Separação de Responsabilidades (SoC)
- **UI Estrutural vs. 3D:** Componentes React estruturais (HTML/CSS) NUNCA devem gerenciar estado 3D.
- **Isolamento WebGL:** Toda lógica de Shaders, Canvas e `@react-three/fiber` (R3F) deve estar contida em componentes isolados. A comunicação com o DOM React deve ser feita exclusivamente via eventos globais otimizados ou `Zustand`.

## 4. Segurança by Design
Mantenha foco absoluto na segurança. Nunca sugira ou implemente trechos de código que burlem as proteções da Edge ou representem risco de segurança para o sistema em produção. 
- A validação isomórfica com `Zod` é obrigatória.
- Respeite as políticas de CSP configuradas no Middleware.

## 5. Adesão Estrita ao Design System
- Agentes devem obrigatoriamente utilizar os tokens definidos no `tailwind.config.ts`.
- É terminantemente proibido injetar cores hexadecimais *hardcoded* (`#000000`, `#85E8EA`) nas classes utilitárias ou no CSS inline. Use as variáveis do tema (`bg-background`, `text-foreground`, `shadow-glow`).
