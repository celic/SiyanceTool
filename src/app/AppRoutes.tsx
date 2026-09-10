import { Route, Routes } from 'react-router'

import { HomePage } from '@/app/HomePage'
import { NotFoundPage } from '@/app/NotFoundPage'
import { ToolDisabledPage } from '@/app/ToolDisabledPage'
import { toolPath, type ResolvedTool } from '@/tools/registry'

export interface AppRoutesProps {
  tools: ResolvedTool[]
}

/**
 * The route table, derived entirely from the registry and config.
 *
 * A disabled tool gets a route that explains itself rather than no route at
 * all — its component is never rendered, so switching a tool off genuinely
 * makes it unreachable, not merely hidden from the menu.
 *
 * Split from `App` so it can be tested inside a MemoryRouter.
 */
export function AppRoutes({ tools }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/" element={<HomePage tools={tools} />} />

      {tools.map(({ definition, enabled, options }) => {
        const Tool = definition.component
        return (
          <Route
            key={definition.id}
            path={toolPath(definition.id)}
            element={
              enabled ? (
                <Tool options={options} />
              ) : (
                <ToolDisabledPage title={definition.title} />
              )
            }
          />
        )
      })}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
