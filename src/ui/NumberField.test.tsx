import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { NumberField } from '@/ui/NumberField'

const field = () => screen.getByRole('textbox', { name: /mass/i })

describe('NumberField', () => {
  it('is labelled', () => {
    render(<NumberField label="Mass" value={12} onChange={() => {}} />)

    expect(field()).toBeInTheDocument()
  })

  it('shows the unit next to the field', () => {
    render(<NumberField label="Mass" value={12} unit="g" onChange={() => {}} />)

    expect(screen.getByText('g')).toBeVisible()
  })

  it('reports a valid number as a number', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberField label="Mass" value={12} onChange={onChange} />)

    await user.clear(field())
    await user.type(field(), '25')

    expect(onChange).toHaveBeenLastCalledWith(25)
  })

  it('accepts decimals', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberField label="Mass" value={12} onChange={onChange} />)

    await user.clear(field())
    await user.type(field(), '2.5')

    expect(onChange).toHaveBeenLastCalledWith(2.5)
  })

  it('never reports a number for nonsense input', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberField label="Mass" value={12} onChange={onChange} />)

    await user.clear(field())
    await user.type(field(), 'abc')

    expect(onChange).not.toHaveBeenCalled()
  })

  it('explains nonsense input rather than silently ignoring it', async () => {
    const user = userEvent.setup()
    render(<NumberField label="Mass" value={12} onChange={() => {}} />)

    await user.clear(field())
    await user.type(field(), 'abc')

    expect(field()).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText(/must be a number/i)).toBeVisible()
  })

  it('says what the allowed range is when the value falls outside it', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <NumberField label="Mass" value={12} min={0} max={100} onChange={onChange} />,
    )

    await user.clear(field())
    await user.type(field(), '150')

    expect(screen.getByText(/between 0 and 100/i)).toBeVisible()
    expect(onChange).not.toHaveBeenCalledWith(150)
  })

  it('treats an empty field as unfinished typing, not an error', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberField label="Mass" value={12} onChange={onChange} />)

    await user.clear(field())

    expect(field()).not.toHaveAttribute('aria-invalid', 'true')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('clears the complaint once the input is valid again', async () => {
    const user = userEvent.setup()
    render(<NumberField label="Mass" value={12} onChange={() => {}} />)

    await user.clear(field())
    await user.type(field(), 'abc')
    await user.clear(field())
    await user.type(field(), '7')

    expect(screen.queryByText(/must be a number/i)).not.toBeInTheDocument()
    expect(field()).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('picks up a value changed from outside, e.g. by reset', () => {
    const { rerender } = render(
      <NumberField label="Mass" value={12} onChange={() => {}} />,
    )
    rerender(<NumberField label="Mass" value={99} onChange={() => {}} />)

    expect(field()).toHaveValue('99')
  })
  it('restores the last good value when focus leaves an invalid field', async () => {
    const user = userEvent.setup()
    render(<NumberField label="Mass" value={12} onChange={() => {}} />)

    await user.clear(field())
    await user.type(field(), 'abc')
    await user.tab()

    expect(field()).toHaveValue('12')
    expect(screen.queryByText(/must be a number/i)).not.toBeInTheDocument()
  })

  it('restores the value when focus leaves an empty field', async () => {
    const user = userEvent.setup()
    render(<NumberField label="Mass" value={12} onChange={() => {}} />)

    await user.clear(field())
    await user.tab()

    expect(field()).toHaveValue('12')
  })

  it('leaves a valid entry alone on blur', async () => {
    const user = userEvent.setup()
    render(<NumberField label="Mass" value={12} onChange={() => {}} />)

    await user.clear(field())
    await user.type(field(), '7')
    await user.tab()

    expect(field()).toHaveValue('7')
  })
})
