import { z } from "zod";

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

const PROJECTS_PT = [
  {
    slug: "abc-guinchos",
    title: "ABC Guinchos",
    subtitle: "Gestão para Guinchos",
    description: "Processamento massivo de dados em tempo real (via SSE), juntamente com uma interface focada em UI/UX construída em cima de um Design System via Figma.",
    image: "/projects/abc-guinchos.webp",
    stack: ["Server-Sent Events", "Design System", "Figma", "UI/UX"],
    highlights: [
      "Processamento de dados em tempo real via Server-Sent Events.",
      "Interface construída sobre um Design System desenhado no Figma.",
      "Experiência focada em UI/UX para a operação diária.",
    ],
    link: "https://www.guinchosassociacao.com.br/",
    isPrivate: false,
  },
  {
    slug: "efesus",
    title: "Efesus 2.0",
    subtitle: "Gestão para Distribuidoras",
    description: "Estruturação de análises de dados em múltiplos módulos de BI para o setor de distribuição, com foco em tempo de resposta e fluidez visual.",
    image: "/projects/efesus.webp",
    stack: ["React", "Vue.js", "Laravel", "BI"],
    highlights: [
      "Dashboards de BI com matrizes de dados complexas.",
      "Base de design reconstruída para múltiplos dispositivos.",
      "Front-end React/Vue.js integrado ao back-end Laravel.",
    ],
    link: "https://braveo.veplex.com.br/login",
    isPrivate: false,
  },
  {
    slug: "nomade-eq",
    title: "Nomade EQ",
    subtitle: "Solução para Obras e Engenharia",
    description: "Otimização da performance, interface e estrutura de código. Implementação de Clean Code e refatoração de módulos principais.",
    image: "/projects/nomade-eq.webp",
    stack: ["Flutter", "Figma", "Clean Code"],
    highlights: [
      "Otimização de performance e da interface do aplicativo.",
      "Implementação de Clean Code na base existente.",
      "Refatoração dos módulos principais.",
    ],
    link: "https://play.google.com/store/apps/details?id=com.nomade_eq.flutter&hl=pt_BR",
    isPrivate: false,
  },
  {
    slug: "sso-idp",
    title: "SSO IdP",
    subtitle: "Single Sign-On Identity Provider interno",
    description: "Unificação de autenticação dos sistemas internos via SSO IdP com foco no Google Workspace, com utilização do Laravel Passport e deploy dockerizado via Portainer.",
    image: "/projects/sso-idp.webp",
    stack: ["Laravel Passport", "Google Workspace", "NGINX", "Docker", "Portainer"],
    highlights: [
      "Autenticação unificada dos sistemas internos via SSO.",
      "Integração com o Google Workspace.",
      "Requisições protegidas por proxy NGINX e deploy dockerizado via Portainer.",
    ],
    isPrivate: true,
  },
  {
    slug: "gestao-senhas",
    title: "Gestão de Senhas",
    subtitle: "Sistema interno para armazenamento de senhas",
    description: "Foco em segurança de ponta (Top 10 OWASP), abordando criptografia AES-256, Rate Limiting, proteção contra XSS e CSRF, Logs, timeout e autenticação multifator.",
    image: "/projects/gestao-senhas.webp",
    stack: ["AES-256", "MFA", "OWASP Top 10"],
    highlights: [
      "Criptografia AES-256 dos segredos armazenados.",
      "Rate limiting e proteção contra XSS e CSRF.",
      "Autenticação multifator, logs de auditoria e timeout de sessão.",
    ],
    isPrivate: true,
  },
  {
    slug: "gestao-frotas",
    title: "Gestão de Frotas",
    subtitle: "Sistema interno para solicitação de veículos",
    description: "Utilização de Websocket via Laravel Reverb, para atualização em tempo real de solicitações de veículos para viagens, com múltiplos níveis de acesso.",
    image: "/projects/gestao-frotas.webp",
    stack: ["Laravel Reverb", "WebSocket", "RBAC"],
    highlights: [
      "Atualização em tempo real via WebSocket (Laravel Reverb).",
      "Fluxo de solicitação de veículos para viagens.",
      "Múltiplos níveis de acesso.",
    ],
    isPrivate: true,
  },
  {
    slug: "automacao-iam",
    title: "Automação IAM",
    subtitle: "Solução de IAM/ILM baseada em processos de RH",
    description: "Sistema unificado 24/7 que atua com criação de contas em múltiplas plataformas via TOTVS. Conta com Logs constantes, relatórios diários e gestão via e-mail.",
    image: "/projects/automacao-iam.webp",
    stack: ["IAM/ILM", "TOTVS", "Automação"],
    highlights: [
      "Criação de contas em múltiplas plataformas a partir dos processos de RH (TOTVS).",
      "Operação 24/7 com logs constantes.",
      "Relatórios diários e gestão via e-mail.",
    ],
    isPrivate: true,
  },
] satisfies Project[];

