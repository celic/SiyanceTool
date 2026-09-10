import { massBalanceTool } from '@/tools/mass-balance/index'
import type { ToolDefinition } from '@/tools/registry'

/**
 * Every tool on the site.
 *
 * Adding a tool means adding its folder under `src/tools/` and one line here.
 * Routing, the navigation panel, and the home page all derive from this list,
 * so nothing else needs editing to add a tool.
 */
export const TOOLS: ToolDefinition[] = [massBalanceTool]
