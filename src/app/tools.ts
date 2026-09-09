import rawConfig from '../../tools.config.json'

import { resolveTools, validateToolsConfig, type ToolsConfig } from '@/app/toolConfig'
import { TOOLS } from '@/tools/index'
import type { ResolvedTool } from '@/tools/registry'

const config = rawConfig as ToolsConfig

const problems = validateToolsConfig(TOOLS, config)

if (problems.length > 0) {
  const message = ['Problems in tools.config.json:', ...problems].join('\n  - ')

  if (import.meta.env.DEV) {
    // Fail loudly in development. A typo here silently leaves a tool on that
    // she meant to switch off, or off that she meant to switch on, and she
    // finds out in front of a class.
    throw new Error(message)
  } else {
    // In production, a bad config must never take the site down mid-lesson.
    // Bad entries are ignored by `resolveTools`, so the site still works.
    console.warn(message)
  }
}

/** Every tool, each paired with the config that applies to it. */
export const RESOLVED_TOOLS: ResolvedTool[] = resolveTools(TOOLS, config)
