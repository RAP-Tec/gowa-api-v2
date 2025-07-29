/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      // Configurações adicionais se necessário
    }
    // incrementalCacheHandlerPath: require.resolve('./cache-handler.js'),
    // isrMemoryCacheSize: 50, // Tamanho do cache em MB (opcional)
  }
}

export default nextConfig
module.exports = nextConfig;