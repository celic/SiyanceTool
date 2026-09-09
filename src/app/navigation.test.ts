import { describe, expect, it } from 'vitest'

import { buildPages } from '@/app/navigation'
import type { ResolvedTool } from '@/tools/registry'

function resolved(id: string, enabled = true, title = id): ResolvedTool {
  return {
    definition: {
      id,
      title,
      unit: 'gases',
      description: 'a tool',
      tier: 1,
      component: () => null,
    },
    enabled,
    options: {},
  }
}

describe('buildPages', () => {
  it('always starts with the home page', () => {
    expect(buildPages([])[0]).toMatchObject({ id: 'home', title: 'Home', path: '/' })
  })

  it('lists each enabled tool after home', () => {
    const pages = buildPages([resolved('gas-laws', true, 'Gas laws')])

    expect(pages.map((page) => page.title)).toEqual(['Home', 'Gas laws'])
    expect(pages[1].path).toBe('/gas-laws')
  })

  it('leaves disabled tools out of the navigation panel', () => {
    const pages = buildPages([
      resolved('gas-laws', true, 'Gas laws'),
      resolved('titration', false, 'Titration'),
    ])

    expect(pages.map((page) => page.title)).toEqual(['Home', 'Gas laws'])
  })

  it('carries the unit through, for grouping the panel later', () => {
    const pages = buildPages([resolved('gas-laws')])

    expect(pages[1].unit).toBe('gases')
  })
})
