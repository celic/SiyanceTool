import { useState } from 'react'

import {
  createBalance,
  emptyCup,
  ITEMS,
  place,
  pour,
  randomize,
  reading,
  readout,
  remove,
  reset,
  tare,
  togglePower,
  type BalanceState,
  type ItemId,
  type MoveResult,
} from '@/core/balance'
import type { ToolProps } from '@/tools/registry'
import { BalanceFigure } from '@/tools/mass-balance/BalanceFigure'
import { readSettings } from '@/tools/mass-balance/options'
import {
  findTask,
  TASKS,
  type Blank,
  type Records,
  type TaskId,
} from '@/tools/mass-balance/tasks'
import { NumberField } from '@/ui/NumberField'
import { RevealAnswer } from '@/ui/RevealAnswer'
import { ToolShell } from '@/ui/ToolShell'
import '@/tools/mass-balance/MassBalance.css'

const ITEM_ORDER = Object.keys(ITEMS) as ItemId[]
const DEFAULT_VOLUME = 10
const DEFAULT_DATES = [1, 1, 1, 1]

/**
 * A simulated digital balance for rehearsing the "Measuring Mass" lab.
 *
 * The bench keeps continuity between tasks, as a real bench does: switching
 * from Task 2A to 2B leaves the sphere in the boat, because 2B's first step
 * is to take it out. Only Reset clears the balance. Readings recorded in one
 * task stay available to the next, because 2B compares against 2A.
 */
