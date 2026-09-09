import { useId, useState } from 'react'

import '@/ui/NumberField.css'

export interface NumberFieldProps {
  label: string
  value: number
  unit?: string
  min?: number
  max?: number
  disabled?: boolean
  onChange: (value: number) => void
}

function rangeMessage(min?: number, max?: number): string | null {
  if (min !== undefined && max !== undefined)
    return `Must be between ${min} and ${max}.`
  if (min !== undefined) return `Must be ${min} or more.`
  if (max !== undefined) return `Must be ${max} or less.`
  return null
}

/**
 * A numeric input that explains bad input instead of swallowing it.
 *
 * Deliberately `type="text"` with a decimal input mode, not `type="number"`.
 * Number inputs silently discard characters they dislike, which makes "rejects
 * nonsense gracefully" impossible — the student types `12o` and simply sees
 * `12`, with nothing to explain the missing character. They also have tiny
 * spinner targets and change value on scroll, which is a real hazard when the
 * page is being scrolled in front of a class.
 *
 * Text is kept as its own state so a half-typed value like `-` or `1.` is not
 * destroyed mid-keystroke; `onChange` only fires for values that are actually
 * valid.
 */
export function NumberField({
  label,
  value,
  unit,
  min,
  max,
  disabled,
  onChange,
}: NumberFieldProps) {
  const id = useId()
  const errorId = useId()
  const unitId = useId()
  const [text, setText] = useState(String(value))
  const [error, setError] = useState<string | null>(null)
  const [lastValue, setLastValue] = useState(value)

  // Follow the value when it changes from outside, e.g. a reset or a randomize.
  // Adjusted during render rather than in an effect: React re-runs this
  // component immediately without painting the stale text, where an effect
  // would paint the old value first and then correct it.
  if (value !== lastValue) {
    setLastValue(value)
    setText(String(value))
    setError(null)
  }

  /**
   * Never leave a field in a broken state.
   *
   * Without this, an invalid entry survives a reset whenever the reset value
   * happens to equal the current one — the `value` prop does not change, so
   * nothing tells the field to resync, and she is left staring at an error she
   * just pressed Reset to clear.
   */
  function handleBlur() {
    const parsed = Number(text)
    const isUsable =
      text.trim() !== '' &&
      Number.isFinite(parsed) &&
      !(min !== undefined && parsed < min) &&
      !(max !== undefined && parsed > max)

    if (!isUsable) {
      setText(String(value))
      setError(null)
    }
  }

  function handleChange(next: string) {
    setText(next)

    // An empty field is someone part-way through retyping, not an error.
    if (next.trim() === '') {
      setError(null)
      return
    }

    const parsed = Number(next)

    if (!Number.isFinite(parsed)) {
      setError('Must be a number.')
      return
    }

    if ((min !== undefined && parsed < min) || (max !== undefined && parsed > max)) {
      setError(rangeMessage(min, max))
      return
    }

    setError(null)
    onChange(parsed)
  }

  return (
    <div className="number-field">
      <label className="number-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="number-field__row">
        <input
          id={id}
          className="number-field__input"
          type="text"
          inputMode="decimal"
          value={text}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [unit ? unitId : null, error ? errorId : null].filter(Boolean).join(' ') ||
            undefined
          }
          onChange={(event) => handleChange(event.target.value)}
          onBlur={handleBlur}
        />
        {/* Described rather than hidden: a screen reader user needs the unit
            as much as a sighted one. */}
        {unit && (
          <span id={unitId} className="number-field__unit">
            {unit}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} className="number-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
