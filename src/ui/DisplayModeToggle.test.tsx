import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { DisplayModeToggle } from '@/ui/DisplayModeToggle'
import { DISPLAY_MODE_STORAGE_KEY } from '@/ui/displayMode'

afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-display')
})

const toggle = () => screen.getByRole('button', { name: /projector/i })

describe('DisplayModeToggle', () => {
  it('offers projector mode, off by default', () => {
    render(<DisplayModeToggle />)

    expect(toggle()).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches the whole document into projector mode', async () => {
    const user = userEvent.setup()
    render(<DisplayModeToggle />)

    await user.click(toggle())

    expect(document.documentElement).toHaveAttribute('data-display', 'projector')
    expect(toggle()).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches back off again', async () => {
    const user = userEvent.setup()
    render(<DisplayModeToggle />)

    await user.click(toggle())
    await user.click(toggle())

    expect(document.documentElement).not.toHaveAttribute('data-display')
    expect(toggle()).toHaveAttribute('aria-pressed', 'false')
  })

  it('remembers the choice, so she sets it once and not every lesson', async () => {
    const user = userEvent.setup()
    render(<DisplayModeToggle />)

    await user.click(toggle())

    expect(localStorage.getItem(DISPLAY_MODE_STORAGE_KEY)).toBe('projector')
  })

  it('comes back in projector mode when that is what was stored', () => {
    localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, 'projector')

    render(<DisplayModeToggle />)

    expect(toggle()).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement).toHaveAttribute('data-display', 'projector')
  })

  it('is reachable from the keyboard', async () => {
    const user = userEvent.setup()
    render(<DisplayModeToggle />)

    await user.tab()
    expect(toggle()).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(toggle()).toHaveAttribute('aria-pressed', 'true')
  })
})
