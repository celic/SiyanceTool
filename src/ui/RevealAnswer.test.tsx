import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { RevealAnswer } from '@/ui/RevealAnswer'

describe('RevealAnswer', () => {
  it('hides its content until revealed', () => {
    render(<RevealAnswer>42 g/mol</RevealAnswer>)

    expect(screen.queryByText('42 g/mol')).not.toBeInTheDocument()
  })

  it('shows the content after the reveal control is activated', async () => {
    const user = userEvent.setup()
    render(<RevealAnswer>42 g/mol</RevealAnswer>)

    await user.click(screen.getByRole('button', { name: /reveal/i }))

    expect(screen.getByText('42 g/mol')).toBeVisible()
  })

  it('hides the content again, so the next class starts covered', async () => {
    const user = userEvent.setup()
    render(<RevealAnswer>42 g/mol</RevealAnswer>)

    await user.click(screen.getByRole('button', { name: /reveal/i }))
    await user.click(screen.getByRole('button', { name: /hide/i }))

    expect(screen.queryByText('42 g/mol')).not.toBeInTheDocument()
  })

  it('is operable from the keyboard, since she is driving from across the room', async () => {
    const user = userEvent.setup()
    render(<RevealAnswer>42 g/mol</RevealAnswer>)

    await user.tab()
    expect(screen.getByRole('button', { name: /reveal/i })).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(screen.getByText('42 g/mol')).toBeVisible()
  })

  it('reports its state to assistive technology', async () => {
    const user = userEvent.setup()
    render(<RevealAnswer>42 g/mol</RevealAnswer>)

    const button = screen.getByRole('button', { name: /reveal/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)
    expect(screen.getByRole('button', { name: /hide/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('accepts a custom label, so the prompt can name what is hidden', () => {
    render(<RevealAnswer label="Reveal the limiting reagent">Oxygen</RevealAnswer>)

    expect(
      screen.getByRole('button', { name: 'Reveal the limiting reagent' }),
    ).toBeInTheDocument()
  })

  it('can start revealed, for a tool configured to skip the gate', () => {
    render(<RevealAnswer defaultRevealed>42 g/mol</RevealAnswer>)

    expect(screen.getByText('42 g/mol')).toBeVisible()
  })
})
