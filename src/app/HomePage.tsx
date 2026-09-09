import '@/app/page.css'
import '@/app/HomePage.css'

/**
 * The landing page, and the page she will have open in front of a class.
 *
 * Once the tool registry exists (docs/plan.md item 6) this becomes a grid of
 * tool cards grouped by unit, scannable in about three seconds. For now it is
 * an honest empty state.
 */
export function HomePage() {
  return (
    <div>
      <h1 className="page__title">SiyanceTool</h1>
      <p className="page__lede">
        Interactive chemistry tools for the classroom. Open the menu to pick one.
      </p>

      <section className="home__empty" aria-labelledby="home-empty-heading">
        <h2 id="home-empty-heading" className="home__empty-heading">
          No tools yet
        </h2>
        <p>
          The site is still being built. Tools appear here as they are finished — see{' '}
          <code>docs/plan.md</code> for what is coming and in what order.
        </p>
      </section>
    </div>
  )
}
