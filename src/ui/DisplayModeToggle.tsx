import { useEffect, useState } from 'react'

import {
  applyDisplayMode,
  readStoredDisplayMode,
  storeDisplayMode,
  type DisplayMode,
} from '@/ui/displayMode'
import '@/ui/DisplayModeToggle.css'

/**
 * Switches the site into projector mode: bigger type, heavier lines, higher
 * contrast.
 *
 * Deliberately a single visible control rather than a settings page. She turns
 * it on once when she plugs into the projector, and it is remembered — but it
 * has to be findable in the two seconds before a class starts.
 */
export function DisplayModeToggle() {
  const [mode, setMode] = useState<DisplayMode>(readStoredDisplayMode)

  useEffect(() => {
    applyDisplayMode(mode)
  }, [mode])

  function toggle() {
    const next: DisplayMode = mode === 'projector' ? 'normal' : 'projector'
    setMode(next)
    storeDisplayMode(next)
  }

  return (
    <button
      type="button"
      className="display-toggle"
      aria-pressed={mode === 'projector'}
      onClick={toggle}
    >
      <span className="display-toggle__icon" aria-hidden="true" />
      Projector mode
    </button>
  )
}
