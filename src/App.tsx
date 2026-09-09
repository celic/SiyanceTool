import { BrowserRouter, Route, Routes } from 'react-router'

import { AppShell } from '@/app/AppShell'
import { HomePage } from '@/app/HomePage'
import { NotFoundPage } from '@/app/NotFoundPage'

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
