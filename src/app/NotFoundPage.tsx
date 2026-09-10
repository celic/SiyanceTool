import { Link } from 'react-router'

import '@/app/page.css'

/**
 * Unknown route. Kept deliberately calm and short: the likeliest way anyone
 * lands here is a stale bookmark opened in front of a class, and the only
 * useful thing at that moment is a way back.
 *
 * A tool that exists but is switched off gets its own distinct page saying so
 * (`ToolDisabledPage`), not this one.
 */
export function NotFoundPage() {
  return (
    <div>
      <h1 className="page__title">Page not found</h1>
      <p className="page__lede">
        There is nothing at this address. It may have been a tool that has since been
        renamed.
      </p>
      <Link to="/">Back to the home page</Link>
    </div>
  )
}
