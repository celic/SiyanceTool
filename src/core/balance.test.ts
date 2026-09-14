import { describe, expect, it } from 'vitest'

import {
  createBalance,
  emptyCup,
  ITEMS,
  massOfWater,
  place,
  pour,
  randomize,
  reading,
  readout,
  remove,
  reset,
  roundTo,
  tare,
  togglePower,
  type BalanceState,
} from '@/core/balance'

/**
 * True masses chosen so the lab's worked numbers fall out of them, and so the
 * subtraction method and the tare method disagree by one unit in the last
 * place — see the Task 2B tests. Held to three decimals like everything in the
 * model; the readout is where rounding happens.
 */
const MASSES = {
  'weigh-boat': 2.347,
  sphere: 5.126,
  cup: 8.214,
  'empty-balloon': 2.612,
  'inflated-balloon': 2.992,
}

function on(): BalanceState {
  return togglePower(createBalance({ masses: MASSES }))
}

/** Applies a move that the test expects to be legal, failing loudly if not. */
function must(result: ReturnType<typeof place>): BalanceState {
  if (!result.ok) throw new Error(`Expected a legal move, got: ${result.reason}`)
  return result.state
}

describe('rounding', () => {
  it('rounds to the balance precision, half away from zero', () => {
    expect(roundTo(2.345, 2)).toBe(2.35)
    expect(roundTo(2.344, 2)).toBe(2.34)
    expect(roundTo(-2.345, 2)).toBe(-2.35)
    expect(roundTo(7.45, 1)).toBe(7.5)
  })

  it('never produces negative zero, which a balance would show as -0.00', () => {
    expect(Object.is(roundTo(-0.001, 2), -0)).toBe(false)
    expect(roundTo(-0.001, 2)).toBe(0)
  })

  it('cleans up floating point residue from subtracting two readings', () => {
    // 7.47 - 2.35 is 5.1199999999999992 in binary floating point.
    expect(roundTo(7.47 - 2.35, 2)).toBe(5.12)
  })
})

describe('power', () => {
  it('starts off and shows nothing at all, like an unplugged balance', () => {
    const balance = createBalance({ masses: MASSES })

    expect(balance.powered).toBe(false)
    expect(reading(balance)).toBeNull()
    expect(readout(balance)).toBe('')
  })

  it('reads zero after powering on, whatever is already on the pan', () => {
    // Task 1 step 3: "Press and release. Wait until the numbers say zero."
    let balance = createBalance({ masses: MASSES })
    balance = must(place(balance, 'weigh-boat'))
    balance = togglePower(balance)

    expect(readout(balance)).toBe('0.00')
  })

  it('forgets its tare when powered off and on again', () => {
    let balance = must(place(on(), 'weigh-boat'))
    balance = tare(balance)
    balance = must(place(balance, 'sphere'))
    balance = togglePower(togglePower(balance))

    // Fresh zero on power-up, taken with the boat and sphere both on the pan.
    expect(readout(balance)).toBe('0.00')
  })

  it('ignores tare while powered off', () => {
    const balance = createBalance({ masses: MASSES })

    expect(tare(balance)).toBe(balance)
  })
})

describe('Task 2A — massing a solid by subtraction', () => {
  it('reads the weigh boat alone', () => {
    const balance = must(place(on(), 'weigh-boat'))

    expect(readout(balance)).toBe('2.35')
  })

  it('reads the weigh boat and the sphere together', () => {
    let balance = must(place(on(), 'weigh-boat'))
    balance = must(place(balance, 'sphere'))

    expect(readout(balance)).toBe('7.47')
  })

  it('gives 7.47 − 2.35 = 5.12 for the sphere', () => {
    expect(roundTo(7.47 - 2.35, 2)).toBe(5.12)
  })
})

describe('Task 2B — massing a solid with Tare', () => {
  it('reads 0.00 after taring the weigh boat', () => {
    let balance = must(place(on(), 'weigh-boat'))
    balance = tare(balance)

    expect(readout(balance)).toBe('0.00')
  })

  it('then reads the sphere alone when it is added', () => {
    let balance = must(place(on(), 'weigh-boat'))
    balance = tare(balance)
    balance = must(place(balance, 'sphere'))

    // 5.126 rounds to 5.13 — one unit in the last place off Task 2A's 5.12.
    // That is the lab's "my numbers were slightly different", and it comes
    // from rounding alone: the model holds the true mass and rounds only
    // on the readout.
    expect(readout(balance)).toBe('5.13')
  })
})

