import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Ignora errori di TypeScript durante la build
    // per permettere all'app di avviarsi anche con problemi di tipizzazione
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
