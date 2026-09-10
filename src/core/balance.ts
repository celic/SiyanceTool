/**
 * A digital top-loading balance, as a pure model.
 *
 * Built for the `mass-balance` tool (docs/tools.md), which rehearses the
 * "Measuring Mass" lab in reference/labs/. Everything a real balance does in
 * that lab follows from one rule: the reading is the true load on the pan,
 * minus whatever the load was when Tare was last pressed, rounded to the
 * balance's precision. Tare is an offset, not magic — which is why lifting a
 * tared cup off shows a negative number, and why this model shows it too.
 *
 * Masses are held to three decimals and rounded only when read out, so two
 * readings subtracted can legitimately differ from one tared reading by a unit
 * in the last place. That is the discrepancy Task 2B of the lab asks about,
 * and it comes from rounding alone; no noise is added.
 *
 * No DOM, no React. State is immutable; every transition returns a new state.
 */

/** How many decimal places the readout shows. Classroom balances are one or the other. */
export type Decimals = 1 | 2

export type ItemId =
  'weigh-boat' | 'sphere' | 'cup' | 'empty-balloon' | 'inflated-balloon'

/** What an item sits on when it is on the balance. */
export type Holder = 'pan' | 'weigh-boat'

export interface ItemDefinition {
  name: string
  holder: Holder
  /** Realistic range for "New problem", in grams. */
  range: [min: number, max: number]
}

export const ITEMS: Record<ItemId, ItemDefinition> = {
  // "Find the weighboat. Is it LIGHT or Heavy?" — a plastic one is a gram or two.
  'weigh-boat': { name: 'Weigh boat', holder: 'pan', range: [1, 3] },
  // A glass marble is about 5 g; a steel ball bearing from the same basket, more.
  sphere: { name: 'Sphere', holder: 'weigh-boat', range: [4, 20] },
  cup: { name: 'Cup', holder: 'pan', range: [5, 15] },
  'empty-balloon': { name: 'Empty balloon', holder: 'weigh-boat', range: [2, 3.2] },
  // The range here is what the balance *reads*, not what the air inside masses.
  // A balloon displaces its own volume of room air, so buoyancy cancels all
  // but the excess from its overpressure — a few tenths of a gram. The tool
  // must agree with the real bench, not with the true mass. `randomize` fills
  // this in relative to the empty balloon; see BALLOON_EXCESS.
  'inflated-balloon': {
    name: 'Inflated balloon',
    holder: 'weigh-boat',
    range: [2.2, 3.8],
  },
}

/** How much more an inflated balloon reads than the same balloon empty, in grams. */
const BALLOON_EXCESS: [min: number, max: number] = [0.2, 0.6]

/** Held internally to this many decimals; readouts round from here. */
const INTERNAL_DECIMALS = 3

export interface BalanceState {
  powered: boolean
  decimals: Decimals
  /** The load at the last Tare (or power-on). The reading is load minus this. */
  tareOffset: number
  /** True masses in grams, to three decimals. */
  masses: Record<ItemId, number>
  /** Items on the balance, in the order placed. Items in the boat count as on it. */
  onBalance: ItemId[]
  /** Water in the cup, in mL. Water is only ever in the cup. */
  waterVolume: number
  /** Grams per mL. Exactly 1 by default, because that is what the lab teaches. */
  waterDensity: number
}

export interface BalanceOptions {
  decimals?: Decimals
  waterDensity?: number
  masses?: Partial<Record<ItemId, number>>
}

/** The lab's worked numbers fall out of these; see balance.test.ts. */
export const DEFAULT_MASSES: Record<ItemId, number> = {
  'weigh-boat': 2.347,
  sphere: 5.126,
  cup: 8.214,
  'empty-balloon': 2.612,
  'inflated-balloon': 2.992,
}

export type MoveResult =
  { ok: true; state: BalanceState } | { ok: false; reason: string }

/** Rounds half away from zero and never returns negative zero. */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  // The nudge pulls binary near-halves like 2.345 (really 2.34499…) up to the
  // half they were written as, so they round the way a person expects.
  const magnitude = Math.round((Math.abs(value) + 1e-9) * factor) / factor
  const signed = value < 0 ? -magnitude : magnitude
  return signed === 0 ? 0 : signed
}

export function massOfWater(volumeMl: number, density = 1): number {
  return roundTo(volumeMl * density, INTERNAL_DECIMALS)
}

