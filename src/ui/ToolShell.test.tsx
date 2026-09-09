import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ToolShell } from '@/ui/ToolShell'

describe('ToolShell', () => {
  it('names the tool in a top-level heading', () => {
    render(<ToolShell title="Gas laws">output</ToolShell>)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Gas laws')
  })

  it('shows the description when there is one', () => {
    render(
      <ToolShell title="Gas laws" description="Squeeze a box of particles.">
        output
      </ToolShell>,
    )

    expect(screen.getByText('Squeeze a box of particles.')).toBeVisible()
  })

  it('puts the controls in their own labelled region', () => {
    render(
      <ToolShell title="Gas laws" controls={<button type="button">Pressure</button>}>
        output
      </ToolShell>,
    )

    const controls = screen.getByRole('region', { name: /controls/i })
    expect(
      within(controls).getByRole('button', { name: 'Pressure' }),
    ).toBeInTheDocument()
  })

  it('puts the output in its own labelled region', () => {
    render(<ToolShell title="Gas laws">the simulation</ToolShell>)

    const output = screen.getByRole('region', { name: /output/i })
    expect(within(output).getByText('the simulation')).toBeInTheDocument()
  })

  it('offers reset only when the tool can be reset', () => {
    const { rerender } = render(<ToolShell title="Gas laws">output</ToolShell>)
    expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument()

    rerender(
      <ToolShell title="Gas laws" onReset={() => {}}>
        output
      </ToolShell>,
    )
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('offers randomize only when the tool can generate a new problem', () => {
    const { rerender } = render(<ToolShell title="Nomenclature">output</ToolShell>)
    expect(
      screen.queryByRole('button', { name: /new problem/i }),
    ).not.toBeInTheDocument()

    rerender(
      <ToolShell title="Nomenclature" onRandomize={() => {}}>
        output
      </ToolShell>,
    )
    expect(screen.getByRole('button', { name: /new problem/i })).toBeInTheDocument()
  })

  it('resets when R is pressed, so she is not hunting for a button mid-lesson', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    render(
      <ToolShell title="Gas laws" onReset={onReset}>
        output
      </ToolShell>,
    )

    await user.keyboard('r')

    expect(onReset).toHaveBeenCalledOnce()
  })

  it('ignores R while she is typing into a field', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    render(
      <ToolShell
        title="Molar mass"
        onReset={onReset}
        controls={<input aria-label="Formula" />}
      >
        output
      </ToolShell>,
    )

    await user.click(screen.getByLabelText('Formula'))
    await user.keyboard('Fr')

    expect(onReset).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Formula')).toHaveValue('Fr')
  })

  it('does nothing on R when the tool has no reset', async () => {
    const user = userEvent.setup()
    render(<ToolShell title="Gas laws">output</ToolShell>)

    await user.keyboard('r')

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
