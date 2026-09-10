import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import { AppRoutes } from '@/app/AppRoutes'
import type { ResolvedTool } from '@/tools/registry'

function resolved(id: string, enabled: boolean, title = id): ResolvedTool {
  return {
    definition: {
      id,
      title,
      unit: 'gases',
      description: 'a tool',
      tier: 1,
      component: () => <p>{`${id} tool content`}</p>,
    },
    enabled,
    options: {},
  }
}

const tools = [
  resolved('periodic-table', true),
  resolved('gas-laws', false, 'Gas laws'),
]

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes tools={tools} />
    </MemoryRouter>,
  )
}

describe('AppRoutes', () => {
  it('hands each tool its resolved options, so config reaches the page', () => {
    const withOptions: ResolvedTool = {
      ...resolved('gas-laws', true),
      options: { pressureUnit: 'kPa' },
    }
    withOptions.definition = {
      ...withOptions.definition,
      component: ({ options }) => <p>{`unit: ${String(options.pressureUnit)}`}</p>,
    }

    render(
      <MemoryRouter initialEntries={['/gas-laws']}>
        <AppRoutes tools={[withOptions]} />
      </MemoryRouter>,
    )

    expect(screen.getByText('unit: kPa')).toBeVisible()
  })

  it('shows the home page at the root', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('SiyanceTool')
  })

  it('routes an enabled tool to its own page', () => {
    renderAt('/periodic-table')

    expect(screen.getByText('periodic-table tool content')).toBeVisible()
  })

  it('does not render a disabled tool, even when its URL is typed directly', () => {
    renderAt('/gas-laws')

    expect(screen.queryByText('gas-laws tool content')).not.toBeInTheDocument()
  })

  it('tells her a disabled tool is switched off, rather than showing "not found"', () => {
    renderAt('/gas-laws')

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/turned off/i)
    expect(screen.getByText(/Gas laws/)).toBeVisible()
  })

  it('still shows "not found" for a path that is no tool at all', () => {
    renderAt('/nonsense')

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/not found/i)
  })
})
