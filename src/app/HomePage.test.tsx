import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import { HomePage } from '@/app/HomePage'
import type { ResolvedTool } from '@/tools/registry'

function resolved(
  id: string,
  { enabled = true, unit = 'gases', title = id, description = 'a tool' } = {},
): ResolvedTool {
  return {
    definition: { id, title, unit, description, tier: 1, component: () => null },
    enabled,
    options: {},
  }
}

function renderHome(tools: ResolvedTool[] = []) {
  return render(
    <MemoryRouter>
      <HomePage tools={tools} />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  it('names the site in a top-level heading', () => {
    renderHome()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('SiyanceTool')
  })

  it('says no tools are available rather than showing a blank page', () => {
    renderHome()

    expect(screen.getByText(/no tools yet/i)).toBeVisible()
  })

  it('shows a card per enabled tool, linking to it', () => {
    renderHome([
      resolved('gas-laws', { title: 'Gas laws', description: 'Squeeze a gas.' }),
    ])

    const link = screen.getByRole('link', { name: /gas laws/i })
    expect(link).toHaveAttribute('href', '/gas-laws')
    expect(screen.getByText('Squeeze a gas.')).toBeVisible()
  })

  it('leaves a disabled tool off the page entirely', () => {
    renderHome([
      resolved('gas-laws', { title: 'Gas laws' }),
      resolved('titration', { title: 'Titration', enabled: false }),
    ])

    expect(screen.getByRole('link', { name: /gas laws/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /titration/i })).not.toBeInTheDocument()
  })

  it('drops the empty state once there is something to show', () => {
    renderHome([resolved('gas-laws')])

    expect(screen.queryByText(/no tools yet/i)).not.toBeInTheDocument()
  })

  it('shows the empty state when every tool is switched off', () => {
    renderHome([resolved('gas-laws', { enabled: false })])

    expect(screen.getByText(/no tools yet/i)).toBeVisible()
  })

  it('groups tools by unit, so she can find the one she is teaching', () => {
    renderHome([
      resolved('gas-laws', { title: 'Gas laws', unit: 'gases' }),
      resolved('titration', { title: 'Titration', unit: 'acids and bases' }),
      resolved('molar-mass', { title: 'Molar mass', unit: 'the mole' }),
    ])

    const gases = screen.getByRole('region', { name: 'gases' })
    expect(within(gases).getByRole('link', { name: /gas laws/i })).toBeInTheDocument()
    expect(
      within(gases).queryByRole('link', { name: /titration/i }),
    ).not.toBeInTheDocument()
  })

  it('puts a unit heading on each group', () => {
    renderHome([resolved('gas-laws', { unit: 'gases' })])

    expect(screen.getByRole('heading', { name: 'gases' })).toBeVisible()
  })
})
