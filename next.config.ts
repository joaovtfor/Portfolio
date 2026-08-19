import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
