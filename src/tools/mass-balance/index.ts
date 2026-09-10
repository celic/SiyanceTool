import { MassBalance } from '@/tools/mass-balance/MassBalance'
import { DEFAULT_OPTIONS } from '@/tools/mass-balance/options'
import type { ToolDefinition } from '@/tools/registry'

/** See docs/tools.md, "mass-balance — Using a balance". */
export const massBalanceTool: ToolDefinition = {
  id: 'mass-balance',
  title: 'Using a balance',
  unit: 'States of matter',
  description:
    'Rehearse massing a solid, a liquid and a gas on a simulated digital balance.',
  tier: 1,
  component: MassBalance,
  defaultOptions: { ...DEFAULT_OPTIONS },
}