describe('Task 3 — massing a liquid in a cup', () => {
  it('goes negative when a tared cup is lifted off, and says so honestly', () => {
    // Step 6: "Take the cup OFF the balance. Do not press any buttons!"
    let balance = must(place(on(), 'cup'))
    balance = tare(balance)
    balance = must(remove(balance, 'cup'))

    expect(readout(balance)).toBe('-8.21')
  })

  it('refuses to pour into the cup while it is on the balance', () => {
    const balance = must(place(on(), 'cup'))

    const result = pour(balance, 10)

    expect(result.ok).toBe(false)
    if (!result.ok)
      expect(result.reason).toMatch(/never pour into a container on the balance/i)
  })

  it('reads the water alone once the cup comes back', () => {
    let balance = must(place(on(), 'cup'))
    balance = tare(balance)
    balance = must(remove(balance, 'cup'))
    balance = must(pour(balance, 10))
    balance = must(place(balance, 'cup'))

    expect(readout(balance)).toBe('10.00')
  })

  it('pours back out again so the cup can be reused', () => {
    let balance = must(pour(on(), 10))
    balance = must(emptyCup(balance))

    expect(balance.waterVolume).toBe(0)
  })

  it('refuses to pour out of the cup while it is on the balance, for the same reason', () => {
    let balance = must(pour(on(), 10))
    balance = must(place(balance, 'cup'))

    const result = emptyCup(balance)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toMatch(/take the cup off/i)
  })

  it('refuses to pour nothing', () => {
    expect(pour(on(), 0).ok).toBe(false)
    expect(pour(on(), -5).ok).toBe(false)
  })
})

describe('Task 4 — massing a gas in a balloon', () => {
  it('reads the weigh boat and the empty balloon', () => {
    let balance = must(place(on(), 'weigh-boat'))
    balance = must(place(balance, 'empty-balloon'))

    expect(readout(balance)).toBe('4.96')
  })

  it('reads a little more with the inflated balloon in its place', () => {
    let balance = must(place(on(), 'weigh-boat'))
    balance = must(place(balance, 'empty-balloon'))
    balance = must(remove(balance, 'empty-balloon'))
    balance = must(place(balance, 'inflated-balloon'))

    expect(readout(balance)).toBe('5.34')
    // A balance reads only the excess over the room air the balloon displaces,
    // so the gas comes out as a few tenths of a gram, not the true mass of
    // the air inside. docs/tools.md, "The balloon".
    expect(roundTo(5.34 - 4.96, 2)).toBe(0.38)
  })
})

describe('Task 5 — metric is amazing', () => {
  it('masses water at exactly 1 g per mL by default', () => {
    expect(massOfWater(73)).toBe(73)

    let balance = must(place(on(), 'cup'))
    balance = tare(balance)
    balance = must(remove(balance, 'cup'))
    balance = must(pour(balance, 73))
    balance = must(place(balance, 'cup'))

    expect(readout(balance)).toBe('73.00')
  })

  it('can use a realistic density instead, when the classroom wants the truth', () => {
    expect(massOfWater(100, 0.998)).toBe(99.8)

    const balance = must(place(must(pour(on(), 100)), 'cup'))
    const realistic = { ...balance, waterDensity: 0.998 }

    expect(reading(realistic)).toBe(roundTo(8.214 + 99.8, 2))
  })
})

