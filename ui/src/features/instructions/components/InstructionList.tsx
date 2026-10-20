import { groupBySource } from "../domain/group-by-source";
import type { InstructionSummary } from "../domain/instruction.types";

type Props = {
  instructions: InstructionSummary[];
  disabled: boolean;
  onEdit: (item: InstructionSummary) => void;
  onDuplicate: (item: InstructionSummary) => void;
  onDelete: (item: InstructionSummary) => void;
};

/** Instructions grouped by source, with their actions. */
export function InstructionList({
  instructions,
  disabled,
  onEdit,
  onDuplicate,
  onDelete,
}: Props) {
  const groups = groupBySource(instructions);
  if (groups.length === 0) {
    return <p className="instructions-panel__empty">No instructions yet.</p>;
  }

  return (
    <div className="instruction-list">
      {groups.map((group) => (
        <section key={group.source} aria-label={group.label}>
          <h3 className="instruction-list__heading">{group.label}</h3>
          <ul className="instruction-list__items">
            {group.instructions.map((item) => (
              <li key={item.id} className="instruction-list__row">
                <div className="instruction-list__main">
                  <span className="instruction-list__name">{item.name}</span>
                  <span className="instruction-list__meta">
                    /{item.id}
                    {item.description ? ` · ${item.description}` : ""}
                  </span>
                </div>
                <div className="instruction-list__actions">
                  <button
                    type="button"
                    className="chat-button chat-button--ghost"
                    disabled={disabled}
                    onClick={() => onEdit(item)}
                    title={
                      item.editable
                        ? "Edit"
                        : "Edit a copy that overrides this built-in"
                    }
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="chat-button chat-button--ghost"
                    disabled={disabled}
                    onClick={() => onDuplicate(item)}
                  >
                    Duplicate
                  </button>
                  {item.editable ? (
                    <button
                      type="button"
                      className="chat-button chat-button--ghost"
                      disabled={disabled}
                      onClick={() => onDelete(item)}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
