import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { MassBalance } from '@/tools/mass-balance/MassBalance'
import { massBalanceTool } from '@/tools/mass-balance/index'

function setup(options: Record<string, unknown> = {}) {
  const user = userEvent.setup()
  render(<MassBalance options={options} />)
  return user
}

const display = () => screen.getByRole('status', { name: /balance display/i })
const button = (name: RegExp | string) => screen.getByRole('button', { name })
const item = (name: RegExp) => screen.getByRole('button', { name })

async function chooseTask(user: ReturnType<typeof userEvent.setup>, name: RegExp) {
  await user.click(screen.getByRole('radio', { name }))
}

describe('MassBalance', () => {
  it('registers with the id the docs use', () => {
    expect(massBalanceTool.id).toBe('mass-balance')
    expect(massBalanceTool.component).toBe(MassBalance)
  })

  it('opens on the first task of the lab, with sandbox listed last', () => {
    setup()

    const tasks = screen.getAllByRole('radio')
    expect(tasks[0]).toHaveAccessibleName(/2A/)
    expect(tasks[0]).toBeChecked()
    expect(tasks[tasks.length - 1]).toHaveAccessibleName(/sandbox/i)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  describe('walkthrough', () => {
    it('starts on step 1 and walks forward and back through the steps', async () => {
      const user = setup()

      const current = () => screen.getByRole('listitem', { current: 'step' })
      expect(current()).toHaveTextContent(/press power/i)
      expect(button(/^back$/i)).toBeDisabled()

      await user.click(button(/^next$/i))
      expect(current()).toHaveTextContent(/place the weigh boat/i)

      await user.click(button(/^back$/i))
      expect(current()).toHaveTextContent(/press power/i)
    })

    it('runs on from the last step of one task into the first step of the next', async () => {
      const user = setup()
      const task2a = screen.getByRole('radio', { name: /2A/ })
      const steps = within(screen.getByRole('list', { name: /steps/i })).getAllByRole(
        'listitem',
      ).length

      for (let i = 0; i < steps - 1; i += 1) await user.click(button(/^next$/i))
      expect(task2a).toBeChecked()
      expect(button(/^next/i)).toHaveAccessibleName(/2B/)

      await user.click(button(/^next/i))
      expect(screen.getByRole('radio', { name: /2B/ })).toBeChecked()
      expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent(
        /take the sphere out/i,
      )
    })

    it("moves the marker on by itself when the step's action is taken", async () => {
      const user = setup()
      const current = () => screen.getByRole('listitem', { current: 'step' })
      expect(current()).toHaveTextContent(/press power/i)

      await user.click(button(/power/i))
      expect(current()).toHaveTextContent(/place the weigh boat/i)

      await user.click(item(/^weigh boat/i))
      // Placing alone is not the whole step — it also says "Record the mass".
      expect(current()).toHaveTextContent(/place the weigh boat/i)
      await user.click(button(/record weigh boat$/i))
      expect(current()).toHaveTextContent(/place the sphere/i)

      await user.click(item(/^sphere/i))
      await user.click(button(/record weigh boat \+ sphere/i))
      expect(current()).toHaveTextContent(/to get the mass of just the sphere/i)
      expect(button(/^next/i)).toHaveAccessibleName(/2B/)
    })

    it('runs Task 3 in the order a balance is actually used: cup, tare, off, measure, pour, back', async () => {
      const user = setup()
      await chooseTask(user, /task 3/i)
      await user.click(button(/power/i))
      const current = () => screen.getByRole('listitem', { current: 'step' })
      const steps = within(screen.getByRole('list', { name: /steps/i })).getAllByRole(
        'listitem',
      )
      expect(steps.map((step) => step.textContent)).toEqual([
        expect.stringMatching(/remove the weigh boat and sphere/i),
        expect.stringMatching(/press tare and wait until it reads zero/i),
        expect.stringMatching(/place the empty cup on the balance/i),
        expect.stringMatching(/press tare and wait until it says zero/i),
        expect.stringMatching(/take the cup off/i),
        expect.stringMatching(/measure out 10 mL/i),
        expect.stringMatching(/pour the water into the cup/i),
        expect.stringMatching(/place the cup back on the balance/i),
        expect.stringMatching(/pour the water back out/i),
      ])

      // Step 1, "remove the weigh boat and sphere", is already true on an
      // empty pan, so one Tare press completes steps 1 and 2 together.
      await user.click(button(/^tare$/i))
      expect(current()).toHaveTextContent(/place the empty cup/i)

      await user.click(item(/^cup/i))
      await user.click(button(/record empty cup/i))
      expect(current()).toHaveTextContent(/press tare and wait until it says zero/i)
      await user.click(button(/^tare$/i))
      expect(current()).toHaveTextContent(/take the cup off/i)
      await user.click(item(/^cup/i))
      expect(current()).toHaveTextContent(/measure out 10 mL/i)

      // Nothing on the page can tell the cylinder was read, so pouring —
      // the next step — carries the marker past it.
      await user.click(button(/pour into cup/i))
      expect(current()).toHaveTextContent(/place the cup back on the balance/i)
    })

    it('runs Task 5 like Task 3: clear, cup, tare, off, measure, pour, back', async () => {
      const user = setup()
      await chooseTask(user, /task 5/i)
      const steps = within(screen.getByRole('list', { name: /steps/i })).getAllByRole(
        'listitem',
      )
      expect(steps.map((step) => step.textContent)).toEqual([
        expect.stringMatching(/1 mL of pure water = 1 g/i),
        expect.stringMatching(/enter the day of the month/i),
        expect.stringMatching(/take everything off the balance/i),
        expect.stringMatching(/place the empty cup on the balance and press tare/i),
        expect.stringMatching(/take the cup off/i),
        expect.stringMatching(/measure out that volume/i),
        expect.stringMatching(/pour it into the cup on the bench/i),
        expect.stringMatching(/place the cup back on the balance/i),
        expect.stringMatching(/how close/i),
      ])
    })

    it('makes Task 5 clear the pan first, so the tare is the cup alone', async () => {
      // Arriving from Task 4, the boat and inflated balloon are still on.
      const user = setup()
      await chooseTask(user, /task 4/i)
      await user.click(button(/power/i))
      await user.click(item(/^weigh boat/i))
      await user.click(item(/^inflated balloon/i))

      await chooseTask(user, /task 5/i)
      const current = () => screen.getByRole('listitem', { current: 'step' })
      await user.click(button(/^next/i))
      await user.click(button(/^next/i))
      expect(current()).toHaveTextContent(/take everything off/i)
      expect(item(/^inflated balloon/i)).toHaveAttribute('aria-pressed', 'true')

      // Lifting the boat takes the balloon with it and clears the pan.
      await user.click(item(/^weigh boat/i))
      expect(current()).toHaveTextContent(/place the empty cup/i)

      await user.click(item(/^cup/i))
      await user.click(button(/^tare$/i))
      await user.click(item(/^cup/i))
      await user.click(button(/pour into cup/i))
      await user.click(button(/record volume/i))
      await user.click(item(/^cup/i))
      expect(button(/record mass of water/i)).toBeEnabled()
    })

    it('makes Task 3 take the cup off before pouring it out, and refuses otherwise', async () => {
      const user = setup()
      await chooseTask(user, /task 3/i)
      await user.click(button(/power/i))
      await user.click(button(/pour into cup/i))
      await user.click(item(/^cup/i))

      await user.click(button(/empty the cup/i))

      expect(screen.getByRole('alert')).toHaveTextContent(/take the cup off/i)
      expect(display()).toHaveTextContent('18.21 g')
      expect(
        screen.getByText(/take the cup off the balance, pour the water back out/i),
      ).toBeVisible()
    })

    it('does not move the marker for an action that belongs to an earlier step', async () => {
      const user = setup()
      const current = () => screen.getByRole('listitem', { current: 'step' })
      await user.click(button(/power/i))
      await user.click(item(/^weigh boat/i))
      await user.click(button(/record weigh boat$/i))
      expect(current()).toHaveTextContent(/place the sphere/i)

      await user.click(button(/record weigh boat$/i))
      expect(current()).toHaveTextContent(/place the sphere/i)
    })

    it('makes Record wait until the balance holds what the step describes', async () => {
      const user = setup()
      await user.click(button(/power/i))

      const recordBoat = () => button(/record weigh boat$/i)
      expect(recordBoat()).toBeDisabled()
      expect(
        screen.getAllByText(/put the weigh boat on the balance first/i)[0],
      ).toBeVisible()

      await user.click(item(/^weigh boat/i))
      expect(recordBoat()).toBeEnabled()

      // Step 3 wants the sphere in the boat; step 2 wanted the boat alone.
      await user.click(recordBoat())
      const recordBoth = () => button(/record weigh boat \+ sphere/i)
      expect(recordBoth()).toBeDisabled()
      await user.click(item(/^sphere/i))
      expect(recordBoth()).toBeEnabled()
      expect(recordBoat()).toBeDisabled()
    })

    it('makes Record wait for power, and for Tare where the step asks for it', async () => {
      const user = setup()
      expect(button(/record weigh boat$/i)).toBeDisabled()
      expect(screen.getAllByText(/press power first/i)[0]).toBeVisible()

      await chooseTask(user, /2B/)
      await user.click(button(/power/i))
      await user.click(item(/^weigh boat/i))
      await user.click(button(/record weigh boat alone/i))
      expect(button(/record after tare/i)).toBeDisabled()
      expect(screen.getByText(/press tare first/i)).toBeVisible()

      await user.click(button(/^tare$/i))
      expect(button(/record after tare/i)).toBeEnabled()
    })

    it('shows the record button on the step that asks for it, and the value once taken', async () => {
      const user = setup()
      await user.click(button(/power/i))
      await user.click(item(/^weigh boat/i))

      const step = screen.getByText(/place the weigh boat/i).closest('li')
      if (!step) throw new Error('step not found')
      await user.click(within(step).getByRole('button', { name: /record/i }))

      expect(step).toHaveTextContent('2.35 g')
    })
  })

  it('shows nothing on the display until the balance is powered on', async () => {
    const user = setup()

    expect(display()).toHaveTextContent('')

    await user.click(button(/power/i))

    expect(display()).toHaveTextContent('0.00 g')
  })

  describe('Task 2A — solid by subtraction', () => {
    it('reads the weigh boat, then the boat and sphere, and hides the answer until revealed', async () => {
      const user = setup()
      await chooseTask(user, /2A/)
      await user.click(button(/power/i))

      await user.click(item(/^weigh boat/i))
      expect(display()).toHaveTextContent('2.35 g')
      await user.click(button(/record weigh boat$/i))

      await user.click(item(/^sphere/i))
      expect(display()).toHaveTextContent('7.47 g')
      await user.click(button(/record weigh boat \+ sphere/i))

      expect(screen.queryByText(/5\.12 g/)).not.toBeInTheDocument()
      await user.click(button(/reveal/i))
      expect(screen.getByText(/7\.47 g − 2\.35 g/)).toBeVisible()
      expect(screen.getByText(/= 5\.12 g/)).toBeVisible()
    })

    it('does not offer the reveal until every blank is recorded', async () => {
      const user = setup()
      await chooseTask(user, /2A/)
      await user.click(button(/power/i))

      expect(screen.queryByRole('button', { name: /reveal/i })).not.toBeInTheDocument()
    })

    it('refuses to put the sphere on without the weigh boat, in words', async () => {
      const user = setup()
      await chooseTask(user, /2A/)
      await user.click(button(/power/i))

      await user.click(item(/^sphere/i))

      expect(screen.getByRole('alert')).toHaveTextContent(/weigh boat/i)
      expect(display()).toHaveTextContent('0.00 g')
    })
  })

  describe('Task 2B — solid by Tare', () => {
    it('reads zero after Tare and then the sphere alone, and compares with 2A', async () => {
      const user = setup()
      await chooseTask(user, /2A/)
      await user.click(button(/power/i))
      await user.click(item(/^weigh boat/i))
      await user.click(button(/record weigh boat$/i))
      await user.click(item(/^sphere/i))
      await user.click(button(/record weigh boat \+ sphere/i))

      await chooseTask(user, /2B/)
      // Continuity with the bench: the sphere is still in the boat from 2A.
      await user.click(item(/^sphere/i))
      await user.click(button(/record weigh boat alone/i))
      await user.click(button(/^tare$/i))
      expect(display()).toHaveTextContent('0.00 g')
      await user.click(button(/record after tare/i))
      await user.click(item(/^sphere/i))
      expect(display()).toHaveTextContent('5.13 g')
      await user.click(button(/record sphere in the tared boat/i))

      await user.click(button(/reveal/i))
      expect(screen.getByText(/slightly different/i)).toBeVisible()
      expect(screen.getByText(/different — by 0\.01 g/)).toBeVisible()
    })

    it('lets the button say Zero when her balances do', () => {
      setup({ tareLabel: 'Zero' })

      expect(screen.getByRole('button', { name: /^zero$/i })).toBeVisible()
      expect(screen.queryByRole('button', { name: /^tare$/i })).not.toBeInTheDocument()
    })
  })

  describe('Task 3 — liquid in a cup', () => {
    it('refuses to pour into the cup while it is on the balance', async () => {
      const user = setup()
      await chooseTask(user, /task 3/i)
      await user.click(button(/power/i))
      await user.click(item(/^cup/i))

      await user.click(button(/pour into cup/i))

      expect(screen.getByRole('alert')).toHaveTextContent(
        /never pour into a container on the balance/i,
      )
      expect(display()).toHaveTextContent('8.21 g')
    })

    it('goes negative when the tared cup is lifted off, and explains why', async () => {
      const user = setup()
      await chooseTask(user, /task 3/i)
      await user.click(button(/power/i))
      await user.click(item(/^cup/i))
      await user.click(button(/^tare$/i))
      await user.click(item(/^cup/i))

      expect(display()).toHaveTextContent('-8.21 g')
      expect(screen.getByText(/still subtracting the tare/i)).toBeVisible()
    })

    it('reads the water alone once the cup comes back', async () => {
      const user = setup()
      await chooseTask(user, /task 3/i)
      await user.click(button(/power/i))
      await user.click(item(/^cup/i))
      await user.click(button(/^tare$/i))
      await user.click(item(/^cup/i))
      await user.click(button(/pour into cup/i))
      await user.click(item(/^cup/i))

      expect(display()).toHaveTextContent('10.00 g')
    })
  })

  describe('Task 4 — gas in a balloon', () => {
    it('reveals the mass of the air as the difference of two readings', async () => {
      const user = setup()
      await chooseTask(user, /task 4/i)
      await user.click(button(/power/i))
      await user.click(item(/^weigh boat/i))
      await user.click(item(/^empty balloon/i))
      expect(display()).toHaveTextContent('4.96 g')
      await user.click(button(/record weigh boat \+ empty balloon/i))
      await user.click(item(/^empty balloon/i))
      await user.click(item(/^inflated balloon/i))
      expect(display()).toHaveTextContent('5.34 g')
      await user.click(button(/record weigh boat \+ balloon \+ air/i))

      await user.click(button(/reveal/i))
      expect(screen.getByText(/5\.34 g − 4\.96 g/)).toBeVisible()
      expect(screen.getByText(/= 0\.38 g/)).toBeVisible()
    })
  })

  describe('Task 5 — metric is amazing', () => {
    it('adds the birthdays into a volume, and that volume of water masses the same number', async () => {
      const user = setup()
      await chooseTask(user, /task 5/i)

      const dates = screen.getAllByRole('textbox', { name: /day of the month/i })
      expect(dates).toHaveLength(4)
      for (const [index, value] of ['3', '14', '25', '31'].entries()) {
        await user.clear(dates[index])
        await user.type(dates[index], value)
      }
      expect(screen.getByText(/73 mL/)).toBeVisible()

      await user.click(button(/power/i))
      await user.click(item(/^cup/i))
      await user.click(button(/^tare$/i))
      await user.click(item(/^cup/i))
      await user.click(button(/pour into cup/i))
      await user.click(item(/^cup/i))
      expect(display()).toHaveTextContent('73.00 g')
      await user.click(button(/record volume/i))
      await user.click(button(/record mass of water/i))

      await user.click(button(/reveal/i))
      expect(screen.getByText(/73 mL of water massed 73\.00 g/i)).toBeVisible()
    })
  })

  describe('options', () => {
    it('reads to one decimal place on a one-decimal balance', async () => {
      const user = setup({ decimals: 1 })
      await user.click(button(/power/i))
      await user.click(item(/^weigh boat/i))

      expect(display()).toHaveTextContent('2.3 g')
    })

    it('falls back to the defaults when config holds nonsense', async () => {
      const user = setup({ decimals: 'lots', tareLabel: 7, waterDensity: 'wet' })
      await user.click(button(/power/i))

      expect(display()).toHaveTextContent('0.00 g')
      expect(button(/^tare$/i)).toBeVisible()
    })
  })

  describe('reset and new problem', () => {
    it('reset powers off, clears the bench and forgets the records', async () => {
      const user = setup()
      await chooseTask(user, /2A/)
      await user.click(button(/power/i))
      await user.click(item(/^weigh boat/i))
      await user.click(button(/record weigh boat$/i))

      await user.click(button(/^reset$/i))

      expect(display()).toHaveTextContent('')
      expect(item(/^weigh boat/i)).toHaveAttribute('aria-pressed', 'false')
      const table = screen.getByRole('table', { name: /record/i })
      expect(within(table).queryByText('2.35 g')).not.toBeInTheDocument()
    })

    it('new problem changes the masses, so a rehearsed answer cannot be reused', async () => {
      const user = setup()
      await user.click(button(/new problem/i))
      await user.click(button(/power/i))
      await user.click(item(/^weigh boat/i))

      // Anything but the worked example's 2.35, and still a light boat.
      const text = display().textContent ?? ''
      const value = Number.parseFloat(text)
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThanOrEqual(3)
    })
  })

  it('says where every item is, so the picture is never the only clue', async () => {
    const user = setup()

    expect(item(/^weigh boat/i)).toHaveAccessibleName(/on the bench/i)
    await user.click(item(/^weigh boat/i))
    expect(item(/^weigh boat/i)).toHaveAccessibleName(/on the balance/i)
    expect(item(/^weigh boat/i)).toHaveAttribute('aria-pressed', 'true')
  })
})
