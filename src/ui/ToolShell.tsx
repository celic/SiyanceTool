import { useEffect, useId, type ReactNode } from 'react'

import { RandomizeButton, ResetButton } from '@/ui/ActionButtons'
import '@/ui/ToolShell.css'

export interface ToolShellProps {
  title: string
  description?: string
  /** Inputs for the tool: sliders, fields, mode switches. */
  controls?: ReactNode
  /** The tool itself: the simulation, chart, table, or worked answer. */
  children: ReactNode
  onReset?: () => void
  onRandomize?: () => void
}

/** True when a keystroke belongs to something the user is typing into. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false

  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable
  )
}

/**
 * The frame every tool sits in: title, description, controls, output, and the
 * actions that are always in the same place.
 *
 * Controls and output are separate labelled regions so a screen reader user can
 * jump between "the knobs" and "the answer" without walking the whole page.
 */
export function ToolShell({
  title,
  description,
  controls,
  children,
  onReset,
  onRandomize,
}: ToolShellProps) {
  const controlsId = useId()
  const outputId = useId()

  useEffect(() => {
    if (!onReset) return

    function onKeyDown(event: KeyboardEvent) {
      // Guarded against fields: `R` is a letter she may well be typing into a
      // formula box, and wiping her input would be worse than no shortcut.
      if (event.key !== 'r' && event.key !== 'R') return
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (isTypingTarget(event.target)) return

      onReset?.()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onReset])

  return (
    <article className="tool">
      <header className="tool__header">
        <div>
          <h1 className="tool__title">{title}</h1>
          {description && <p className="tool__description">{description}</p>}
        </div>

        {(onReset || onRandomize) && (
          <div className="tool__actions">
            {onRandomize && <RandomizeButton onClick={onRandomize} />}
            {onReset && <ResetButton onClick={onReset} />}
          </div>
        )}
      </header>

      {controls && (
        <section
          className="tool__controls"
          aria-labelledby={controlsId}
          data-testid="tool-controls"
        >
          <h2 id={controlsId} className="tool__region-heading">
            Controls
          </h2>
          {controls}
        </section>
      )}

      <section className="tool__output" aria-labelledby={outputId}>
        <h2 id={outputId} className="tool__region-heading">
          Output
        </h2>
        {children}
      </section>
    </article>
  )
}
