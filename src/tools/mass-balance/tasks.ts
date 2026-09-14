import { ITEMS, roundTo, type BalanceState, type ItemId } from '@/core/balance'

/**
 * The lab's tasks, as the page runs them. Steps are the lab's own words,
 * lightly trimmed to fit a screen; the source is
 * reference/labs/LAB Measuring Mass Inquiry.md.
 */

export type TaskId = 'sandbox' | '2a' | '2b' | '3' | '4' | '5'

export interface Blank {
  /** Stable key into the record table. Records outlive task switches: 2B needs 2A's. */
  id: string
  /** The worksheet's wording for the blank. */
  label: string
  /** What "Record" captures — the balance display, or the cylinder's volume. */
  source: 'readout' | 'cylinder'
  /**
   * Why the reading cannot be taken yet, or null when the balance holds what
   * the blank describes. Record is a forced wait: it stays disabled, with this
   * reason beside it, until the bench matches the step — so "weigh boat" can
   * never be recorded with the boat still on the bench.
   */
  ready: (state: BalanceState) => string | null
}

/** Numbers recorded so far, by blank id. Readings in grams; volumes in mL. */
export type Records = Partial<Record<string, number>>

/**
 * Something the teacher just did on the page. Steps watch these so the
 * marker can move on by itself when a step's action is taken.
 */
export type Action =
  | { type: 'power' }
  | { type: 'tare' }
  | { type: 'place'; item: ItemId }
  | { type: 'remove'; item: ItemId }
  | { type: 'pour' }
  | { type: 'empty' }
  | { type: 'record'; blank: string }

export interface Step {
  /** The lab's wording. */
  text: string
  /** The blank this step fills in, if it says "Record". Its button sits on the step. */
  record?: string
  /**
   * True when this action, taken from this state, completes the step. A step
   * without one — "measure out 10 mL", "compare with Task 2A" — cannot be
   * detected on the page; the marker rests on it until a later step's action
   * is taken or she presses Next. Only such steps are ever skipped over: a
   * step with a condition must be met, so pressing Tare twice cannot jump
   * ahead to the next Tare step.
   */
  advance?: (action: Action, state: BalanceState) => boolean
}

/** The first reason from the list that applies, or null when all is well. */
const firstOf =
  (...checks: ((state: BalanceState) => string | null)[]) =>
  (state: BalanceState) => {
    for (const check of checks) {
      const reason = check(state)
      if (reason) return reason
    }
    return null
  }
const named = (item: ItemId) => ITEMS[item].name.toLowerCase()
const on = (item: ItemId) => (state: BalanceState) =>
  state.onBalance.includes(item) ? null : `Put the ${named(item)} on the balance first.`
const notOn = (item: ItemId) => (state: BalanceState) =>
  state.onBalance.includes(item)
    ? `Take the ${named(item)} off the balance first.`
    : null
/** Tare must have been pressed with exactly these items on the pan. */
const taredWith =
  (...items: ItemId[]) =>
  (state: BalanceState) => {
    const expected = items.reduce((sum, item) => sum + state.masses[item], 0)
    return Math.abs(state.tareOffset - expected) < 0.0005 ? null : 'Press Tare first.'
  }
const cupEmpty = (state: BalanceState) =>
  state.waterVolume === 0 ? null : 'Empty the cup first.'
const cupHasWater = (state: BalanceState) =>
  state.waterVolume > 0 ? null : 'Pour the water into the cup first.'

const recorded = (blank: string) => (action: Action) =>
  action.type === 'record' && action.blank === blank
const pressed = (type: Action['type']) => (action: Action) => action.type === type
const off = (state: BalanceState, ...items: ItemId[]) =>
  items.every((item) => !state.onBalance.includes(item))

