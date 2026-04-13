import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from 'path';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      '~': resolve(__dirname, './app')
    }
  },
  // Performance optimizations
  build: {
    // Target modern browsers for smaller output
    target: 'esnext',
    // Minify with esbuild  
    minify: 'esbuild',
    // Generate source maps for production (optional - disable for smaller builds)
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 500,
    // CSS code splitting
    cssCodeSplit: true,
    // Minify CSS
    cssMinify: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router'],
  },
  // CSS optimization
  css: {
    devSourcemap: false,
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: false,
    },
    headers: {
      // Security headers
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: http:; connect-src 'self' http://localhost:5173 http://localhost:8080; frame-src 'self' https://yandex.ru",
    },
  },
});