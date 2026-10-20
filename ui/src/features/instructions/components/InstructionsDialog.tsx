import { useEscapeKey } from "@/components/primitives/useEscapeKey";
import type { InstructionsState } from "../hooks/useInstructions";
import { useInstructionEditor } from "../hooks/useInstructionEditor";
import { InstructionForm } from "./InstructionForm";
import { InstructionList } from "./InstructionList";

type Props = {
  root: string;
  state: InstructionsState;
  onClose: () => void;
};

/** Create, edit, duplicate and delete instructions. */
export function InstructionsDialog({ root, state, onClose }: Props) {
  const editor = useInstructionEditor(root, state);
  const { draft } = editor;
  // Escape backs out of the form first, then closes the dialog.
  useEscapeKey(draft ? editor.cancel : onClose);
  const title = draft
    ? draft.isNew
      ? "New instruction"
      : `Edit "${draft.values.name || draft.values.id}"`
    : "Instructions";

  return (
    <div className="chat-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        className="chat-modal instructions-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="instructions-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="chat-modal__header">
          <div>
            <h2 id="instructions-dialog-title">{title}</h2>
            <p>
              Guidance you attach to a conversation. Project instructions live
              in <code>.doty/instructions/</code> and can be committed.
            </p>
          </div>
          <button
            type="button"
            className="chat-modal__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        {editor.actionError ? (
          <p className="chat-modal__error">{editor.actionError}</p>
        ) : null}
        {state.error ? <p className="chat-modal__error">{state.error}</p> : null}

        {draft ? (
          <InstructionForm
            values={draft.values}
            errors={editor.errors}
            isNew={draft.isNew}
            onChange={editor.change}
          />
        ) : (
          <InstructionList
            instructions={state.instructions}
            disabled={editor.busy}
            onEdit={editor.edit}
            onDuplicate={editor.duplicate}
            onDelete={editor.remove}
          />
        )}

        <div className="chat-modal__actions">
          {draft ? (
            <>
              <button
                type="button"
                className="chat-button chat-button--ghost"
                onClick={editor.cancel}
              >
                Back
              </button>
              <button
                type="button"
                className="chat-button"
                onClick={editor.submit}
                disabled={editor.busy}
              >
                {editor.busy ? "Saving…" : "Save instruction"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="chat-button chat-button--ghost"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="chat-button"
                onClick={editor.create}
              >
                New instruction
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
