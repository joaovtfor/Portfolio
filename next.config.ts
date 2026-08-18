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
};

export default nextConfig;