describe('containment', () => {
  it('needs the weigh boat on the balance before the sphere goes in it', () => {
    const result = place(on(), 'sphere')

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toMatch(/weigh boat/i)
  })

  it('takes the contents with it when the weigh boat is lifted off', () => {
    // Task 3 step 1: "Remove the weighboat and sphere from the balance."
    let balance = must(place(on(), 'weigh-boat'))
    balance = must(place(balance, 'sphere'))
    balance = must(remove(balance, 'weigh-boat'))

    expect(balance.onBalance).toEqual([])
    expect(readout(balance)).toBe('0.00')
  })

  it('treats placing or removing something already there as a no-op', () => {
    const balance = must(place(on(), 'cup'))

    expect(must(place(balance, 'cup')).onBalance).toEqual(['cup'])
    expect(must(remove(balance, 'weigh-boat')).onBalance).toEqual(['cup'])
  })

  it('names every item and says where each one sits', () => {
    expect(ITEMS['weigh-boat'].holder).toBe('pan')
    expect(ITEMS.cup.holder).toBe('pan')
    expect(ITEMS.sphere.holder).toBe('weigh-boat')
    expect(ITEMS['empty-balloon'].holder).toBe('weigh-boat')
    expect(ITEMS['inflated-balloon'].holder).toBe('weigh-boat')
    expect(ITEMS.pencil.holder).toBe('pan')
    for (const item of Object.values(ITEMS)) expect(item.name).not.toBe('')
  })

  it('describes every item, so a student can answer "describe 3 properties of your sphere"', () => {
    expect(ITEMS.sphere.description).toMatch(/glass marble/i)
    for (const item of Object.values(ITEMS))
      expect(item.description.length).toBeGreaterThan(20)
  })

  it('has a pencil for Task 6, about the mass of a real wooden one', () => {
    let balance = must(place(on(), 'pencil'))

    expect(balance.masses.pencil).toBeGreaterThan(4)
    expect(balance.masses.pencil).toBeLessThan(9)
    expect(readout(balance)).toBe(ITEMS.pencil.nominal.toFixed(2))
    balance = randomize(balance, () => 0.999999)
    expect(balance.masses.pencil).toBeGreaterThan(ITEMS.pencil.nominal)
  })
})

describe('precision', () => {
  it('reads to one decimal place when configured for a one-decimal balance', () => {
    let balance = togglePower(createBalance({ masses: MASSES, decimals: 1 }))
    balance = must(place(balance, 'weigh-boat'))
    balance = must(place(balance, 'sphere'))

    expect(readout(balance)).toBe('7.5')
  })
})

describe('reset and new problem', () => {
  it('reset clears the pan, empties the cup, and powers off, keeping the masses', () => {
    let balance = must(place(on(), 'weigh-boat'))
    balance = tare(balance)
    balance = must(pour(balance, 10))
    balance = reset(balance)

    expect(balance.powered).toBe(false)
    expect(balance.onBalance).toEqual([])
    expect(balance.waterVolume).toBe(0)
    expect(balance.tareOffset).toBe(0)
    expect(balance.masses).toMatchObject(MASSES)
  })

  it('new problem re-rolls every mass within a small spread of its usual value', () => {
    const lowest = randomize(createBalance(), () => 0)
    const highest = randomize(createBalance(), () => 0.999999)
    const middle = randomize(createBalance(), () => 0.5)

    for (const id of Object.keys(ITEMS) as (keyof typeof ITEMS)[]) {
      const { nominal, spread } = ITEMS[id]
      expect(lowest.masses[id]).toBeLessThan(highest.masses[id])
      expect(lowest.masses[id]).toBeGreaterThanOrEqual(roundTo(nominal - spread, 3))
      expect(highest.masses[id]).toBeLessThanOrEqual(roundTo(nominal + spread, 3))
      expect(middle.masses[id]).toBeCloseTo(nominal, 2)
      // Small: a re-rolled sphere is still recognisably the same sphere.
      expect(spread).toBeLessThanOrEqual(nominal / 4)
    }

    // The usual values are the ones the lab's worked numbers come from.
    for (const id of Object.keys(ITEMS) as (keyof typeof ITEMS)[]) {
      expect(createBalance().masses[id]).toBe(ITEMS[id].nominal)
    }

    // The boat is light; the cup is heavier. "Is it LIGHT or Heavy?"
    expect(highest.masses['weigh-boat']).toBeLessThan(lowest.masses.cup)
    // An inflated balloon always reads a little more than an empty one, but
    // never by as much as the air inside actually masses.
    for (const rolled of [lowest, highest]) {
      const excess = rolled.masses['inflated-balloon'] - rolled.masses['empty-balloon']
      expect(excess).toBeGreaterThan(0)
      expect(excess).toBeLessThan(1)
    }
  })

  it('rolls masses to three decimals, so rounding stays honest', () => {
    const rolled = randomize(createBalance(), () => 0.123456789)

    for (const mass of Object.values(rolled.masses)) {
      expect(mass).toBe(roundTo(mass, 3))
    }
  })

  it('new problem clears the pan, since the old readings no longer apply', () => {
    let balance = must(place(on(), 'weigh-boat'))
    balance = randomize(balance)

    expect(balance.onBalance).toEqual([])
    expect(balance.tareOffset).toBe(0)
  })
})
