import type { BalanceState } from '@/core/balance'

export interface BalanceFigureProps {
  state: BalanceState
}

/** A cylinder this full is drawn full; the cup does not grow with volume. */
const CUP_FULL_ML = 100

/** Top surface of the pan, in drawing units. Items stand on this line. */
const PAN_TOP = 116

/**
 * The pan and whatever is on it, drawn so the picture and the number agree.
 *
 * The drawing stops at the stem; the housing with the display and buttons is
 * HTML directly beneath it, so the reading is a live region rather than a
 * picture of a number. Decorative: `aria-hidden`, because every item's
 * location is already in its button's accessible name. Everything is
 * labelled in text as well as drawn, so nothing here relies on colour or on
 * recognising a shape from the back of the room.
 */
export function BalanceFigure({ state }: BalanceFigureProps) {
  const on = (id: BalanceState['onBalance'][number]) => state.onBalance.includes(id)
  const hasBoat = on('weigh-boat')
  // The cup shares the pan with the boat, so it steps aside when both are on.
  const cupX = hasBoat ? 248 : 160
  const waterHeight = (50 * Math.min(state.waterVolume, CUP_FULL_ML)) / CUP_FULL_ML

  return (
    <svg
      className="balance-figure"
      viewBox="0 0 320 160"
      aria-hidden="true"
      focusable="false"
    >
      {/* Stem and shroud, then the pan as a disc with a visible edge. */}
      <rect className="balance-figure__stem" x="150" y="146" width="20" height="14" />
      <polygon
        className="balance-figure__shroud"
        points="128,130 192,130 178,148 142,148"
      />
      <ellipse
        className="balance-figure__pan-edge"
        cx="160"
        cy="124"
        rx="106"
        ry="12"
      />
      <ellipse className="balance-figure__pan" cx="160" cy={PAN_TOP} rx="106" ry="12" />

      {hasBoat && (
        <g className="balance-figure__item">
          <polygon points="115,116 205,116 215,90 105,90" />
          <text x="92" y="108" textAnchor="end" className="balance-figure__label">
            weigh boat
          </text>
        </g>
      )}

      {on('sphere') && (
        <g className="balance-figure__item">
          <circle cx="160" cy="101" r="14" />
          <text x="160" y="80" textAnchor="middle" className="balance-figure__label">
            sphere
          </text>
        </g>
      )}

      {on('empty-balloon') && (
        <g className="balance-figure__item">
          <path d="M136 110 q12 -12 24 0 t24 0" />
          <text x="222" y="108" textAnchor="start" className="balance-figure__label">
            empty balloon
          </text>
        </g>
      )}

      {on('inflated-balloon') && (
        <g className="balance-figure__item">
          <ellipse cx="160" cy="56" rx="30" ry="36" />
          <polygon points="154,92 166,92 160,100" />
          <text x="160" y="12" textAnchor="middle" className="balance-figure__label">
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
                y={PAN_TOP - 2 - waterHeight}
                width="52"
                height={waterHeight}
              />
              <text
                x="0"
                y={PAN_TOP - 6 - waterHeight}
                textAnchor="middle"
                className="balance-figure__label"
              >
                water
              </text>
            </>
          )}
          <polygon points="-28,116 28,116 34,58 -34,58" fill="none" />
          <text x="40" y="100" textAnchor="start" className="balance-figure__label">
            cup
          </text>
        </g>
      )}
    </svg>
  )
}
