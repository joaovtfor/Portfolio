import type { NextConfig } from "next";

// Headers de segurança estáticos para todas as respostas; a CSP (com nonce) é definida no proxy.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Dispositivos da rede local (ex.: celular testando o container) acessando HMR e chunks JS.
  // Ex.: ALLOWED_DEV_ORIGINS=10.1.88.17 no .env
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS?.split(",").map((origin) => origin.trim()) ?? [],

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  // Turbopack no Windows/Docker sofre com a barreira de eventos de arquivos.
  // Voltando para Webpack com Polling agressivo para garantir o DX do Hot Reload.
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  // "Tratado de Paz" entre o Webpack (Docker Local) e o Turbopack (Build Produção)
  turbopack: {},
};

export default nextConfig;
