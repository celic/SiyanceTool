import { describe, expect, it } from 'vitest'

import { resolveTools, validateToolsConfig } from '@/app/toolConfig'
import type { ToolDefinition } from '@/tools/registry'

function tool(id: string, extra: Partial<ToolDefinition> = {}): ToolDefinition {
  return {
    id,
    title: id,
    unit: 'test unit',
    description: 'a tool',
    tier: 1,
    component: () => null,
    ...extra,
  }
}

const tools = [tool('periodic-table'), tool('gas-laws')]

describe('resolveTools', () => {
  it('enables a tool that the config does not mention', () => {
    const resolved = resolveTools(tools, { tools: {} })

    expect(resolved.map((t) => t.enabled)).toEqual([true, true])
  })

  it('disables a tool the config switches off', () => {
    const resolved = resolveTools(tools, { tools: { 'gas-laws': { enabled: false } } })

    expect(resolved.find((t) => t.definition.id === 'gas-laws')?.enabled).toBe(false)
    expect(resolved.find((t) => t.definition.id === 'periodic-table')?.enabled).toBe(
      true,
    )
  })

  it('treats an explicit true the same as an absent entry', () => {
    const resolved = resolveTools(tools, { tools: { 'gas-laws': { enabled: true } } })

    expect(resolved.find((t) => t.definition.id === 'gas-laws')?.enabled).toBe(true)
  })

  it('ignores config entries for tools that do not exist', () => {
    const resolved = resolveTools(tools, {
      tools: { 'not-a-tool': { enabled: false } },
    })

    expect(resolved).toHaveLength(2)
    expect(resolved.every((t) => t.enabled)).toBe(true)
  })

  it('merges config options over the tool defaults', () => {
    const withDefaults = [
      tool('gas-laws', { defaultOptions: { pressureUnit: 'atm', particles: 200 } }),
    ]

    const resolved = resolveTools(withDefaults, {
      tools: { 'gas-laws': { options: { pressureUnit: 'kPa' } } },
    })

    expect(resolved[0].options).toEqual({ pressureUnit: 'kPa', particles: 200 })
  })

  it('leaves defaults alone when the config sets no options', () => {
    const withDefaults = [tool('gas-laws', { defaultOptions: { pressureUnit: 'atm' } })]

    const resolved = resolveTools(withDefaults, { tools: {} })

    expect(resolved[0].options).toEqual({ pressureUnit: 'atm' })
  })

  it('keeps a disabled tool in the list, so its URL can explain itself', () => {
    const resolved = resolveTools(tools, { tools: { 'gas-laws': { enabled: false } } })

    expect(resolved.map((t) => t.definition.id)).toContain('gas-laws')
  })
})

describe('validateToolsConfig', () => {
  it('accepts a config that only mentions real tools', () => {
    expect(
      validateToolsConfig(tools, { tools: { 'gas-laws': { enabled: false } } }),
    ).toEqual([])
  })

  it('accepts an empty config', () => {
    expect(validateToolsConfig(tools, { tools: {} })).toEqual([])
  })

  it('reports an id that matches no tool, since it is probably a typo', () => {
    const problems = validateToolsConfig(tools, {
      tools: { 'gas-law': { enabled: false } },
    })

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('gas-law')
  })

  it('reports a non-boolean enabled, which would otherwise be silently truthy', () => {
    const problems = validateToolsConfig(tools, {
      tools: { 'gas-laws': { enabled: 'false' as unknown as boolean } },
    })

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('gas-laws')
  })

  it('reports an entry that is not an object', () => {
    const problems = validateToolsConfig(tools, {
      tools: { 'gas-laws': false as unknown as { enabled: boolean } },
    })

    expect(problems).toHaveLength(1)
  })

  it('reports a missing or malformed tools block', () => {
    expect(validateToolsConfig(tools, {} as never)).toHaveLength(1)
    expect(validateToolsConfig(tools, { tools: [] as never })).toHaveLength(1)
  })

  it('reports every problem at once, not just the first', () => {
    const problems = validateToolsConfig(tools, {
      tools: {
        'gas-law': { enabled: false },
        'periodic-tables': { enabled: false },
      },
    })

    expect(problems).toHaveLength(2)
  })
})
