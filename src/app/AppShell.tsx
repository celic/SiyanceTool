import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router'

import type { PageDefinition } from '@/app/navigation'
import { DisplayModeToggle } from '@/ui/DisplayModeToggle'
import '@/app/AppShell.css'

export interface AppShellProps {
  children: ReactNode
  /** Pages listed in the panel. Derived from the tool registry by `App`. */
  pages: PageDefinition[]
}

/**
 * Site frame: a burger control in the top left that opens a side panel of
 * pages, over the page content.
 *
 * The panel is unmounted when closed rather than hidden with CSS, so nothing
 * inside it is tabbable or readable while a lesson is on screen.
 *
 * Focus is managed deliberately because this site is driven from across a
 * classroom: opening the panel moves focus to the first page, and closing it
 * puts focus back on the burger, so she never loses her place in the tab order.
 */
export function AppShell({ children, pages }: AppShellProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  // Tracks whether the panel was open last render, so focus is only forced
  // when it actually changes rather than on every unrelated re-render.
  const wasOpen = useRef(false)

  useEffect(() => {
    if (open && !wasOpen.current) {
      firstLinkRef.current?.focus()
    } else if (!open && wasOpen.current) {
      buttonRef.current?.focus()
    }
    wasOpen.current = open
  }, [open])

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <div className="shell">
      <header className="shell__header">
        <button
          ref={buttonRef}
          type="button"
          className="shell__menu-button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((isOpen) => !isOpen)}
        >
          <span className="shell__burger" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          {open ? 'Close menu' : 'Menu'}
        </button>

        <DisplayModeToggle />
      </header>

      {open && (
        <>
          {/* Clicking away is the fastest way out mid-lesson. Not keyboard
              reachable on purpose — Escape and the burger already cover that. */}
          <div
            className="shell__scrim"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav id={panelId} className="shell__panel" aria-label="Tools">
            <ul className="shell__page-list">
              {pages.map((page, index) => (
                <li key={page.id}>
                  <NavLink
                    ref={index === 0 ? firstLinkRef : undefined}
                    to={page.path}
                    className="shell__page-link"
                    onClick={() => setOpen(false)}
                  >
                    {page.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}

      <main className="shell__main">{children}</main>
    </div>
  )
}
