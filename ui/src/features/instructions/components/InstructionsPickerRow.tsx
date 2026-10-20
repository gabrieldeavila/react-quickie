import { FiCheck } from "react-icons/fi";
import type { InstructionSummary } from "../domain/instruction.types";
import { SourceBadge } from "./SourceBadge";

type Props = {
  instruction: InstructionSummary;
  isSelected: boolean;
  onToggle: (id: string) => void;
};

/** One checkable row of the instructions picker. */
export function InstructionsPickerRow({
  instruction,
  isSelected,
  onToggle,
}: Props) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      className={`chat-mode-popover__option instruction-option ${isSelected ? "chat-mode-popover__option--selected" : ""}`}
      title={instruction.description || instruction.name}
      onClick={() => onToggle(instruction.id)}
    >
      <span className="instruction-option__check" aria-hidden="true">
        {isSelected ? <FiCheck /> : null}
      </span>
      <span className="instruction-option__text">
        <span className="chat-mode-popover__option-label">
          {instruction.name}
        </span>
        {instruction.description ? (
          <span className="instruction-option__description">
            {instruction.description}
          </span>
        ) : null}
      </span>
      <SourceBadge source={instruction.source} />
    </button>
  );
}
