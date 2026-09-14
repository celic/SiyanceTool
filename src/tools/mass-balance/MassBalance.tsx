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
  type Action,
  type Blank,
  type Records,
  type TaskId,
} from '@/tools/mass-balance/tasks'
import { NumberField } from '@/ui/NumberField'
import { RevealAnswer } from '@/ui/RevealAnswer'
import { ToolShell } from '@/ui/ToolShell'
import '@/tools/mass-balance/MassBalance.css'

const ITEM_ORDER = Object.keys(ITEMS) as ItemId[]

/**
 * The Task 6 calculation, set up but not done: the difference between the
 * last two readings, written larger − smaller with a blank for the result.
 * The site is the balance, not the calculator.
 */
function lastDifference(log: number[], decimals: number): string {
  const [previous, last] = log.slice(-2)
  const [big, small] = last >= previous ? [last, previous] : [previous, last]
  const g = (v: number) => `${v.toFixed(decimals)} g`
  return `${g(big)} − ${g(small)} = ___ g`
}
const DEFAULT_VOLUME = 10
const DEFAULT_DATES = [1, 1, 1, 1]
const FIRST_TASK = TASKS[0].id

/**
 * A simulated digital balance for rehearsing the "Measuring Mass" lab.
 *
 * Built as a walkthrough from the teacher's side of the projector: the lab's
 * steps are shown in order with the current one marked, Next and Back move
 * through them, and the last step of one task runs on into the first step of
 * the next, the way the lab does. Steps that say "Record" carry their own
 * Record button, so the number lands next to the instruction that asked for it.
 *
 * The bench keeps continuity between tasks, as a real bench does: Task 2B
 * begins with the sphere still in the boat from 2A, because 2B's first step is
 * to take it out. Only Reset clears the balance. Readings recorded in one task
 * stay available to the next, because 2B compares against 2A.
 */
