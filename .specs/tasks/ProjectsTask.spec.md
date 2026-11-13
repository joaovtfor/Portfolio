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
- **Tecnologias de cara:** cada card mostra, sem hover, as 3 primeiras tecnologias de `stack` como badges (`TechBadges`) e resume o restante em `+N`.
- **Título do card:** `text-xl md:text-3xl`, para caber em uma linha (título em duas linhas empurra a descrição para cima dos badges).
- **Descrição:** aparece no hover/foco a partir de `md`. No mobile o card mostra só título, subtítulo e badges (a descrição fica no estudo de caso).
- **Texto de apoio do título** (`dict.projects.description`): uma frase curta que diz o que há nos cards.
- **Sem vórtice no hover:** passar o mouse ou tocar no card não mexe nas partículas; o vórtice vive só no estudo de caso (ver `CaseStudyTask.spec.md`).
- **View transition:** a imagem do card e o hero do estudo de caso compartilham o mesmo `name` (`project-{slug}`).
- Cursor exibe o rótulo contextual "Ver".

## 4. Contrato de Dados (Tipagem Zod/TS)
```typescript
export const ProjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  subtitle: z.string(),
  company: z.string(),      // empresa onde o projeto foi desenvolvido
  description: z.string(),  // texto de entrada: o que é e o que foi entregue, em até duas frases curtas
  image: z.string().startsWith("/projects/"),
  stack: z.array(z.string()), // apenas tecnologias, da mais relevante para a menos
  highlights: z.array(z.string()),
  link: z.string().url().optional(),
  isPrivate: z.boolean(),
});
export type Project = z.infer<typeof ProjectSchema>;
```
Métricas e afirmações devem refletir o currículo (fonte da verdade).

Regras de conteúdo:
- `stack` lista só tecnologias (frameworks, linguagens, bancos, infraestrutura). Práticas e conceitos (Clean Code, UI/UX, BI, OWASP, RBAC, AES-256) vão para `description` ou `highlights`.
- Projetos internos (`isPrivate: true`) não trazem dados sensíveis: sem nomes de servidores, endereços, bancos, pessoas ou detalhes operacionais de segurança.
