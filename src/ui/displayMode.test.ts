import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  DISPLAY_MODE_STORAGE_KEY,
  applyDisplayMode,
  readStoredDisplayMode,
  storeDisplayMode,
} from '@/ui/displayMode'

afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-display')
  vi.restoreAllMocks()
})

describe('readStoredDisplayMode', () => {
  it('defaults to normal when nothing has been chosen', () => {
    expect(readStoredDisplayMode()).toBe('normal')
  })

  it('returns the stored choice', () => {
    localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, 'projector')

    expect(readStoredDisplayMode()).toBe('projector')
  })

  it('falls back to normal if the stored value is not a mode', () => {
    localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, 'enormous')

    expect(readStoredDisplayMode()).toBe('normal')
  })

  it('falls back to normal when storage is unavailable, rather than throwing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })

    expect(readStoredDisplayMode()).toBe('normal')
  })
})

describe('storeDisplayMode', () => {
  it('remembers the choice, so it survives a reload between lessons', () => {
    storeDisplayMode('projector')

    expect(localStorage.getItem(DISPLAY_MODE_STORAGE_KEY)).toBe('projector')
  })

  it('does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })

    expect(() => storeDisplayMode('projector')).not.toThrow()
  })
})

describe('applyDisplayMode', () => {
  it('marks the document so the stylesheet can respond', () => {
    applyDisplayMode('projector')

    expect(document.documentElement).toHaveAttribute('data-display', 'projector')
  })

  it('clears the marker for normal mode rather than leaving a stale one', () => {
    applyDisplayMode('projector')
    applyDisplayMode('normal')

    expect(document.documentElement).not.toHaveAttribute('data-display')
  })
})
