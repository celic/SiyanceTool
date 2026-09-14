import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
// Imported from vitest/config, not vite, so the `test` block below is typed.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // GitHub Pages serves a project site from /<repo>/, so the deploy workflow
  // sets BASE_PATH to that. Locally, and on a custom domain, it is "/".
  // React Router reads the same value back as import.meta.env.BASE_URL.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      // `@/core`, `@/ui`, `@/tools`, `@/data` all resolve under src/.
      // Keep this in sync with the `paths` entry in tsconfig.app.json.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Two projects, because the two kinds of test want different environments.
    // Each inherits the plugins and aliases above; only the differences go here.
    // Keeping chem-core in `node` keeps it fast and makes it obvious when a
    // supposedly pure module has quietly grown a DOM dependency.
    projects: [
      {
        test: {
          name: 'core',
          include: ['src/core/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'ui',
          include: ['src/{ui,tools,app}/**/*.test.{ts,tsx}', 'src/*.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.ts'],
        },
      },
    ],
  },
})
