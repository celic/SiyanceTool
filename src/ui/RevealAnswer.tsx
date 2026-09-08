import { useId, useState, type ReactNode } from 'react'

import '@/ui/RevealAnswer.css'

export interface RevealAnswerProps {
  /** The answer to keep covered until she chooses to show it. */
  children: ReactNode
  /** Prompt shown while hidden. Name what is hidden when it isn't obvious. */
  label?: string
  /** Prompt shown while revealed. */
  hideLabel?: string
  /** Start revealed — for a tool configured to skip the gate entirely. */
  defaultRevealed?: boolean
}

/**
 * Hides an answer behind a click, so the class can be asked before being told.
 *
 * This is the component that makes the site teachable rather than merely
 * informative, so it appears on nearly every tool. See docs/tools.md,
 * "conventions every tool follows".
 *
 * Hidden content is not rendered at all, rather than visually hidden — an
 * answer that is merely `display: none` is still readable by anyone who opens
 * devtools or a screen reader, which defeats the point.
 */
export function RevealAnswer({
  children,
  label = 'Reveal answer',
  hideLabel = 'Hide answer',
  defaultRevealed = false,
}: RevealAnswerProps) {
  const [revealed, setRevealed] = useState(defaultRevealed)
  const contentId = useId()

  return (
    <div className="reveal">
      <button
        type="button"
        className="reveal__button"
        aria-expanded={revealed}
        aria-controls={contentId}
        onClick={() => setRevealed((wasRevealed) => !wasRevealed)}
      >
        {revealed ? hideLabel : label}
      </button>
      <div id={contentId} className="reveal__content">
        {revealed ? children : null}
      </div>
    </div>
  )
}
