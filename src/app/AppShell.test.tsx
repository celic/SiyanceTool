import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import { AppShell } from '@/app/AppShell'

function renderShell(children = <p>page content</p>) {
  return render(
    <MemoryRouter>
      <AppShell>{children}</AppShell>
    </MemoryRouter>,
  )
}

const menuButton = () => screen.getByRole('button', { name: /menu/i })

describe('AppShell navigation', () => {
  it('renders the page content it is given', () => {
    renderShell()

    expect(screen.getByText('page content')).toBeVisible()
  })

  it('starts with the panel closed, so a lesson is not covered by a menu', () => {
    renderShell()

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the panel and lists the pages', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.click(menuButton())

    const nav = screen.getByRole('navigation')
    expect(nav).toBeVisible()
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
  })

  it('closes the panel again from the same control', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.click(menuButton())
    await user.click(menuButton())

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the panel when Escape is pressed', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.click(menuButton())
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('returns focus to the menu button when the panel closes', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.click(menuButton())
    await user.keyboard('{Escape}')

    expect(menuButton()).toHaveFocus()
  })

  it('moves focus into the panel when it opens, so it can be driven by keyboard', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.click(menuButton())

    expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus()
  })

  it('closes the panel after a page is chosen', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.click(menuButton())
    await user.click(screen.getByRole('link', { name: 'Home' }))

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('is operable from the keyboard alone', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.tab()
    expect(menuButton()).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(screen.getByRole('navigation')).toBeVisible()
  })

  it('marks the current page for assistive technology', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.click(menuButton())

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})
