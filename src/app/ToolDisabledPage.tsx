import { Link } from 'react-router'

import '@/app/page.css'

export interface ToolDisabledPageProps {
  title: string
}

/**
 * A tool that exists but is switched off in `tools.config.json`.
 *
 * Distinct from "not found" on purpose. The likeliest visitor is the teacher
 * opening a bookmark in front of a class, and "this is turned off" tells her
 * something she can act on, where "not found" would send her looking for a
 * broken link that isn't broken.
 */
export function ToolDisabledPage({ title }: ToolDisabledPageProps) {
  return (
    <div>
      <h1 className="page__title">This tool is turned off</h1>
      <p className="page__lede">
        <strong>{title}</strong> exists but is switched off in{' '}
        <code>tools.config.json</code>. Set its <code>enabled</code> to{' '}
        <code>true</code> to bring it back.
      </p>
      <Link to="/">Back to the home page</Link>
    </div>
  )
}
