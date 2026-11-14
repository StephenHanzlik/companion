import { useEffect, useId, useRef } from 'react'
import DepartureCheck from './DepartureCheck'
import StayAwareLoop from './StayAwareLoop'
import Icon from './Icon'

// The departure check and the Stay aware loop, side by side. Shown folded on
// the Ride tab and in the dialog that opens when a plan is signed off.
export default function FieldReminders() {
  return (
    <div className="reminders-body">
      <DepartureCheck />
      <StayAwareLoop />
    </div>
  )
}

export function SignOffDialog({ onClose, onGoToRide }: { onClose: () => void; onGoToRide: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === e.currentTarget) ref.current?.close()
      }}
    >
      <div className="dialog-head">
        <div>
          <h2 id={titleId} className="dialog-title">
            <Icon name="check" size={18} />
            Plan signed off
          </h2>
          <p className="help">Copy the essentials into your field book. Then, on the tour:</p>
        </div>
        <button type="button" className="icon-btn" aria-label="Close" onClick={() => ref.current?.close()}>
          <Icon name="x" size={16} />
        </button>
      </div>
      <FieldReminders />
      <div className="dialog-foot">
        <span className="help">These stay on the Ride tab under Field reminders.</span>
        <div className="btn-row">
          <button type="button" className="btn btn-quiet" onClick={() => ref.current?.close()}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              ref.current?.close()
              onGoToRide()
            }}
          >
            Go to Ride
            <Icon name="arrow-right" size={14} />
          </button>
        </div>
      </div>
    </dialog>
  )
}
