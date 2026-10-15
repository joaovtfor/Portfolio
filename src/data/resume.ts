// Fonte da verdade: currículo (public/cv_*.pdf). Métricas e afirmações devem refletir o CV.

export interface ExperienceItem {
  id: number;
  period: string;
  company: string;
  role: string;
  description: string;
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
  manifesto: "Construo interfaces onde engenharia e movimento são o mesmo ofício: performance como fundação, segurança como padrão e cada animação com um motivo para existir.",
  summary: "Engenheiro Front-End com visão Full-Stack. Next.js, React e TypeScript no núcleo; Three.js, GLSL e GSAP na camada de experiência; Vue.js, Laravel e Docker quando o produto pede entrega ponta a ponta. Aplico Clean Code, YAGNI e Security by Design (OWASP) e acelero entregas com Spec-Driven Development guiado por IA.",
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
      description: "Concepção arquitetural de aplicações em Vue.js e React com design system modular, atingindo nota 100 no Google Lighthouse. Desenvolvimento do provedor de identidade (IdP) centralizado para SSO, com requisições protegidas por proxy NGINX. Ambientes Docker/Portainer e modernização crítica de aplicações PHP legadas (7.2 para 8.3).",
      skills: ["Vue.js", "React", "TypeScript", "Figma", "Laravel", "Docker", "Single Sign-On (SSO)", "NGINX"],
      highlight: "Lighthouse 100",
    },
    {
      id: 2,
      period: "FEV 2025 - JUL 2025",
      company: "Veplex",
      role: "Front-End / Full-Stack",
      description: "Reconstrução integral da base de design (React e Vue.js acoplados ao Laravel), resolvendo gargalos visuais críticos em múltiplos dispositivos. Prototipação e renderização de matrizes de dados complexas para dashboards de BI no setor de distribuição, garantindo tempo de resposta e fluidez visual.",
      skills: ["React", "Vue.js", "TypeScript", "Figma", "Laravel", "BI"],
    },
    {
      id: 3,
      period: "OUT 2024 - JAN 2025",
      company: "Sinapsys",
      role: "Front-End & Mobile",
      description: "Reestruturação de UX e desenvolvimento mobile avançado com Flutter. Manutenção da estabilidade transacional em ecossistemas ASP.NET/.NET corporativos e otimização de performance em consultas SQL complexas.",
      skills: ["Flutter", "Figma", "UI/UX", "ASP.NET", "SQL"],
    },
    {
      id: 4,
      period: "MAI 2023 - JUN 2024",
      company: "IM9 Inteligência em Mobilidade",
      role: "Front-End",
      description: "Liderança na refatoração de aplicação React que reduziu em 70% o tempo de carregamento das interfaces principais, via code splitting e compressão avançada. Painéis em tempo real com Server-Sent Events (SSE) para telemetria veicular, com processamento e sanitização no front-end.",
      skills: ["React", "TypeScript", "Web Vitals", "SSE", "Code Splitting"],
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
  manifesto: "I build interfaces where engineering and motion are the same craft: performance as the foundation, security as the default, and every animation with a reason to exist.",
  summary: "Front-End Engineer with a Full-Stack mindset. Next.js, React and TypeScript at the core; Three.js, GLSL and GSAP for the experience layer; Vue.js, Laravel and Docker when the product needs end-to-end delivery. I apply Clean Code, YAGNI and Security by Design (OWASP), and speed up delivery with AI-driven Spec-Driven Development.",
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
      description: "Architected Vue.js and React applications with a modular design system, reaching a score of 100 on Google Lighthouse. Built the centralized identity provider (IdP) for SSO, with requests secured behind an NGINX proxy. Docker/Portainer environments and critical modernization of legacy PHP applications (7.2 to 8.3).",
      skills: ["Vue.js", "React", "TypeScript", "Figma", "Laravel", "Docker", "Single Sign-On (SSO)", "NGINX"],
      highlight: "Lighthouse 100",
    },
    {
      id: 2,
      period: "FEB 2025 - JUL 2025",
      company: "Veplex",
      role: "Front-End / Full-Stack",
      description: "Rebuilt the entire design foundation (React and Vue.js coupled with Laravel), solving critical visual bottlenecks across multiple devices. Prototyped and rendered complex data matrices for BI dashboards in the distribution sector, ensuring response time and visual fluidity.",
      skills: ["React", "Vue.js", "TypeScript", "Figma", "Laravel", "BI"],
    },
    {
      id: 3,
      period: "OCT 2024 - JAN 2025",
      company: "Sinapsys",
      role: "Front-End & Mobile",
      description: "UX restructuring and advanced mobile development with Flutter. Kept transactional stability in corporate ASP.NET/.NET ecosystems and optimized performance of complex SQL queries.",
      skills: ["Flutter", "Figma", "UI/UX", "ASP.NET", "SQL"],
    },
    {
      id: 4,
      period: "MAY 2023 - JUN 2024",
      company: "IM9 Inteligência em Mobilidade",
      role: "Front-End",
      description: "Led the refactoring of a React application that cut the loading time of the main interfaces by 70%, through code splitting and advanced compression. Real-time panels with Server-Sent Events (SSE) for vehicle telemetry, with processing and sanitization on the front-end.",
      skills: ["React", "TypeScript", "Web Vitals", "SSE", "Code Splitting"],
      highlight: "−70% load time",
    },
  ],
};

export type Resume = typeof RESUME_PT;

export function getResume(locale: 'pt' | 'en'): Resume {
  return locale === 'pt' ? RESUME_PT : RESUME_EN;
}
