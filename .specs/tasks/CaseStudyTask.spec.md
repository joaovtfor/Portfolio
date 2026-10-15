# SDD Task: Estudos de Caso (Perfil A)

## 1. Responsabilidade
Aprofundar cada projeto em `/[locale]/work/[slug]`: contexto, destaques técnicos, stack e acesso (link público ou aviso de projeto privado).

## 2. Contrato de Renderização
- `src/app/[locale]/work/[slug]/page.tsx` (Server Component): busca o projeto em `src/data/projects.ts`; slug inexistente ⇒ `notFound()`. Metadata própria (title/description/OG).
- `CaseStudyView` (Client Component) para coreografias de entrada.
- Página marca `data-scene="work"` (partículas mantêm a forma de "Trabalhos").

## 3. Coreografias
- View transition de elemento compartilhado: `<ViewTransition name="project-{slug}" share="morph" default="none">` no card e no hero do caso.
- Navegação "próximo projeto" ao final; "voltar" retorna a `/{locale}#work`.

## 4. Critérios de Aceite
- Sem métricas inventadas: conteúdo derivado do currículo e das descrições existentes.
- Links externos com `rel="noopener noreferrer"`.
- Navegação totalmente funcional sem suporte a View Transitions (degradação graciosa).
