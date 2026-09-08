import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
// Imported from vitest/config, not vite, so the `test` block below is typed.
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // `@/core`, `@/ui`, `@/tools`, `@/data` all resolve under src/.
      // Keep this in sync with the `paths` entry in tsconfig.app.json.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // chem-core is the only thing worth testing (see docs/plan.md item 1).
    // Tests live beside the code they cover, as <name>.test.ts.
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
