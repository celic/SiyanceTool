import type { BalanceState } from '@/core/balance'

export interface BalanceFigureProps {
  state: BalanceState
}

/** A cylinder this full is drawn full; the cup does not grow with volume. */
const CUP_FULL_ML = 100

/**
 * The pan and whatever is on it, drawn so the picture and the number agree.
 *
 * Decorative: `aria-hidden`, because every item's location is already in its
 * button's accessible name, and the reading is in the display. Everything is
 * labelled in text as well as drawn, so nothing here relies on colour or on
 * recognising a shape from the back of the room.
 */
export function BalanceFigure({ state }: BalanceFigureProps) {
  const on = (id: BalanceState['onBalance'][number]) => state.onBalance.includes(id)
  const hasBoat = on('weigh-boat')
  // The cup shares the pan with the boat, so it steps aside when both are on.
  const cupX = hasBoat ? 250 : 160
  const waterHeight = (52 * Math.min(state.waterVolume, CUP_FULL_ML)) / CUP_FULL_ML

  return (
    <svg
      className="balance-figure"
      viewBox="0 0 320 200"
      aria-hidden="true"
      focusable="false"
    >
      {/* Body and pan */}
      <rect
        className="balance-figure__body"
        x="30"
        y="150"
        width="260"
        height="42"
        rx="8"
      />
      <rect className="balance-figure__stem" x="152" y="138" width="16" height="14" />
      <ellipse className="balance-figure__pan" cx="160" cy="138" rx="100" ry="10" />

      {hasBoat && (
        <g className="balance-figure__item">
          <polygon points="115,132 205,132 215,104 105,104" />
          <text x="160" y="176" textAnchor="middle" className="balance-figure__label">
            weigh boat
          </text>
        </g>
      )}

      {on('sphere') && (
        <g className="balance-figure__item">
          <circle cx="160" cy="116" r="15" />
          <text x="160" y="96" textAnchor="middle" className="balance-figure__label">
            sphere
          </text>
        </g>
      )}

      {on('empty-balloon') && (
        <g className="balance-figure__item">
          <path d="M138 126 q10 -10 22 0 t22 0" />
          <text x="160" y="96" textAnchor="middle" className="balance-figure__label">
            empty balloon
          </text>
        </g>
      )}

      {on('inflated-balloon') && (
        <g className="balance-figure__item">
          <ellipse cx="160" cy="72" rx="30" ry="38" />
          <polygon points="154,110 166,110 160,118" />
          <text x="160" y="22" textAnchor="middle" className="balance-figure__label">
            inflated balloon
          </text>
        </g>
      )}

      {on('cup') && (
        <g className="balance-figure__item" transform={`translate(${cupX} 0)`}>
          {state.waterVolume > 0 && (
            <>
              <rect
                className="balance-figure__water"
                x="-26"
                y={130 - waterHeight}
                width="52"
                height={waterHeight}
              />
              <text
                x="0"
                y={126 - waterHeight}
                textAnchor="middle"
                className="balance-figure__label"
              >
                water
              </text>
            </>
          )}
          <polygon points="-28,132 28,132 34,72 -34,72" fill="none" />
          <text x="0" y="176" textAnchor="middle" className="balance-figure__label">
            cup
          </text>
        </g>
      )}
    </svg>
  )
}
