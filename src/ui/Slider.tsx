import { useId } from 'react'

import '@/ui/Slider.css'

export interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  /** Shown beside the value and included in what assistive tech announces. */
  unit?: string
  disabled?: boolean
  onChange: (value: number) => void
}

/**
 * A labelled range control with its value shown as text.
 *
 * Built on the native range input rather than a custom widget, which buys
 * keyboard stepping, touch support, and correct screen reader announcements for
 * free — all things a hand-rolled slider gets subtly wrong.
 *
 * The value is always shown as text as well: from the back of a classroom a
 * knob position is unreadable, and the number is the thing being taught.
 */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  disabled,
  onChange,
}: SliderProps) {
  const id = useId()
  const displayValue = unit ? `${value} ${unit}` : String(value)

  return (
    <div className="slider">
      <div className="slider__row">
        <label className="slider__label" htmlFor={id}>
          {label}
        </label>
        <output className="slider__value" htmlFor={id}>
          {value}
          {unit && <span className="slider__unit"> {unit}</span>}
        </output>
      </div>
      <input
        id={id}
        className="slider__input"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={displayValue}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}