export interface Task {
  id: TaskId
  /** Short, for the picker. */
  title: string
  /** Items on the bench for this task. Anything already on the balance stays visible too. */
  items: ItemId[]
  /** Whether the graduated cylinder and pour controls are shown. */
  usesCylinder: boolean
  /** Whether the four birthday fields drive the cylinder volume (Task 5). */
  usesDates: boolean
  steps: Step[]
  blanks: Blank[]
  /**
   * The calculation the worksheet asks for, with recorded numbers substituted
   * in — or null while a blank is still empty. Lines are shown one per row
   * behind the reveal gate. Everything is at the balance's precision: never
   * more digits than the balance gave.
   */
  worked: (records: Records, decimals: number) => string[] | null
}

const g = (value: number, decimals: number) => `${value.toFixed(decimals)} g`

export const TASKS: Task[] = [
  {
    id: '2a',
    title: 'Task 2A · Solid by subtraction',
    items: ['weigh-boat', 'sphere'],
    usesCylinder: false,
    usesDates: false,
    steps: [
      {
        text: 'Press Power. Wait until the numbers say zero.',
        advance: (action, state) => action.type === 'power' && state.powered,
      },
      {
        text: 'Place the weigh boat on the balance GENTLY. Record the mass.',
        record: '2a-boat',
        advance: recorded('2a-boat'),
      },
      {
        text: 'Place the sphere in the weigh boat. Record the mass — write exactly what the balance tells you.',
        record: '2a-both',
        advance: recorded('2a-both'),
      },
      {
        text: 'This is the mass of both the sphere and the weigh boat. To get the mass of just the sphere, subtract.',
      },
    ],
    blanks: [
      {
        id: '2a-boat',
        label: 'Weigh boat',
        source: 'readout',
        ready: firstOf(on('weigh-boat'), notOn('sphere')),
      },
      {
        id: '2a-both',
        label: 'Weigh boat + sphere',
        source: 'readout',
        ready: firstOf(on('weigh-boat'), on('sphere')),
      },
    ],
    worked: (records, decimals) => {
      const boat = records['2a-boat']
      const both = records['2a-both']
      if (boat === undefined || both === undefined) return null
      return [
        'Mass = (weigh boat + sphere) − (weigh boat)',
        `= ${g(both, decimals)} − ${g(boat, decimals)}`,
        `= ${g(roundTo(both - boat, decimals), decimals)}`,
      ]
    },
  },
  {
    id: '2b',
    title: 'Task 2B · Solid by Tare',
    items: ['weigh-boat', 'sphere'],
    usesCylinder: false,
    usesDates: false,
    steps: [
      {
        text: 'Take the sphere OUT of the weigh boat. Leave the weigh boat on the balance. Record the mass.',
        record: '2b-boat',
        advance: recorded('2b-boat'),
      },
      {
        text: 'Press Tare. Record the number on the balance.',
        record: '2b-tared',
        advance: recorded('2b-tared'),
      },
      {
        text: 'The balance has removed the mass of the weigh boat. Now add the sphere to the weigh boat. Record the number on the balance.',
        record: '2b-sphere',
        advance: recorded('2b-sphere'),
      },
      {
        text: 'Compare this number to the number you got in Task 2A. Which method did you find easier? Why?',
      },
    ],
    blanks: [
      {
        id: '2b-boat',
        label: 'Weigh boat alone',
        source: 'readout',
        ready: firstOf(on('weigh-boat'), notOn('sphere')),
      },
      {
        id: '2b-tared',
        label: 'After Tare',
        source: 'readout',
        ready: firstOf(on('weigh-boat'), notOn('sphere'), taredWith('weigh-boat')),
      },
      {
        id: '2b-sphere',
        label: 'Sphere in the tared boat',
        source: 'readout',
        ready: firstOf(on('weigh-boat'), on('sphere'), taredWith('weigh-boat')),
      },
    ],
    worked: (records, decimals) => {
      const byTare = records['2b-sphere']
      if (records['2b-boat'] === undefined || records['2b-tared'] === undefined)
        return null
      if (byTare === undefined) return null

      const boat = records['2a-boat']
      const both = records['2a-both']
      if (boat === undefined || both === undefined) {
        return [
          `Sphere by Tare: ${g(byTare, decimals)}`,
          'Task 2A has not been recorded yet, so there is nothing to compare with.',
        ]
      }

      const bySubtraction = roundTo(both - boat, decimals)
      const gap = roundTo(Math.abs(byTare - bySubtraction), decimals)
      const lines = [
        `Sphere by Tare: ${g(byTare, decimals)}`,
        `Sphere by subtraction (Task 2A): ${g(bySubtraction, decimals)}`,
      ]
      if (gap === 0) {
        lines.push('My numbers were the same for both.')
      } else {
        const step = (10 ** -decimals).toFixed(decimals)
        lines.push(
          `My numbers were slightly different — by ${g(gap, decimals)}.`,
          `The balance rounds every reading to the nearest ${step} g, so subtracting two rounded readings can land one step away from a single tared reading. Both are right to the balance's precision.`,
        )
      }
      return lines
    },
  },
  {
    id: '3',
    title: 'Task 3 · Liquid in a cup',
    items: ['weigh-boat', 'sphere', 'cup'],
    usesCylinder: true,
    usesDates: false,
    steps: [
      {
        text: 'Remove the weigh boat and sphere from the balance.',
        // A state, not an action: if the pan is already clear, the step is done.
        advance: (_, state) => off(state, 'weigh-boat', 'sphere'),
      },
      { text: 'Press Tare and wait until it reads zero.', advance: pressed('tare') },
      {
        text: 'Place the empty cup on the balance. Record the mass.',
        record: '3-cup',
        advance: recorded('3-cup'),
      },
      { text: 'Press Tare and wait until it says zero.', advance: pressed('tare') },
      {
        text: 'Take the cup OFF the balance. Do not press any buttons!',
        advance: (action) => action.type === 'remove' && action.item === 'cup',
      },
      // The worksheet lists "measure out 10 mL" before "place the empty cup",
      // but the balance is used the other way round: cup on, record, tare,
      // cup off, and only then measure and pour. Reordered on the page
      // (2026-09-13) so the marker follows what her hands actually do.
      { text: 'Measure out 10 mL of water in the graduated cylinder.' },
      {
        text: 'Pour the water into the cup while the cup is on the bench. NEVER pour into a container on the balance.',
        advance: pressed('pour'),
      },
      {
        text: 'Place the cup back on the balance. Record the mass.',
        record: '3-water',
        advance: recorded('3-water'),
      },
      { text: 'Pour the water back out and rinse the cup.', advance: pressed('empty') },
    ],
    blanks: [
      {
        id: '3-cup',
        label: 'Empty cup',
        source: 'readout',
        ready: firstOf(notOn('weigh-boat'), on('cup'), cupEmpty),
      },
      {
        id: '3-water',
        label: 'Water in the tared cup',
        source: 'readout',
        ready: firstOf(on('cup'), cupHasWater, taredWith('cup')),
      },
    ],
    worked: (records, decimals) => {
      const cup = records['3-cup']
      const water = records['3-water']
      if (cup === undefined || water === undefined) return null
      return [
        `Mass of the cup: ${g(cup, decimals)}`,
        `Mass of the water: ${g(water, decimals)}`,
        'The balance did the subtraction: Tare removed the cup, so the reading with the cup back on is the water alone.',
      ]
    },
  },
  {
    id: '4',
    title: 'Task 4 · Gas in a balloon',
    items: ['weigh-boat', 'empty-balloon', 'inflated-balloon'],
    usesCylinder: false,
    usesDates: false,
    steps: [
      {
        text: 'Take everything off the balance. Then press Tare.',
        advance: (action, state) =>
          action.type === 'tare' && state.onBalance.length === 0,
      },
      {
        text: 'Place the weigh boat on the balance, then place the empty balloon in the weigh boat. Record the mass.',
        record: '4-empty',
        advance: recorded('4-empty'),
      },
      {
        text: 'Remove the empty balloon and place the inflated balloon in the weigh boat. Record the mass.',
        record: '4-inflated',
        advance: recorded('4-inflated'),
      },
      {
        text: 'Now calculate the mass of the air in the balloon by subtracting the two masses.',
      },
    ],
    blanks: [
      {
        id: '4-empty',
        label: 'Weigh boat + empty balloon',
        source: 'readout',
        ready: firstOf(
          on('weigh-boat'),
          on('empty-balloon'),
          notOn('inflated-balloon'),
        ),
      },
      {
        id: '4-inflated',
        label: 'Weigh boat + balloon + air',
        source: 'readout',
        ready: firstOf(
          on('weigh-boat'),
          on('inflated-balloon'),
          notOn('empty-balloon'),
        ),
      },
    ],
    worked: (records, decimals) => {
      const empty = records['4-empty']
      const inflated = records['4-inflated']
      if (empty === undefined || inflated === undefined) return null
      return [
        'Mass of gas = (weigh boat + balloon + air) − (weigh boat + empty balloon)',
        `= ${g(inflated, decimals)} − ${g(empty, decimals)}`,
        `= ${g(roundTo(inflated - empty, decimals), decimals)}`,
      ]
    },
  },
  {
    id: '5',
    title: 'Task 5 · Metric is amazing',
    items: ['cup'],
    usesCylinder: true,
    usesDates: true,
    steps: [
      {
        text: '1 mL of pure water = 1 g of pure water. Pure water is the only substance you can directly convert between mass and volume. Test it out.',
      },
      {
        text: 'Enter the day of the month each person in the group was born on. Add them up — that is the volume of water to measure.',
      },
      {
        text: 'Place the empty cup on the balance and press Tare.',
        advance: (action, state) =>
          action.type === 'tare' && state.onBalance.includes('cup'),
      },
      {
        text: 'Take the cup off. Pour the measured volume of water into the cup on the bench. Record the volume.',
        record: '5-volume',
        advance: recorded('5-volume'),
      },
      {
        text: 'Place the cup back on the balance. Record the mass.',
        record: '5-mass',
        advance: recorded('5-mass'),
      },
      { text: 'How close were the two measurements?' },
    ],
    blanks: [
      {
        id: '5-volume',
        label: 'Volume',
        source: 'cylinder',
        ready: firstOf(cupHasWater),
      },
      {
        id: '5-mass',
        label: 'Mass of water',
        source: 'readout',
        ready: firstOf(on('cup'), cupHasWater, taredWith('cup')),
      },
    ],
    worked: (records, decimals) => {
      const volume = records['5-volume']
      const mass = records['5-mass']
      if (volume === undefined || mass === undefined) return null
      const gap = roundTo(Math.abs(mass - volume), decimals)
      return [
        `${volume} mL of water massed ${g(mass, decimals)}.`,
        gap === 0
          ? 'The two measurements agree exactly: 1 mL of water is 1 g.'
          : `The two measurements differ by ${g(gap, decimals)}.`,
      ]
    },
  },
  {
    id: 'sandbox',
    title: 'Sandbox',
    items: ['weigh-boat', 'sphere', 'cup', 'empty-balloon', 'inflated-balloon'],
    usesCylinder: true,
    usesDates: false,
    steps: [
      {
        text: 'Anything goes. Use it to act out Task 6: how would you mass a pencil, or the soda inside an unopened can?',
      },
    ],
    blanks: [],
    worked: () => null,
  },
]

export function findTask(id: TaskId): Task {
  const task = TASKS.find((candidate) => candidate.id === id)
  if (!task) throw new Error(`Unknown task: ${id}`)
  return task
}
