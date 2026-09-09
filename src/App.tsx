import { BrowserRouter } from 'react-router'

import { AppRoutes } from '@/app/AppRoutes'
import { AppShell } from '@/app/AppShell'
import { buildPages } from '@/app/navigation'
import { RESOLVED_TOOLS } from '@/app/tools'

export function App() {
  return (
    <BrowserRouter>
      <AppShell pages={buildPages(RESOLVED_TOOLS)}>
        <AppRoutes tools={RESOLVED_TOOLS} />
      </AppShell>
    </BrowserRouter>
  )
}
