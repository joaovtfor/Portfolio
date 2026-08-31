import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite que dispositivos na rede local acessem o HMR e os chunks JS
  allowedDevOrigins: ["http://10.1.88.17:3000", "http://10.1.88.17", "10.1.88.17"],
  
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
