type Props = {
  view: "list" | "form" | "tools";
  isSaving: boolean;
  saveDisabled: boolean;
  onAdd: () => void;
  onSave: () => void;
  onBack: () => void;
  onClose: () => void;
  onRefresh: () => void;
};

/** The dialog's footer buttons for each view. */
export function McpDialogActions({
  view,
  isSaving,
  saveDisabled,
  onAdd,
  onSave,
  onBack,
  onClose,
  onRefresh,
}: Props) {
  if (view === "list") {
    return (
      <div className="chat-modal__actions">
        <button
          type="button"
          className="chat-button chat-button--ghost"
          onClick={onRefresh}
        >
          Refresh
        </button>
        <button
          type="button"
          className="chat-button chat-button--ghost"
          onClick={onClose}
        >
          Close
        </button>
        <button type="button" className="chat-button" onClick={onAdd}>
          Add server
        </button>
      </div>
    );
  }

  return (
    <div className="chat-modal__actions">
      <button
        type="button"
        className="chat-button chat-button--ghost"
        onClick={onBack}
      >
        Back
      </button>
      {view === "form" ? (
        <button
          type="button"
          className="chat-button"
          onClick={onSave}
          disabled={isSaving || saveDisabled}
        >
          {isSaving ? "Saving…" : "Save server"}
        </button>
      ) : null}
    </div>
  );
}
