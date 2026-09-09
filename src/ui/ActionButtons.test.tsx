import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { RandomizeButton, ResetButton } from '@/ui/ActionButtons'

describe('ResetButton', () => {
  it('is labelled for what it does', () => {
    render(<ResetButton onClick={() => {}} />)

    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('calls back when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<ResetButton onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: /reset/i }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('works from the keyboard', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<ResetButton onClick={onClick} />)

    await user.tab()
    await user.keyboard('{Enter}')

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('accepts a more specific label when "Reset" is ambiguous', () => {
    render(<ResetButton onClick={() => {}} label="Reset the burette" />)

    expect(
      screen.getByRole('button', { name: 'Reset the burette' }),
    ).toBeInTheDocument()
  })
})

describe('RandomizeButton', () => {
  it('is labelled for what it does', () => {
    render(<RandomizeButton onClick={() => {}} />)

    expect(screen.getByRole('button', { name: /new problem/i })).toBeInTheDocument()
  })

  it('calls back when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<RandomizeButton onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: /new problem/i }))

    expect(onClick).toHaveBeenCalledOnce()
  })
})
