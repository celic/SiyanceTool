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
  /**
   * The item's usual mass in grams, to three decimals. These are the values the
   * lab's worked numbers come from (see balance.test.ts), and a fresh balance
   * starts with them.
   */
  nominal: number
  /**
   * How far "New problem" may wander from the nominal, in grams, either way.
   * Kept small — a quarter of the nominal at most — so a re-rolled sphere is
   * still recognisably the same marble and the class's numbers stay close to
   * the worked example, while no two problems share an answer.
   */
  spread: number
}

/**
 * How much more an inflated balloon reads than the same balloon empty, in
 * grams. This is what the balance *reads*, not what the air inside masses: a
 * balloon displaces its own volume of room air, so buoyancy cancels all but
 * the excess from its overpressure — a few tenths of a gram. The tool must
 * agree with the real bench, not with the true mass (docs/tools.md, "The
 * balloon"; the range wants checking against her balloons, questions.md #34).
 */
const BALLOON_EXCESS = { nominal: 0.38, spread: 0.12 }

const EMPTY_BALLOON = { nominal: 2.612, spread: 0.3 }

export const ITEMS: Record<ItemId, ItemDefinition> = {
  // "Find the weighboat. Is it LIGHT or Heavy?" — a plastic one is a gram or two.
  'weigh-boat': { name: 'Weigh boat', holder: 'pan', nominal: 2.347, spread: 0.4 },
  // A glass marble.
  sphere: { name: 'Sphere', holder: 'weigh-boat', nominal: 5.126, spread: 0.6 },
  cup: { name: 'Cup', holder: 'pan', nominal: 8.214, spread: 1.2 },
  'empty-balloon': { name: 'Empty balloon', holder: 'weigh-boat', ...EMPTY_BALLOON },
  // Rolled as the empty balloon plus the excess, so the excess stays a few
  // tenths of a gram whatever the balloon itself rolled. Its spread is
  // therefore the sum of the two.
  'inflated-balloon': {
    name: 'Inflated balloon',
    holder: 'weigh-boat',
    nominal: roundTo(EMPTY_BALLOON.nominal + BALLOON_EXCESS.nominal, 3),
    spread: EMPTY_BALLOON.spread + BALLOON_EXCESS.spread,
  },
}

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

/** Every item at its nominal mass. */
export const DEFAULT_MASSES: Record<ItemId, number> = Object.fromEntries(
  Object.entries(ITEMS).map(([id, item]) => [id, item.nominal]),
) as Record<ItemId, number>

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
 * New problem: re-roll every mass within a small spread of its nominal value.
 *
 * Takes the random source as a parameter so tests can pin it. Clears the
 * pan, since readings taken with the old masses no longer mean anything.
 */
export function randomize(
  state: BalanceState,
  random: () => number = Math.random,
): BalanceState {
  const around = ({ nominal, spread }: { nominal: number; spread: number }) =>
    roundTo(nominal + (random() * 2 - 1) * spread, INTERNAL_DECIMALS)

  const emptyBalloon = around(ITEMS['empty-balloon'])

  const masses: Record<ItemId, number> = {
    'weigh-boat': around(ITEMS['weigh-boat']),
    sphere: around(ITEMS.sphere),
    cup: around(ITEMS.cup),
    'empty-balloon': emptyBalloon,
    'inflated-balloon': roundTo(
      emptyBalloon + around(BALLOON_EXCESS),
      INTERNAL_DECIMALS,
    ),
  }

  return { ...reset(state), masses }
}