const PROJECTS_EN = [
  {
    slug: "abc-guinchos",
    title: "ABC Guinchos",
    subtitle: "Tow Truck Management",
    description: "Massive real-time data processing (via SSE), along with a UI/UX-focused interface built on top of a Design System via Figma.",
    image: "/projects/abc-guinchos.webp",
    stack: ["Server-Sent Events", "Design System", "Figma", "UI/UX"],
    highlights: [
      "Real-time data processing via Server-Sent Events.",
      "Interface built on top of a Design System designed in Figma.",
      "UI/UX-focused experience for daily operations.",
    ],
    link: "https://www.guinchosassociacao.com.br/",
    isPrivate: false,
  },
  {
    slug: "efesus",
    title: "Efesus 2.0",
    subtitle: "Distributor Management",
    description: "Structuring of data analysis across multiple BI modules for the distribution sector, focusing on response time and visual fluidity.",
    image: "/projects/efesus.webp",
    stack: ["React", "Vue.js", "Laravel", "BI"],
    highlights: [
      "BI dashboards with complex data matrices.",
      "Design foundation rebuilt for multiple devices.",
      "React/Vue.js front-end integrated with a Laravel back-end.",
    ],
    link: "https://braveo.veplex.com.br/login",
    isPrivate: false,
  },
  {
    slug: "nomade-eq",
    title: "Nomade EQ",
    subtitle: "Construction and Engineering Solution",
    description: "Optimization of performance, interface, and code structure. Implementation of Clean Code and refactoring of main modules.",
    image: "/projects/nomade-eq.webp",
    stack: ["Flutter", "Figma", "Clean Code"],
    highlights: [
      "Performance and interface optimization of the app.",
      "Clean Code applied to the existing codebase.",
      "Refactoring of the main modules.",
    ],
    link: "https://play.google.com/store/apps/details?id=com.nomade_eq.flutter&hl=en",
    isPrivate: false,
  },
  {
    slug: "sso-idp",
    title: "SSO IdP",
    subtitle: "Internal Single Sign-On Identity Provider",
    description: "Unification of internal systems authentication via SSO IdP focusing on Google Workspace, using Laravel Passport and dockerized deploy via Portainer.",
    image: "/projects/sso-idp.webp",
    stack: ["Laravel Passport", "Google Workspace", "NGINX", "Docker", "Portainer"],
    highlights: [
      "Unified authentication for internal systems via SSO.",
      "Google Workspace integration.",
      "Requests secured behind an NGINX proxy, dockerized deploy via Portainer.",
    ],
    isPrivate: true,
  },
  {
    slug: "gestao-senhas",
    title: "Password Management",
    subtitle: "Internal system for password storage",
    description: "Focus on top-tier security (OWASP Top 10), addressing AES-256 encryption, Rate Limiting, protection against XSS and CSRF, Logs, timeout, and multi-factor authentication.",
    image: "/projects/gestao-senhas.webp",
    stack: ["AES-256", "MFA", "OWASP Top 10"],
    highlights: [
      "AES-256 encryption of stored secrets.",
      "Rate limiting and protection against XSS and CSRF.",
      "Multi-factor authentication, audit logs and session timeout.",
    ],
    isPrivate: true,
  },
  {
    slug: "gestao-frotas",
    title: "Fleet Management",
    subtitle: "Internal system for vehicle requests",
    description: "Use of Websocket via Laravel Reverb for real-time updates of vehicle requests for trips, with multiple access levels.",
    image: "/projects/gestao-frotas.webp",
    stack: ["Laravel Reverb", "WebSocket", "RBAC"],
    highlights: [
      "Real-time updates via WebSocket (Laravel Reverb).",
      "Vehicle request flow for trips.",
      "Multiple access levels.",
    ],
    isPrivate: true,
  },
  {
    slug: "automacao-iam",
    title: "IAM Automation",
    subtitle: "IAM/ILM solution based on HR processes",
    description: "Unified 24/7 system that operates by creating accounts across multiple platforms via TOTVS. Features constant logging, daily reports, and email management.",
    image: "/projects/automacao-iam.webp",
    stack: ["IAM/ILM", "TOTVS", "Automation"],
    highlights: [
      "Account creation across multiple platforms driven by HR processes (TOTVS).",
      "24/7 operation with constant logging.",
      "Daily reports and email-based management.",
    ],
    isPrivate: true,
  },
] satisfies Project[];

export function getProjects(locale: 'pt' | 'en'): Project[] {
  return locale === 'pt' ? PROJECTS_PT : PROJECTS_EN;
}

export function getProject(locale: 'pt' | 'en', slug: string): Project | undefined {
  return getProjects(locale).find((project) => project.slug === slug);
}
