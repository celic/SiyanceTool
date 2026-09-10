import { roundTo, type ItemId } from '@/core/balance'

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
}

/** Numbers recorded so far, by blank id. Readings in grams; volumes in mL. */
export type Records = Partial<Record<string, number>>

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
  steps: string[]
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
    id: 'sandbox',
    title: 'Sandbox',
    items: ['weigh-boat', 'sphere', 'cup', 'empty-balloon', 'inflated-balloon'],
    usesCylinder: true,
    usesDates: false,
    steps: [
      'Anything goes. Use it to act out Task 6: how would you mass a pencil, or the soda inside an unopened can?',
    ],
    blanks: [],
    worked: () => null,
  },
  {
    id: '2a',
    title: '2A · Solid by subtraction',
    items: ['weigh-boat', 'sphere'],
    usesCylinder: false,
    usesDates: false,
    steps: [
      'Press Power. Wait until the numbers say zero.',
      'Place the weigh boat on the balance GENTLY. Record the mass.',
      'Place the sphere in the weigh boat. Record the mass — write exactly what the balance tells you.',
      'This is the mass of both the sphere and the weigh boat. To get the mass of just the sphere, subtract.',
    ],
    blanks: [
      { id: '2a-boat', label: 'Weigh boat', source: 'readout' },
      { id: '2a-both', label: 'Weigh boat + sphere', source: 'readout' },
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
    title: '2B · Solid by Tare',
    items: ['weigh-boat', 'sphere'],
    usesCylinder: false,
    usesDates: false,
    steps: [
      'Take the sphere OUT of the weigh boat. Leave the weigh boat on the balance. Record the mass.',
      'Press Tare. Record the number on the balance.',
      'The balance has removed the mass of the weigh boat. Now add the sphere to the weigh boat. Record the number on the balance.',
      'Compare this number to the number you got in Task 2A. Which method did you find easier? Why?',
    ],
    blanks: [
      { id: '2b-boat', label: 'Weigh boat alone', source: 'readout' },
      { id: '2b-tared', label: 'After Tare', source: 'readout' },
      { id: '2b-sphere', label: 'Sphere in the tared boat', source: 'readout' },
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
      'Remove the weigh boat and sphere from the balance.',
      'Press Tare and wait until it reads zero.',
      'Measure out 10 mL of water in the graduated cylinder.',
      'Place the empty cup on the balance. Record the mass.',
      'Press Tare and wait until it says zero.',
      'Take the cup OFF the balance. Do not press any buttons!',
      'Pour the water into the cup while the cup is on the bench. NEVER pour into a container on the balance.',
      'Place the cup back on the balance. Record the mass.',
      'Pour the water back out and rinse the cup.',
    ],
    blanks: [
      { id: '3-cup', label: 'Empty cup', source: 'readout' },
      { id: '3-water', label: 'Water in the tared cup', source: 'readout' },
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
      'Take everything off the balance. Then press Tare.',
      'Place the weigh boat on the balance, then place the empty balloon in the weigh boat. Record the mass.',
      'Remove the empty balloon and place the inflated balloon in the weigh boat. Record the mass.',
      'Now calculate the mass of the air in the balloon by subtracting the two masses.',
    ],
    blanks: [
      { id: '4-empty', label: 'Weigh boat + empty balloon', source: 'readout' },
      { id: '4-inflated', label: 'Weigh boat + balloon + air', source: 'readout' },
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
      '1 mL of pure water = 1 g of pure water. Pure water is the only substance you can directly convert between mass and volume. Test it out.',
      'Enter the day of the month each person in the group was born on. Add them up — that is the volume of water to measure.',
      'Place the empty cup on the balance and press Tare.',
      'Take the cup off. Pour the measured volume of water into the cup on the bench. Record the volume.',
      'Place the cup back on the balance. Record the mass.',
      'How close were the two measurements?',
    ],
    blanks: [
      { id: '5-volume', label: 'Volume', source: 'cylinder' },
      { id: '5-mass', label: 'Mass of water', source: 'readout' },
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
]

export function findTask(id: TaskId): Task {
  const task = TASKS.find((candidate) => candidate.id === id)
  if (!task) throw new Error(`Unknown task: ${id}`)
  return task
}
