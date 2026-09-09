import type { ResolvedTool, ToolDefinition, ToolOptions } from '@/tools/registry'

/** One tool's entry in `tools.config.json`. Every field is optional. */
export interface ToolConfigEntry {
  /** Absent means enabled — adding a tool should not require editing config. */
  enabled?: boolean
  /** Overrides merged over the tool's `defaultOptions`. */
  options?: ToolOptions
}

/**
 * The shape of `tools.config.json`.
 *
 * Tool entries are nested under `tools` rather than sitting at the top level so
 * that later additions — named presets per class period, for instance
 * (docs/questions.md #29) — have somewhere to go without colliding with a tool
 * id.
 */
export interface ToolsConfig {
  tools: Record<string, ToolConfigEntry>
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Pairs each tool with the config that applies to it.
 *
 * Disabled tools stay in the returned list rather than being filtered out: the
 * router needs to know that `/gas-laws` is a real tool that is switched off, so
 * it can say so instead of showing a generic "not found".
 *
 * Never throws. Malformed config is reported by `validateToolsConfig` and
 * treated leniently here, so a bad entry cannot take the whole site down in the
 * middle of a lesson.
 */
export function resolveTools(
  tools: ToolDefinition[],
  config: ToolsConfig,
): ResolvedTool[] {
  const entries = isPlainObject(config?.tools) ? config.tools : {}

  return tools.map((definition) => {
    const entry: ToolConfigEntry = isPlainObject(entries[definition.id])
      ? (entries[definition.id] as ToolConfigEntry)
      : {}

    return {
      definition,
      enabled: entry.enabled !== false,
      options: { ...definition.defaultOptions, ...entry.options },
    }
  })
}

/**
 * Returns a human-readable problem for every bad entry — all of them, not just
 * the first, so one pass fixes the file.
 *
 * The failure this guards against is specific: a typo in an id silently does
 * nothing, so a tool she meant to switch off is still on, or she believes she
 * switched one on and it never appears. Either way she finds out in front of a
 * class. Hence unknown ids are an error rather than being ignored.
 */
export function validateToolsConfig(
  tools: ToolDefinition[],
  config: ToolsConfig,
): string[] {
  if (!isPlainObject(config) || !isPlainObject(config.tools)) {
    return ['tools.config.json must have a "tools" object at the top level.']
  }

  const knownIds = new Set(tools.map((tool) => tool.id))
  const problems: string[] = []

  for (const [id, entry] of Object.entries(config.tools)) {
    if (!knownIds.has(id)) {
      problems.push(
        `tools.config.json lists "${id}", which is not a known tool. Check the spelling against src/tools/index.ts.`,
      )
      continue
    }

    if (!isPlainObject(entry)) {
      problems.push(
        `tools.config.json entry for "${id}" must be an object, e.g. { "enabled": false }.`,
      )
      continue
    }

    if ('enabled' in entry && typeof entry.enabled !== 'boolean') {
      problems.push(
        `tools.config.json entry for "${id}" has a non-boolean "enabled". Use true or false, without quotes.`,
      )
    }

    if ('options' in entry && !isPlainObject(entry.options)) {
      problems.push(`tools.config.json entry for "${id}" has a non-object "options".`)
    }
  }

  return problems
}
