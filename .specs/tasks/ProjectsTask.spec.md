# SDD Task: Seção de Trabalhos (Scroll Horizontal)

## 1. Responsabilidade
Exibir os projetos interceptando o scroll vertical nativo e mapeando-o para um deslocamento horizontal, mantendo a sensação "Monolítica". Cada card é a porta de entrada para o estudo de caso (`CaseStudyTask.spec.md`).

## 2. Contrato de Componentes
- `ProjectsWrapper` (Client Component - Controla contexto do GSAP e ScrollTrigger). Seção `#work`, `data-scene="work"`.
- `ProjectCard` (Client Component - link interno `next/link` para `/[locale]/work/[slug]`).

## 3. Comportamento e Interatividade
- **GSAP ScrollTrigger (≥ 768px):** pin do wrapper; deslocamento X = `(largura interna - 100vw)`. Transforms 3D dos cards atualizados apenas no `onUpdate` do tween e métricas recalculadas no `onRefresh`.
- **Mobile:** scroll horizontal nativo com snap.
- **Visual:** a imagem do projeto é visível por padrão (escurecida) e ganha brilho/parallax interno no hover/foco. Bordas `border-line` com `backdrop-blur`.
- **Hover/WebGL Integration:** o hover publica a posição do card no `uiStore`; o motor de partículas cria um atrator nessa coordenada.
- **View transition:** a imagem do card e o hero do estudo de caso compartilham o mesmo `name` (`project-{slug}`).
- Cursor exibe o rótulo contextual "Ver".

## 4. Contrato de Dados (Tipagem Zod/TS)
```typescript
export const ProjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  image: z.string().startsWith("/projects/"),
  stack: z.array(z.string()),
  highlights: z.array(z.string()),
  link: z.string().url().optional(),
  isPrivate: z.boolean(),
});
export type Project = z.infer<typeof ProjectSchema>;
```
Métricas e afirmações devem refletir o currículo (fonte da verdade).
