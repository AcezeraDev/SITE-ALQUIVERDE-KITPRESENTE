import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import { seoBuild } from './tools/seo-build.mjs';

// Catálogo multipágina; seoBuild gera os produtos em /kits/<slug>/ no build.
export default defineConfig(({ mode }) => ({
  appType: 'mpa',
  plugins: [{
    name: 'vercel-web-analytics',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler() {
        return [
          { tag: 'script', children: 'window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };', injectTo: 'head' },
          { tag: 'script', attrs: { defer: true, src: '/_vercel/insights/script.js' }, injectTo: 'head' },
        ];
      },
    },
  }, seoBuild({ ...loadEnv(mode, import.meta.dirname, ''), ...process.env }), {
    // Sem isso o 404 do dev server vai sem Cache-Control e o Chrome o guarda: se uma foto some por um
    // instante (ex.: optimize-images regravando public/), ela fica quebrada no navegador mesmo depois de voltar.
    name: 'dev-no-cached-404',
    configureServer(server) {
      server.middlewares.use((req, res, next) => { res.setHeader('Cache-Control', 'no-cache'); next(); });
    },
  }],
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 700, // three.js sozinho tem ~600 KB (≈150 KB com gzip)
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        kit: resolve(import.meta.dirname, 'kit.html'),
        monte: resolve(import.meta.dirname, 'monte.html'),
        notFound: resolve(import.meta.dirname, '404.html'),
        conceitos: resolve(import.meta.dirname, 'experimentos/index.html'),
        galeria: resolve(import.meta.dirname, 'experimentos/galeria.html'),
        orbita: resolve(import.meta.dirname, 'experimentos/orbita.html'),
        capitulos: resolve(import.meta.dirname, 'experimentos/capitulos.html'),
      },
      // three.js num arquivo próprio: as duas páginas usam e ele fica no cache do navegador entre elas
      output: { manualChunks: (id) => (id.includes('node_modules/three') ? 'three' : id.includes('node_modules/gsap') || id.includes('node_modules/lenis') ? 'anim' : undefined) },
    },
  },
}));
