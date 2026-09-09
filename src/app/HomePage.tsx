import { Link } from 'react-router'

import { toolPath, type ResolvedTool } from '@/tools/registry'
import '@/app/page.css'
import '@/app/HomePage.css'

export interface HomePageProps {
  tools: ResolvedTool[]
}

/** Groups tools by unit, preserving the order units first appear in the list. */
function groupByUnit(tools: ResolvedTool[]): [string, ResolvedTool[]][] {
  const groups = new Map<string, ResolvedTool[]>()

  for (const tool of tools) {
    const unit = tool.definition.unit
    groups.set(unit, [...(groups.get(unit) ?? []), tool])
  }

  return [...groups]
}

/**
 * The landing page, and the page she will have open in front of a class.
 *
 * Grouped by unit and kept to one line of description per tool, because the
 * job here is to be scannable in about three seconds while a room waits.
 */
export function HomePage({ tools }: HomePageProps) {
  const enabled = tools.filter((tool) => tool.enabled)

  return (
    <div>
      <h1 className="page__title">SiyanceTool</h1>
      <p className="page__lede">
        Interactive chemistry tools for the classroom. Open the menu to pick one.
      </p>

      {enabled.length === 0 ? (
        <section className="home__empty" aria-labelledby="home-empty-heading">
          <h2 id="home-empty-heading" className="home__empty-heading">
            No tools yet
          </h2>
          <p>
            Either none are built yet, or they are all switched off in{' '}
            <code>tools.config.json</code>.
          </p>
        </section>
      ) : (
        groupByUnit(enabled).map(([unit, unitTools]) => (
          <section key={unit} className="home__unit" aria-labelledby={`unit-${unit}`}>
            <h2 id={`unit-${unit}`} className="home__unit-heading">
              {unit}
            </h2>
            <ul className="home__grid">
              {unitTools.map(({ definition }) => (
                <li key={definition.id}>
                  <Link className="home__card" to={toolPath(definition.id)}>
                    <span className="home__card-title">{definition.title}</span>
                    <span className="home__card-description">
                      {definition.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
