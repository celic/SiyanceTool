import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Slider } from '@/ui/Slider'

describe('Slider', () => {
  it('is labelled, so it is announced and clickable by label', () => {
    render(
      <Slider
        label="Temperature"
        value={300}
        min={100}
        max={500}
        onChange={() => {}}
      />,
    )

    expect(screen.getByRole('slider', { name: /temperature/i })).toBeInTheDocument()
  })

  it('exposes its range, so assistive technology can announce position', () => {
    render(
      <Slider
        label="Temperature"
        value={300}
        min={100}
        max={500}
        step={5}
        onChange={() => {}}
      />,
    )

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '100')
    expect(slider).toHaveAttribute('max', '500')
    expect(slider).toHaveAttribute('step', '5')
    expect(slider).toHaveValue('300')
  })

  it('shows the current value as text, readable from across the room', () => {
    render(
      <Slider
        label="Temperature"
        value={300}
        min={100}
        max={500}
        onChange={() => {}}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('300')
  })

  it('shows the unit alongside the value', () => {
    render(
      <Slider
        label="Temperature"
        value={300}
        min={100}
        max={500}
        unit="K"
        onChange={() => {}}
      />,
    )

    // The readout is one element; the unit lives in a child span for styling,
    // so assert on its text content rather than a single text node.
    expect(screen.getByRole('status')).toHaveTextContent('300 K')
  })

  it('includes the unit in the announced value, not just the visible one', () => {
    render(
      <Slider
        label="Temperature"
        value={300}
        min={100}
        max={500}
        unit="K"
        onChange={() => {}}
      />,
    )

    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '300 K')
  })

  it('reports a new value as a number, not a string', () => {
    const onChange = vi.fn()
    render(
      <Slider
        label="Temperature"
        value={300}
        min={100}
        max={500}
        onChange={onChange}
      />,
    )

    fireEvent.change(screen.getByRole('slider'), { target: { value: '350' } })

    expect(onChange).toHaveBeenCalledWith(350)
  })

  it('can be disabled', () => {
    render(
      <Slider
        label="Temperature"
        value={300}
        min={100}
        max={500}
        disabled
        onChange={() => {}}
      />,
    )

    expect(screen.getByRole('slider')).toBeDisabled()
  })
})