export function MassBalance({ options }: ToolProps) {
  const [settings] = useState(() => readSettings(options))
  const [balance, setBalance] = useState<BalanceState>(() =>
    createBalance({ decimals: settings.decimals, waterDensity: settings.waterDensity }),
  )
  const [taskId, setTaskId] = useState<TaskId>('sandbox')
  const [records, setRecords] = useState<Records>({})
  const [refusal, setRefusal] = useState<string | null>(null)
  const [volume, setVolume] = useState(DEFAULT_VOLUME)
  const [dates, setDates] = useState(DEFAULT_DATES)
  const [checked, setChecked] = useState<Partial<Record<TaskId, boolean[]>>>({})

  const task = findTask(taskId)
  const cylinderVolume = task.usesDates
    ? dates.reduce((sum, day) => sum + day, 0)
    : volume
  const value = reading(balance)
  const display = readout(balance)
  const benchItems = ITEM_ORDER.filter(
    (id) => task.items.includes(id) || balance.onBalance.includes(id),
  )
  const worked = task.worked(records, settings.decimals)
  const steps = checked[taskId] ?? task.steps.map(() => false)

  /** Applies a move, or shows why the balance refused it, in the lab's words. */
  function apply(result: MoveResult) {
    if (result.ok) {
      setBalance(result.state)
      setRefusal(null)
    } else {
      setRefusal(result.reason)
    }
  }

  function toggleItem(id: ItemId) {
    apply(balance.onBalance.includes(id) ? remove(balance, id) : place(balance, id))
  }

  function record(blank: Blank) {
    if (blank.source === 'cylinder') {
      setRecords({ ...records, [blank.id]: cylinderVolume })
      return
    }
    if (value === null) {
      setRefusal('Power on the balance first.')
      return
    }
    setRecords({ ...records, [blank.id]: value })
    setRefusal(null)
  }

  function handleReset() {
    setBalance(reset(balance))
    setRecords({})
    setRefusal(null)
    setVolume(DEFAULT_VOLUME)
    setDates(DEFAULT_DATES)
    setChecked({})
  }

  function handleRandomize() {
    setBalance(randomize(balance))
    setRecords({})
    setRefusal(null)
  }

  function toggleStep(index: number) {
    setChecked({
      ...checked,
      [taskId]: steps.map((done, i) => (i === index ? !done : done)),
    })
  }

  const controls = (
    <>
      <fieldset className="mass-balance__tasks">
        <legend>Task</legend>
        {TASKS.map((candidate) => (
          <label key={candidate.id} className="mass-balance__task">
            <input
              type="radio"
              name="task"
              value={candidate.id}
              checked={candidate.id === taskId}
              onChange={() => setTaskId(candidate.id)}
            />
            {candidate.title}
          </label>
        ))}
      </fieldset>

      {task.usesCylinder && (
        <div className="mass-balance__cylinder">
          {task.usesDates ? (
            <div className="mass-balance__dates">
              {dates.map((day, index) => (
                <NumberField
                  key={index}
                  label={`Day of the month, person ${index + 1}`}
                  value={day}
                  min={1}
                  max={31}
                  onChange={(next) =>
                    setDates(dates.map((current, i) => (i === index ? next : current)))
                  }
                />
              ))}
              <p className="mass-balance__total">
                Total: <strong>{cylinderVolume} mL</strong> to measure out.
              </p>
            </div>
          ) : (
            <NumberField
              label="Graduated cylinder"
              value={volume}
              unit="mL"
              min={0}
              max={250}
              onChange={setVolume}
            />
          )}
          <div className="mass-balance__pour">
            <button
              type="button"
              className="action-button"
              onClick={() => apply(pour(balance, cylinderVolume))}
            >
              Pour into cup
            </button>
            <button
              type="button"
              className="action-button"
              onClick={() => {
                setBalance(emptyCup(balance))
                setRefusal(null)
              }}
              disabled={balance.waterVolume === 0}
            >
              Empty the cup
            </button>
          </div>
        </div>
      )}
    </>
  )

  return (
    <ToolShell
      title="Using a balance"
      description="A digital balance to rehearse the Measuring Mass lab on the projector before anyone touches the real one."
      controls={controls}
      onReset={handleReset}
      onRandomize={handleRandomize}
    >
      <div className="mass-balance">
        <div className="mass-balance__bench-side">
          <div className="balance">
            <BalanceFigure state={balance} />
            <div className="balance__front">
              <output
                role="status"
                aria-label="Balance display"
                className="balance__display"
                data-powered={balance.powered}
              >
                {display && (
                  <>
                    {display}
                    <span className="balance__unit"> g</span>
                  </>
                )}
              </output>
              <div className="balance__buttons">
                <button
                  type="button"
                  className="balance__button"
                  aria-pressed={balance.powered}
                  onClick={() => {
                    setBalance(togglePower(balance))
                    setRefusal(null)
                  }}
                >
                  Power
                </button>
                <button
                  type="button"
                  className="balance__button"
                  onClick={() => setBalance(tare(balance))}
                  disabled={!balance.powered}
                >
                  {settings.tareLabel}
                </button>
              </div>
            </div>
            {value !== null && value < 0 && (
              <p className="balance__note">
                Negative? The balance is still subtracting the tare, and what was tared
                is no longer on the pan. That is expected — leave the buttons alone and
                put it back.
              </p>
            )}
          </div>

          <div className="bench">
            <h3 className="bench__heading">Bench</h3>
            <ul className="bench__items">
              {benchItems.map((id) => {
                const onBalance = balance.onBalance.includes(id)
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className="bench__item"
                      aria-pressed={onBalance}
                      onClick={() => toggleItem(id)}
                    >
                      {ITEMS[id].name}
                      <span className="bench__where">
                        {' — '}
                        {onBalance ? 'on the balance' : 'on the bench'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
            {task.usesCylinder && (
              <p className="bench__water">
                Water in the cup: <strong>{balance.waterVolume} mL</strong>
              </p>
            )}
            {refusal && (
              <p role="alert" className="bench__refusal">
                {refusal}
              </p>
            )}
          </div>
        </div>

        <div className="mass-balance__worksheet">
          <h3 className="worksheet__heading">{task.title}</h3>
          <ol className="worksheet__steps">
            {task.steps.map((step, index) => (
              <li key={step}>
                <label className="worksheet__step">
                  <input
                    type="checkbox"
                    checked={steps[index]}
                    onChange={() => toggleStep(index)}
                  />
                  <span>{step}</span>
                </label>
              </li>
            ))}
          </ol>

          {task.blanks.length > 0 && (
            <>
              <table className="worksheet__records" aria-label="Recorded readings">
                <tbody>
                  {task.blanks.map((blank) => {
                    const recorded = records[blank.id]
                    return (
                      <tr key={blank.id}>
                        <th scope="row">{blank.label}</th>
                        <td className="worksheet__value">
                          {recorded === undefined
                            ? '—'
                            : blank.source === 'cylinder'
                              ? `${recorded} mL`
                              : `${recorded.toFixed(settings.decimals)} g`}
                        </td>
                        <td>
                          {/* The row header already says what; the visible text stays
                              short so the table survives projector type at 1024px. */}
                          <button
                            type="button"
                            className="action-button"
                            aria-label={`Record ${blank.label}`}
                            onClick={() => record(blank)}
                          >
                            Record
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {worked ? (
                <RevealAnswer
                  label="Reveal the calculation"
                  hideLabel="Hide the calculation"
                >
                  <div className="worksheet__worked">
                    {worked.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </RevealAnswer>
              ) : (
                <p className="worksheet__hint">
                  Record every reading to unlock the calculation.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </ToolShell>
  )
}
