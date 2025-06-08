// cache-handler.js
const { createHandler } = require('@neshca/cache-handler');
const { createLruCache } = require('@neshca/cache-handler/lru-cache');

const handler = createHandler(
  {
    // Cache em memória (LRU)
    cache: createLruCache({
      max: 100, // Número máximo de itens no cache
      maxSize: 50 * 1024 * 1024, // 50MB
      ttl: 60 * 60 * 1000, // 1 hora em milissegundos
    }),
    // Você pode adicionar outros backends de cache aqui se necessário
  },
  {
    // Opções adicionais
    tagsManifestPath: './.next/cache/tags-manifest.json',
  }
);

module.exports = handler;