import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Upload de documentos do veículo (CRLV, ANTT, CIV...) em PDF/imagem.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
