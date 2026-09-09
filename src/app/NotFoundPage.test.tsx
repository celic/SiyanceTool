import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import { NotFoundPage } from '@/app/NotFoundPage'

function renderNotFound() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>,
  )
}

describe('NotFoundPage', () => {
  it('says plainly that the page does not exist', () => {
    renderNotFound()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/not found/i)
  })

  it('offers a way back, so a stale bookmark is not a dead end mid-lesson', () => {
    renderNotFound()

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
  })
})
