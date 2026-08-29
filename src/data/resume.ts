const RESUME_PT = {
  personalInfo: {
    name: "João Vitor de For dos Santos",
    location: "Passo Fundo, RS",
    phone: "(54) 9 9930-3946",
    email: "joaovtfor@hotmail.com",
    linkedin: "https://linkedin.com/in/joaodefor",
    github: "https://github.com/joaovtfor",
    role: "Engenheiro Front-End & Full-Stack",
    focus: "Interfaces de Alta Performance",
    stack: "Next.js, Vue.js, Laravel, Flutter"
  },
  summary: "Engenheiro de Software Front-End e Full-Stack especialista na construção de interfaces de alta performance, escaláveis e resilientes. Domino o ecossistema moderno utilizando Next.js, Tailwind CSS e Framer Motion para renderização otimizada, com sólida bagagem em Vue.js e React.js integrados a arquiteturas Laravel. Aplico metodologias de Inteligência Artificial executando Spec-Driven Development (SDD) para acelerar entregas. Na infraestrutura, utilizo ambientes locais isolados com containers Docker standalone via Docker Desktop (com mapeamento avançado em arquivos docker-compose.yml), orquestrando os deploys em produção através do Portainer. Atuo com Security by Design mitigando vulnerabilidades do Top 10 OWASP (XSS, CSRF) desde a concepção do código.",
  experiences: [
    {
      id: 1,
      period: "AGO 2025 - ATUAL",
      company: "Rede Notre Dame",
      role: "Front-End / Full-Stack Pleno",
      description: "Concepção arquitetural de sistemas web e mobile utilizando Vue.js, Laravel e Flutter. Alcance de nota 100 no Google Lighthouse (Performance e SEO). Desenvolvimento de Identity Provider (IdP) para SSO seguro via proxy reverso NGINX. Padronização Docker-first (CI/CD) e refatoração de sistemas legados de missão crítica.",
      skills: ["Vue.js", "Typescript", "Figma", "UI/UX Design", "Laravel", "Flutter", "Docker", "Single Sign-On (SSO)", "CI/CD", "NGINX"]
    },
    {
      id: 2,
      period: "FEV 2025 - JUL 2025",
      company: "Veplex",
      role: "Front-End / Full-Stack",
      description: "Reestruturação integral de UI/UX e design responsivo utilizando React.js e Vue.js integrados ao back-end Laravel. Prototipação de alta fidelidade (Figma) e desenvolvimento de dashboards complexos de BI focados na gestão do setor logístico. Integração de ferramentas de Inteligência Artificial no workflow de pair-programming.",
      skills: ["React.js", "Vue.js", "Typescript", "Figma", "UI/UX Design", "Laravel", "IA (SDD)", "Docker", "BI"]
    },
    {
      id: 3,
      period: "OUT 2024 - JAN 2025",
      company: "Sinapsys",
      role: "Front-End & Mobile",
      description: "Desenvolvimento multiplataforma mobile utilizando Flutter, focado em UX via Figma. Sustentação e evolução de back-ends corporativos legados (ASP.NET, VB.NET). Otimização de performance de consultas SQL criando índices operacionais e triggers.",
      skills: ["Flutter", "Figma", "UI/UX Design", "ASP.NET", "VB.NET", "SQL"]
    },
    {
      id: 4,
      period: "MAI 2023 - JUN 2024",
      company: "IM9 Inteligência",
      role: "Front-End",
      description: "Redução de 70% no tempo de carregamento de aplicações React.js legadas através de code splitting avançado e otimização de bundle size. Desenvolvimento de painéis de telemetria em tempo real via Server-Sent Events (SSE) com processamento massivo no client-side.",
      skills: ["React.js", "Figma", "UI/UX Design", "Typescript", "Web Vitals", "SSE", "Code Splitting"]
    }
  ],
  education: {
    degree: "Análise e Desenvolvimento de Sistemas (ADS)",
    institution: "Universidade de Passo Fundo (UPF)",
    conclusion: "12/2026"
  },
  skills: [
    "React.js", "Next.js", "Vue.js", "Tailwind CSS", "Framer Motion",
    "JavaScript", "TypeScript", "Flutter", "Laravel", "PHP", 
    "Docker", "Portainer", "CI/CD", "SQL", "Figma", "UI/UX",
    "Single Sign-On (SSO)", "Clean Code", "OWASP", "SDD", "Git"
  ]
};

