import type { Decimals } from '@/core/balance'
import type { ToolOptions } from '@/tools/registry'

/** The tool's options, as documented in docs/tools.md under `mass-balance`. */
export interface Settings {
  decimals: Decimals
  tareLabel: 'Tare' | 'Zero'
  waterDensity: number
}

export const DEFAULT_OPTIONS: Settings = {
  decimals: 2,
  tareLabel: 'Tare',
  waterDensity: 1,
}

/**
 * Reads the tool's options leniently. A bad value in `tools.config.json`
 * falls back to the default rather than breaking the page — the config file
 * is validated for unknown tools, not for the shape of each option.
 */
export function readSettings(options: ToolOptions): Settings {
  const { decimals, tareLabel, waterDensity } = options
  return {
    decimals: decimals === 1 || decimals === 2 ? decimals : DEFAULT_OPTIONS.decimals,
    tareLabel:
      tareLabel === 'Tare' || tareLabel === 'Zero'
        ? tareLabel
        : DEFAULT_OPTIONS.tareLabel,
    waterDensity:
      typeof waterDensity === 'number' && waterDensity > 0
        ? waterDensity
        : DEFAULT_OPTIONS.waterDensity,
  }
}
