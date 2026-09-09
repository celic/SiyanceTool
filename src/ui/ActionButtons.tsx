import '@/ui/ActionButtons.css'

interface ActionButtonProps {
  onClick: () => void
  /** Override when the default wording is ambiguous on a busy tool. */
  label?: string
  disabled?: boolean
}

/**
 * Puts a tool back to its starting state.
 *
 * Every tool has one, always in the same place, because the most common thing
 * she does between two classes is start over.
 */
export function ResetButton({ onClick, label = 'Reset', disabled }: ActionButtonProps) {
  return (
    <button
      type="button"
      className="action-button"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}

/**
 * Generates a fresh problem on a drill tool.
 *
 * Labelled "New problem" rather than "Randomize" because that is what it means
 * to the person pressing it, and it is projected in front of a class.
 */
export function RandomizeButton({
  onClick,
  label = 'New problem',
  disabled,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className="action-button action-button--primary"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}
