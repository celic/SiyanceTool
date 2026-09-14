import { BrowserRouter } from 'react-router'

import { AppRoutes } from '@/app/AppRoutes'
import { AppShell } from '@/app/AppShell'
import { buildPages } from '@/app/navigation'
import { RESOLVED_TOOLS } from '@/app/tools'

export function App() {
  return (
    // Routes are relative to wherever the site is served from — "/" in
    // development, "/<repo>/" on GitHub Pages — so a tool's path stays
    // "/mass-balance" in code either way.
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppShell pages={buildPages(RESOLVED_TOOLS)}>
        <AppRoutes tools={RESOLVED_TOOLS} />
      </AppShell>
    </BrowserRouter>
  )
}
