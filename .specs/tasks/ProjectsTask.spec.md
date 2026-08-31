# SDD Task: Seção de Projetos (Scroll Horizontal)

## 1. Responsabilidade
Exibir a linha do tempo e o portfólio técnico interceptando o scroll vertical nativo e mapeando-o para um deslocamento horizontal, mantendo a sensação "Monolítica".

## 2. Contrato de Componentes
- `ProjectsWrapper` (Client Component - Controla contexto do GSAP e ScrollTrigger).
- `ProjectCard` (Client Component - Interface de apresentação isolada).

## 3. Comportamento e Interatividade
- **GSAP ScrollTrigger:** Executa o "pin" do `ProjectsWrapper`. O conteúdo horizontal move no eixo X equivalente à `(largura total interna - 100vw)`.
- **Hover/WebGL Integration:** Quando um `ProjectCard` sofre hover, uma mensagem via Context/Store notifica o `FluidCanvas` (se ativo globalmente) para aplicar uma perturbação no shader focada nas coordenadas do card.
- Os cards possuem bordas subtis ativadas por um `backdrop-filter: blur` + borda `#85E8EA` de opacidade `0.2`.

## 4. Contrato de Dados (Tipagem Zod/TS)
```typescript
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  techStack: z.array(z.string()),
  description: z.string(),
  repositoryUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
});
export type Project = z.infer<typeof ProjectSchema>;