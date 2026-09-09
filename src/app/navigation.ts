import { toolPath, type ResolvedTool } from '@/tools/registry'

export interface PageDefinition {
  /** Stable id — matches the tool id in docs/tools.md. */
  id: string
  /** Name shown in the navigation panel. */
  title: string
  /** Route path. */
  path: string
  /** Curriculum unit, for grouping the panel once there are enough tools. */
  unit?: string
}

export const HOME_PAGE: PageDefinition = { id: 'home', title: 'Home', path: '/' }

/**
 * The navigation panel's contents: home, then every enabled tool.
 *
 * Disabled tools are absent rather than greyed out. A tool she has switched off
 * is not a thing she wants to see listed during a lesson.
 */
export function buildPages(tools: ResolvedTool[]): PageDefinition[] {
  return [
    HOME_PAGE,
    ...tools
      .filter((tool) => tool.enabled)
      .map(({ definition }) => ({
        id: definition.id,
        title: definition.title,
        path: toolPath(definition.id),
        unit: definition.unit,
      })),
  ]
}