export function MassBalance({ options }: ToolProps) {
  const [settings] = useState(() => readSettings(options))
  const [balance, setBalance] = useState<BalanceState>(() =>
    createBalance({ decimals: settings.decimals, waterDensity: settings.waterDensity }),
  )
  const [taskId, setTaskId] = useState<TaskId>(FIRST_TASK)
  const [stepIndex, setStepIndex] = useState(0)
  const [records, setRecords] = useState<Records>({})
  const [refusal, setRefusal] = useState<string | null>(null)
  const [volume, setVolume] = useState(DEFAULT_VOLUME)
  const [dates, setDates] = useState(DEFAULT_DATES)
  /** Sandbox readings, in the order taken. */
  const [log, setLog] = useState<number[]>([])

  const task = findTask(taskId)
  const taskIndex = TASKS.findIndex((candidate) => candidate.id === taskId)
  const nextTask = TASKS[taskIndex + 1]
  const previousTask = TASKS[taskIndex - 1]
  const onLastStep = stepIndex >= task.steps.length - 1
  const cylinderVolume = task.usesDates
    ? dates.reduce((sum, day) => sum + day, 0)
    : volume
  const value = reading(balance)
  const display = readout(balance)
  const benchItems = ITEM_ORDER.filter(
    (id) => task.items.includes(id) || balance.onBalance.includes(id),
  )
  const formula = task.formula(records, settings.decimals)
  const blankById = new Map(task.blanks.map((blank) => [blank.id, blank]))

  /**
   * Moves the marker on when an action completes the current step.
   *
   * Scans forward from the current step: a step with no condition (nothing on
   * the page can detect "measure out 10 mL") is passed over; a step whose
   * condition holds is completed and the scan continues, so one Tare press on
   * an already-clear pan completes both "remove everything" and "press Tare";
   * the first step whose condition fails stops the scan. The marker lands
   * after the last completed step. An action for an earlier step — a reading
   * recorded twice — changes nothing.
   */
  function advance(action: Action, state: BalanceState) {
    let landing = stepIndex
    for (let index = stepIndex; index < task.steps.length; index += 1) {
      const condition = task.steps[index].advance
      if (!condition) continue
      if (!condition(action, state)) break
      landing = index + 1
    }
    if (landing !== stepIndex) setStepIndex(Math.min(landing, task.steps.length - 1))
  }

  /** Commits a new balance state and lets the walkthrough see what was done. */
  function commit(state: BalanceState, action: Action) {
    setBalance(state)
    setRefusal(null)
    advance(action, state)
  }

  /** Applies a move, or shows why the balance refused it, in the lab's words. */
  function apply(result: MoveResult, action: Action) {
    if (result.ok) commit(result.state, action)
    else setRefusal(result.reason)
  }

  function toggleItem(id: ItemId) {
    if (balance.onBalance.includes(id)) {
      apply(remove(balance, id), { type: 'remove', item: id })
    } else {
      apply(place(balance, id), { type: 'place', item: id })
    }
  }

  function goTo(id: TaskId, step: number) {
    setTaskId(id)
    setStepIndex(step)
    setRefusal(null)
  }

  function next() {
    if (!onLastStep) goTo(taskId, stepIndex + 1)
    else if (nextTask) goTo(nextTask.id, 0)
  }

  function back() {
    if (stepIndex > 0) goTo(taskId, stepIndex - 1)
    else if (previousTask) goTo(previousTask.id, previousTask.steps.length - 1)
  }

  function record(blank: Blank) {
    if (blank.source === 'cylinder') {
      // What was poured, not what the fields say now — a date changed after
      // pouring must not make the reveal compare the wrong volume.
      setRecords({ ...records, [blank.id]: balance.waterVolume })
      advance({ type: 'record', blank: blank.id }, balance)
      return
    }
    if (value === null) {
      setRefusal('Power on the balance first.')
      return
    }
    setRecords({ ...records, [blank.id]: value })
    setRefusal(null)
    advance({ type: 'record', blank: blank.id }, balance)
  }

  function formatRecord(blank: Blank, recorded: number) {
    return blank.source === 'cylinder'
      ? `${recorded} mL`
      : `${recorded.toFixed(settings.decimals)} g`
  }

  function logReading() {
    if (value === null) return
    setLog([...log, value])
    setRefusal(null)
  }

  function handleReset() {
    setBalance(reset(balance))
    setRecords({})
    setLog([])
    setRefusal(null)
    setVolume(DEFAULT_VOLUME)
    setDates(DEFAULT_DATES)
    setStepIndex(0)
  }

  function handleRandomize() {
    setBalance(randomize(balance))
    setRecords({})
    setLog([])
    setRefusal(null)
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
              onChange={() => goTo(candidate.id, 0)}
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
              onClick={() => apply(pour(balance, cylinderVolume), { type: 'pour' })}
            >
              Pour into cup
            </button>
            <button
              type="button"
              className="action-button"
              onClick={() => apply(emptyCup(balance), { type: 'empty' })}
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
      description="Walk the class through the Measuring Mass lab on a simulated digital balance before anyone touches the real one."
      controls={controls}
      onReset={handleReset}
      onRandomize={handleRandomize}
    >
      <div className="mass-balance">
        <div className="mass-balance__bench-side">
          <div className="balance">
            <BalanceFigure state={balance} />
            <div className="balance__housing">
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
                  className="balance__button balance__button--power"
                  aria-pressed={balance.powered}
                  onClick={() => commit(togglePower(balance), { type: 'power' })}
                >
                  Power
                </button>
                <button
                  type="button"
                  className="balance__button"
                  onClick={() => commit(tare(balance), { type: 'tare' })}
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

        <div className="mass-balance__procedure">
          <h3 className="procedure__heading">{task.title}</h3>

          {task.freePlay && (
            <div className="procedure__free">
              <p className="procedure__free-text">{task.freePlay}</p>
              <div className="procedure__log-actions">
                <button
                  type="button"
                  className="action-button action-button--primary"
                  onClick={logReading}
                  disabled={value === null}
                >
                  Record reading
                </button>
                <button
                  type="button"
                  className="action-button"
                  onClick={() => setLog([])}
                  disabled={log.length === 0}
                >
                  Clear readings
                </button>
                {value === null && (
                  <span className="procedure__wait">Press Power first.</span>
                )}
              </div>
              <ol className="procedure__log" aria-label="Readings">
                {log.map((reading, index) => (
                  <li key={index} className="procedure__log-entry">
                    <span>Reading {index + 1}</span>
                    <span className="procedure__value">
                      {reading.toFixed(settings.decimals)} g
                    </span>
                  </li>
                ))}
              </ol>
              {log.length >= 2 ? (
                <RevealAnswer label="Show the formula" hideLabel="Hide the formula">
                  <div className="procedure__worked">
                    <p>{lastDifference(log, settings.decimals)}</p>
                    <p className="procedure__hint">
                      Work it out on your calculator and write it on your worksheet.
                    </p>
                  </div>
                </RevealAnswer>
              ) : (
                <p className="procedure__hint">
                  Take two readings to set up the difference between them.
                </p>
              )}
            </div>
          )}

          {!task.freePlay && (
            <ol className="procedure__steps" aria-label="Steps">
              {task.steps.map((step, index) => {
                const blank = step.record ? blankById.get(step.record) : undefined
                const recorded = blank ? records[blank.id] : undefined
                const isCurrent = index === stepIndex
                // A forced wait: Record is disabled until the bench matches the
                // step. Steps from the marker onward say what is still missing;
                // steps already passed just go quiet.
                const waiting = blank
                  ? blank.source === 'readout' && !balance.powered
                    ? 'Press Power first.'
                    : blank.ready(balance)
                  : null
                return (
                  <li
                    key={step.text}
                    className="procedure__step"
                    aria-current={isCurrent ? 'step' : undefined}
                    data-done={index < stepIndex}
                  >
                    <span className="procedure__text">{step.text}</span>
                    {blank && (
                      <span className="procedure__record">
                        <button
                          type="button"
                          className="action-button"
                          aria-label={`Record ${blank.label}`}
                          disabled={waiting !== null}
                          onClick={() => record(blank)}
                        >
                          Record
                        </button>
                        <span className="procedure__value">
                          {recorded === undefined
                            ? `— ${blank.source === 'cylinder' ? 'mL' : 'g'}`
                            : formatRecord(blank, recorded)}
                        </span>
                        {index >= stepIndex && waiting && (
                          <span className="procedure__wait">{waiting}</span>
                        )}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          )}

          {!task.freePlay && (
            <div className="procedure__nav">
              <button
                type="button"
                className="action-button"
                onClick={back}
                disabled={stepIndex === 0 && !previousTask}
              >
                Back
              </button>
              <button
                type="button"
                className="action-button action-button--primary"
                onClick={next}
                disabled={onLastStep && !nextTask}
                aria-label={onLastStep && nextTask ? `Next: ${nextTask.title}` : 'Next'}
              >
                {onLastStep && nextTask ? `Next: ${nextTask.title}` : 'Next'}
              </button>
            </div>
          )}

          {task.blanks.length > 0 && (
            <div className="procedure__data">
              <h4 className="procedure__data-heading">Data</h4>
              <table className="procedure__records" aria-label="Recorded readings">
                <tbody>
                  {task.blanks.map((blank) => {
                    const recorded = records[blank.id]
                    return (
                      <tr key={blank.id}>
                        <th scope="row">{blank.label}</th>
                        <td className="procedure__value">
                          {recorded === undefined ? '—' : formatRecord(blank, recorded)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {formula ? (
                <RevealAnswer label="Show the formula" hideLabel="Hide the formula">
                  <div className="procedure__worked">
                    {formula.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    <p className="procedure__hint">
                      Work it out on your calculator and write it on your worksheet.
                    </p>
                  </div>
                </RevealAnswer>
              ) : (
                <p className="procedure__hint">
                  Record every reading to set up the formula.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  )
}
