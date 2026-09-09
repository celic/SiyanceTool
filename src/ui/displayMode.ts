/**
 * Display mode: how big and how contrasty the whole site is.
 *
 * Separate from light/dark, which follows the operating system. This axis is
 * about the room — a classroom projector is usually low-resolution, washed out,
 * and read from twenty feet away, which needs bigger type and heavier lines
 * than a laptop at arm's length.
 */
export type DisplayMode = 'normal' | 'projector'

export const DISPLAY_MODE_STORAGE_KEY = 'siyance:display-mode'

function isDisplayMode(value: unknown): value is DisplayMode {
  return value === 'normal' || value === 'projector'
}

/**
 * The stored choice, defaulting to normal.
 *
 * Every storage access is guarded: a locked-down school browser can throw on
 * localStorage, and a theme preference is never worth a blank page.
 */
export function readStoredDisplayMode(): DisplayMode {
  try {
    const stored = localStorage.getItem(DISPLAY_MODE_STORAGE_KEY)
    return isDisplayMode(stored) ? stored : 'normal'
  } catch {
    return 'normal'
  }
}

export function storeDisplayMode(mode: DisplayMode): void {
  try {
    localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, mode)
  } catch {
    // Not worth surfacing. The mode still applies for this session; it just
    // will not be remembered after a reload.
  }
}

/**
 * Marks the document so the token stylesheet can respond.
 *
 * Normal mode removes the attribute rather than setting `data-display="normal"`,
 * so the default tokens are the ones on bare `:root` and there is only ever one
 * override to reason about.
 */
export function applyDisplayMode(mode: DisplayMode): void {
  if (mode === 'projector') {
    document.documentElement.setAttribute('data-display', 'projector')
  } else {
    document.documentElement.removeAttribute('data-display')
  }
}