const RESUME_EN = {
  personalInfo: {
    name: "João Vitor de For dos Santos",
    location: "Passo Fundo, RS",
    phone: "(54) 9 9930-3946",
    email: "joaovtfor@hotmail.com",
    linkedin: "https://linkedin.com/in/joaodefor",
    github: "https://github.com/joaovtfor",
    role: "Front-End & Full-Stack Engineer",
    focus: "High Performance Interfaces",
    stack: "Next.js, Vue.js, Laravel, Flutter"
  },
  summary: "Front-End and Full-Stack Software Engineer specialized in building high-performance, scalable, and resilient interfaces. I master the modern ecosystem using Next.js, Tailwind CSS, and Framer Motion for optimized rendering, with a solid background in Vue.js and React.js integrated with Laravel architectures. I apply Artificial Intelligence methodologies executing Spec-Driven Development (SDD) to accelerate deliveries. In infrastructure, I use isolated local environments with standalone Docker containers via Docker Desktop (with advanced mapping in docker-compose.yml files), orchestrating production deployments through Portainer. I act with Security by Design, mitigating vulnerabilities from the Top 10 OWASP (XSS, CSRF) since the conception of the code.",
  experiences: [
    {
      id: 1,
      period: "AUG 2025 - PRESENT",
      company: "Rede Notre Dame",
      role: "Mid-level Front-End / Full-Stack",
      description: "Architectural design of web and mobile systems using Vue.js, Laravel, and Flutter. Achieved a score of 100 in Google Lighthouse (Performance and SEO). Development of Identity Provider (IdP) for secure SSO via NGINX reverse proxy. Docker-first (CI/CD) standardization and refactoring of mission-critical legacy systems.",
      skills: ["Vue.js", "Typescript", "Figma", "UI/UX Design", "Laravel", "Flutter", "Docker", "Single Sign-On (SSO)", "CI/CD", "NGINX"]
    },
    {
      id: 2,
      period: "FEB 2025 - JUL 2025",
      company: "Veplex",
      role: "Front-End / Full-Stack",
      description: "Complete UI/UX and responsive design restructuring using React.js and Vue.js integrated with Laravel back-end. High-fidelity prototyping (Figma) and development of complex BI dashboards focused on logistics sector management. Integration of Artificial Intelligence tools in pair-programming workflow.",
      skills: ["React.js", "Vue.js", "Typescript", "Figma", "UI/UX Design", "Laravel", "AI (SDD)", "Docker", "BI"]
    },
    {
      id: 3,
      period: "OCT 2024 - JAN 2025",
      company: "Sinapsys",
      role: "Front-End & Mobile",
      description: "Cross-platform mobile development using Flutter, focused on UX via Figma. Maintenance and evolution of legacy corporate back-ends (ASP.NET, VB.NET). SQL query performance optimization by creating operational indexes and triggers.",
      skills: ["Flutter", "Figma", "UI/UX Design", "ASP.NET", "VB.NET", "SQL"]
    },
    {
      id: 4,
      period: "MAY 2023 - JUN 2024",
      company: "IM9 Inteligência",
      role: "Front-End",
      description: "70% reduction in loading time of legacy React.js applications through advanced code splitting and bundle size optimization. Development of real-time telemetry dashboards via Server-Sent Events (SSE) with massive client-side processing.",
      skills: ["React.js", "Figma", "UI/UX Design", "Typescript", "Web Vitals", "SSE", "Code Splitting"]
    }
  ],
  education: {
    degree: "Systems Analysis and Development (ADS)",
    institution: "University of Passo Fundo (UPF)",
    conclusion: "12/2026"
  },
  skills: [
    "React.js", "Next.js", "Vue.js", "Tailwind CSS", "Framer Motion",
    "JavaScript", "TypeScript", "Flutter", "Laravel", "PHP", 
    "Docker", "Portainer", "CI/CD", "SQL", "Figma", "UI/UX",
    "Single Sign-On (SSO)", "Clean Code", "OWASP", "SDD", "Git"
  ]
};

export function getResume(locale: 'pt' | 'en') {
  return locale === 'pt' ? RESUME_PT : RESUME_EN;
}
