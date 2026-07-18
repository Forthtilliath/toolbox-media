/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { configDefaults } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    // Lets `npm run dev` talk to the backend without needing a VITE_API_BASE_URL
    // override — proxies the same way nginx.conf does for the Docker build.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    // e2e/**/*.spec.ts are Playwright tests (different runner/API) — keep them
    // out of Vitest's own discovery, which would otherwise pick up *.spec.ts
    // anywhere in the project by default.
    exclude: [...configDefaults.exclude, 'e2e/**'],
    // @forthtilliath/forth-ui's compiled dist omits ".js" extensions on relative
    // imports (e.g. `from "./button"`), which Node's strict ESM resolver rejects
    // when Vitest loads it as an external package. Inlining forces Vite's own
    // (extension-lenient) resolver to process it instead — a real build (`vite
    // build`) already goes through that resolver and isn't affected.
    server: {
      deps: {
        inline: [/@forthtilliath\//],
      },
    },
  },
})