export function createBalance(options: BalanceOptions = {}): BalanceState {
  return {
    powered: false,
    decimals: options.decimals ?? 2,
    tareOffset: 0,
    masses: { ...DEFAULT_MASSES, ...options.masses },
    onBalance: [],
    waterVolume: 0,
    waterDensity: options.waterDensity ?? 1,
  }
}

/** The true load on the pan, in grams. */
export function load(state: BalanceState): number {
  let total = 0
  for (const id of state.onBalance) total += state.masses[id]
  if (state.onBalance.includes('cup'))
    total += massOfWater(state.waterVolume, state.waterDensity)
  return roundTo(total, INTERNAL_DECIMALS)
}

/** What the display shows as a number, or null while powered off. */
export function reading(state: BalanceState): number | null {
  if (!state.powered) return null
  return roundTo(load(state) - state.tareOffset, state.decimals)
}

/** Exactly the text on the display: `-2.35`, `0.00`, or nothing while off. */
export function readout(state: BalanceState): string {
  const value = reading(state)
  return value === null ? '' : value.toFixed(state.decimals)
}

/**
 * Press the power button.
 *
 * A balance zeroes itself on power-up with whatever is already on the pan —
 * "wait until the numbers say zero" — so switching it off and on again is
 * also how a forgotten tare gets cleared.
 */
export function togglePower(state: BalanceState): BalanceState {
  if (state.powered) return { ...state, powered: false, tareOffset: 0 }
  return { ...state, powered: true, tareOffset: load(state) }
}

/** Press Tare (or Zero). Does nothing while the balance is off. */
export function tare(state: BalanceState): BalanceState {
  if (!state.powered) return state
  return { ...state, tareOffset: load(state) }
}

/** Put an item on the balance — on the pan, or in the weigh boat if that is where it goes. */
export function place(state: BalanceState, item: ItemId): MoveResult {
  if (state.onBalance.includes(item)) return { ok: true, state }

  const { holder, name } = ITEMS[item]
  if (holder === 'weigh-boat' && !state.onBalance.includes('weigh-boat')) {
    return {
      ok: false,
      reason: `The ${name.toLowerCase()} goes in the weigh boat. Put the weigh boat on the balance first.`,
    }
  }

  return { ok: true, state: { ...state, onBalance: [...state.onBalance, item] } }
}

/** Take an item off the balance. Lifting the weigh boat takes its contents with it. */
export function remove(state: BalanceState, item: ItemId): MoveResult {
  if (!state.onBalance.includes(item)) return { ok: true, state }

  const onBalance = state.onBalance.filter(
    (id) =>
      id !== item && !(item === 'weigh-boat' && ITEMS[id].holder === 'weigh-boat'),
  )

  return { ok: true, state: { ...state, onBalance } }
}

/**
 * Pour water from the graduated cylinder into the cup.
 *
 * Only while the cup is on the bench. The refusal is in the lab's own words,
 * because that sentence is the thing being taught.
 */
export function pour(state: BalanceState, volumeMl: number): MoveResult {
  if (state.onBalance.includes('cup')) {
    return { ok: false, reason: 'Never pour into a container on the balance.' }
  }
  if (!(volumeMl > 0)) {
    return {
      ok: false,
      reason: 'Measure out some water in the graduated cylinder first.',
    }
  }

  return { ok: true, state: { ...state, waterVolume: state.waterVolume + volumeMl } }
}

/** Pour the water back out of the cup. */
export function emptyCup(state: BalanceState): BalanceState {
  return { ...state, waterVolume: 0 }
}

/** Back to the start of the lab: pan empty, cup empty, balance off. Masses stay. */
export function reset(state: BalanceState): BalanceState {
  return { ...state, powered: false, tareOffset: 0, onBalance: [], waterVolume: 0 }
}

/**
 * New problem: re-roll every mass within its realistic range.
 *
 * Takes the random source as a parameter so tests can pin it. Clears the
 * pan, since readings taken with the old masses no longer mean anything.
 */
export function randomize(
  state: BalanceState,
  random: () => number = Math.random,
): BalanceState {
  const between = ([min, max]: [number, number]) =>
    roundTo(min + random() * (max - min), INTERNAL_DECIMALS)

  const emptyBalloon = between(ITEMS['empty-balloon'].range)

  const masses: Record<ItemId, number> = {
    'weigh-boat': between(ITEMS['weigh-boat'].range),
    sphere: between(ITEMS.sphere.range),
    cup: between(ITEMS.cup.range),
    'empty-balloon': emptyBalloon,
    'inflated-balloon': roundTo(
      emptyBalloon + between(BALLOON_EXCESS),
      INTERNAL_DECIMALS,
    ),
  }

  return { ...reset(state), masses }
}
