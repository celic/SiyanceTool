/**
 * The pages the navigation panel lists.
 *
 * This is a temporary stand-in for the tool registry (docs/plan.md item 6).
 * When that lands, this list is generated from registered tools filtered by
 * `tools.config.json`, and hand-editing it stops being the way to add a page.
 */
export interface PageDefinition {
  /** Stable id — matches the tool id in docs/tools.md, and the route. */
  id: string
  /** Name shown in the navigation panel. */
  title: string
  /** Route path. */
  path: string
  /** Curriculum unit, used to group the panel once there is more than one page. */
  unit?: string
}

export const PAGES: PageDefinition[] = [{ id: 'home', title: 'Home', path: '/' }]
