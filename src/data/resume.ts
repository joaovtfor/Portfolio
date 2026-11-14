// Fonte da verdade: currículo (public/cv_*.pdf). Métricas e afirmações devem refletir o CV.
// Tom dos textos: simples, direto e pragmático (frases curtas, sem jargão) — ver docs/curriculo-log.md.

export interface ExperienceItem {
  id: number;
  period: string;
  company: string;
  role: string;
  /** Entregas em frases curtas (até 4), uma por linha. */
  bullets: string[];
  /** Apenas tecnologias (viram badges); práticas e resultados ficam nos bullets. */
  skills: string[];
  highlight?: string;
}

const PERSONAL_INFO = {
  name: "João Vitor de For dos Santos",
  shortName: "João de For",
  location: "Passo Fundo, RS",
  timeZone: "America/Sao_Paulo",
  email: "joaovtfor@hotmail.com",
  linkedin: "https://linkedin.com/in/joaodefor",
  github: "https://github.com/joaovtfor",
  role: "Creative Front-End Engineer",
};

const RESUME_PT = {
  personalInfo: {
    ...PERSONAL_INFO,
    focus: "WebGL, Motion e Interfaces de Alta Performance",
    stack: "Next.js · React · Three.js · GLSL · GSAP",
  },
  manifesto: "Sou desenvolvedor Front-End pleno. Desde 2023, crio interfaces web rápidas, seguras e fáceis de usar.",
  summary: "Hoje trabalho na Rede Notre Dame com React, Vue.js e Laravel. Já entreguei aplicações com nota 100 no Lighthouse, um login único (SSO) para sistemas internos e uma redução de 70% no tempo de carregamento. Vou do protótipo no Figma ao deploy com Docker.",
  skillGroups: [
    { label: "Criativo & Motion", items: ["Three.js", "React Three Fiber", "GLSL", "GSAP", "Framer Motion"] },
    { label: "Core Front-End", items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vue.js"] },
    { label: "UI/UX", items: ["Figma", "Design Systems", "Design Responsivo", "Material UI"] },
    { label: "Engenharia & Infra", items: ["Clean Code", "Security by Design (OWASP)", "SDD com IA", "Docker / Portainer", "CI/CD"] },
    { label: "Back-end & Mobile", items: ["Laravel / PHP", "Flutter", "Python", "SQL"] },
  ],
  education: {
    degree: "Análise e Desenvolvimento de Sistemas",
    institution: "Universidade de Passo Fundo (UPF)",
    conclusion: "Conclusão 12/2026",
  },
  language: "Inglês — Intermediário B2 (EF Test)",
  experiences: [
    {
      id: 1,
      period: "AGO 2025 - ATUAL",
      company: "Rede Notre Dame",
      role: "Front-End / Full-Stack Pleno",
      bullets: [
        "Sistemas internos web e mobile em Vue.js, Laravel e Flutter.",
        "Nota 100 no Lighthouse e mais de 90% de cobertura de testes.",
        "Login único (SSO) para os sistemas da rede.",
        "Sistemas legados migrados para PHP 8 e CodeIgniter 4, com produção em Docker e Portainer.",
      ],
      skills: ["Vue.js", "Laravel", "React", "TypeScript", "Flutter", "PHP", "Docker", "Portainer"],
      highlight: "Lighthouse 100",
    },
    {
      id: 2,
      period: "FEV 2025 - JUL 2025",
      company: "Veplex",
      role: "Front-End / Full-Stack",
      bullets: [
        "Nova interface do sistema de gestão para distribuidoras, responsiva em qualquer tela.",
        "Dashboards e relatórios de BI para logística, do protótipo no Figma ao código.",
        "Consultas PostgreSQL mais rápidas com índices e procedures.",
      ],
      skills: ["React", "Vue.js", "TypeScript", "Laravel", "PostgreSQL", "Figma"],
    },
    {
      id: 3,
      period: "OUT 2024 - JAN 2025",
      company: "Sinapsys",
      role: "Front-End & Mobile",
      bullets: [
        "Aplicativos mobile em Flutter, com interface redesenhada no Figma.",
        "Evolução da API legada em VB.NET e manutenção do sistema web em ASP.NET.",
        "Consultas SQL mais rápidas com índices e triggers.",
      ],
      skills: ["Flutter", "Figma", "VB.NET", "ASP.NET", "SQL"],
    },
    {
      id: 4,
      period: "MAI 2023 - JUN 2024",
      company: "IM9 Inteligência em Mobilidade",
      role: "Front-End",
      bullets: [
        "Participei da refatoração da aplicação React que reduziu em 70% o tempo de carregamento.",
        "Painéis de telemetria veicular em tempo real (SSE).",
        "Dashboards e relatórios gerenciais para a operação.",
      ],
      skills: ["React", "JavaScript", "Server-Sent Events", "Figma", "Docker"],
      highlight: "−70% no carregamento",
    },
  ] satisfies ExperienceItem[],
};

const RESUME_EN: typeof RESUME_PT = {
  personalInfo: {
    ...PERSONAL_INFO,
    focus: "WebGL, Motion & High-Performance Interfaces",
    stack: "Next.js · React · Three.js · GLSL · GSAP",
  },
  manifesto: "I'm a mid-level Front-End developer. Since 2023, I've been building web interfaces that are fast, secure and easy to use.",
  summary: "I currently work at Rede Notre Dame with React, Vue.js and Laravel. I've shipped applications scoring 100 on Lighthouse, a single sign-on (SSO) for internal systems and a 70% cut in load time. I go from the Figma prototype to the Docker deploy.",
  skillGroups: [
    { label: "Creative & Motion", items: ["Three.js", "React Three Fiber", "GLSL", "GSAP", "Framer Motion"] },
    { label: "Core Front-End", items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vue.js"] },
    { label: "UI/UX", items: ["Figma", "Design Systems", "Responsive Design", "Material UI"] },
    { label: "Engineering & Infra", items: ["Clean Code", "Security by Design (OWASP)", "AI-driven SDD", "Docker / Portainer", "CI/CD"] },
    { label: "Back-end & Mobile", items: ["Laravel / PHP", "Flutter", "Python", "SQL"] },
  ],
  education: {
    degree: "Systems Analysis and Development",
    institution: "University of Passo Fundo (UPF)",
    conclusion: "Expected 12/2026",
  },
  language: "English — Intermediate B2 (EF Test)",
  experiences: [
    {
      id: 1,
      period: "AUG 2025 - PRESENT",
      company: "Rede Notre Dame",
      role: "Mid-level Front-End / Full-Stack",
      bullets: [
        "Internal web and mobile systems in Vue.js, Laravel and Flutter.",
        "Lighthouse score of 100 and over 90% test coverage.",
        "Single sign-on (SSO) for the network's systems.",
        "Legacy systems migrated to PHP 8 and CodeIgniter 4, with production on Docker and Portainer.",
      ],
      skills: ["Vue.js", "Laravel", "React", "TypeScript", "Flutter", "PHP", "Docker", "Portainer"],
      highlight: "Lighthouse 100",
    },
    {
      id: 2,
      period: "FEB 2025 - JUL 2025",
      company: "Veplex",
      role: "Front-End / Full-Stack",
      bullets: [
        "New interface for the distributor management system, responsive on any screen.",
        "BI dashboards and reports for logistics, from the Figma prototype to code.",
        "Faster PostgreSQL queries with indexes and procedures.",
      ],
      skills: ["React", "Vue.js", "TypeScript", "Laravel", "PostgreSQL", "Figma"],
    },
    {
      id: 3,
      period: "OCT 2024 - JAN 2025",
      company: "Sinapsys",
      role: "Front-End & Mobile",
      bullets: [
        "Mobile apps in Flutter, with the interface redesigned in Figma.",
        "Evolved the legacy VB.NET API and maintained the ASP.NET web system.",
        "Faster SQL queries with indexes and triggers.",
      ],
      skills: ["Flutter", "Figma", "VB.NET", "ASP.NET", "SQL"],
    },
    {
      id: 4,
      period: "MAY 2023 - JUN 2024",
      company: "IM9 Inteligência em Mobilidade",
      role: "Front-End",
      bullets: [
        "Took part in the React refactor that cut load time by 70%.",
        "Real-time vehicle telemetry panels (SSE).",
        "Management dashboards and reports for operations.",
      ],
      skills: ["React", "JavaScript", "Server-Sent Events", "Figma", "Docker"],
      highlight: "−70% load time",
    },
  ],
};

export type Resume = typeof RESUME_PT;

export function getResume(locale: 'pt' | 'en'): Resume {
  return locale === 'pt' ? RESUME_PT : RESUME_EN;
}
