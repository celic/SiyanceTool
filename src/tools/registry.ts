import type { ComponentType } from 'react'

/**
 * Priority tier from docs/tools.md. Tier is not build order — it records how
 * strongly a tool justifies its own page.
 */
export type ToolTier = 1 | 2 | 3

/** Options a tool reads from `tools.config.json`, e.g. default pressure units. */
export type ToolOptions = Record<string, unknown>

/**
 * What every tool component is handed. `options` is the tool's
 * `defaultOptions` with the config file's overrides merged over it, so a
 * classroom preference reaches the tool without the tool knowing where it
 * came from. A tool that has no options can simply ignore the prop.
 */
export interface ToolProps {
  options: ToolOptions
}

/**
 * Everything the app needs to know about a tool without importing it.
 *
 * A tool declares one of these in its own folder and adds itself to
 * `src/tools/index.ts`. Nothing else — not routing, not the home page, not the
 * navigation panel — needs editing to add a tool.
 */
export interface ToolDefinition {
  /** Stable id. Doubles as the route path and the key in `tools.config.json`. */
  id: string
  /** Name shown in navigation and on its home page card. */
  title: string
  /** Curriculum unit, used to group the home page. */
  unit: string
  /** One line, shown on the home page card. Say what it does, not what it is. */
  description: string
  tier: ToolTier
  /** The tool itself. Rendered with its resolved options. */
  component: ComponentType<ToolProps>
  /**
   * Defaults for this tool's options. `tools.config.json` overrides individual
   * keys, so a classroom preference never requires a code change.
   */
  defaultOptions?: ToolOptions
}

/** A tool paired with the config that applies to it. */
export interface ResolvedTool {
  definition: ToolDefinition
  enabled: boolean
  /** `defaultOptions` with any config overrides merged over the top. */
  options: ToolOptions
}

/** Route path for a tool. Kept here so nothing else has to know the shape. */
export function toolPath(id: string): string {
  return `/${id}`
}
