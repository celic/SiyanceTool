import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import { HomePage } from '@/app/HomePage'

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  it('names the site in a top-level heading', () => {
    renderHome()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('SiyanceTool')
  })

  it('says what the site is for', () => {
    renderHome()

    expect(screen.getByText(/chemistry tools/i)).toBeVisible()
  })

  it('tells her no tools are available yet, rather than showing an empty page', () => {
    renderHome()

    expect(screen.getByText(/no tools yet/i)).toBeVisible()
  })
})
