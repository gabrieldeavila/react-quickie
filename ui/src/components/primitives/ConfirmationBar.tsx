import type { Confirmation } from "./useConfirmation";

type Props = { confirmation: Confirmation };

/** The pending confirmation, inline in a dialog; focus starts on Cancel. */
export function ConfirmationBar({ confirmation }: Props) {
  const { pending, cancel, confirm } = confirmation;
  if (!pending) return null;

  return (
    <div
      className="chat-confirmation"
      role="alertdialog"
      aria-labelledby="chat-confirmation-message"
    >
      <p id="chat-confirmation-message">{pending.message}</p>
      <div className="chat-confirmation__actions">
        <button
          type="button"
          className="chat-button chat-button--ghost"
          onClick={cancel}
          autoFocus
        >
          Cancel
        </button>
        <button
          type="button"
          className="chat-button chat-button--danger"
          onClick={confirm}
        >
          {pending.confirmLabel}
        </button>
      </div>
    </div>
  );
}
