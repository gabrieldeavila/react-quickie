import type {
  AgentChoice,
  AgentPickerGroup,
  AgentPickerOption,
} from "../domain/build-agent-picker-options";
import { isSameAgentChoice } from "../domain/describe-agent-choice";

type AgentPickerRowProps = {
  option: AgentPickerOption;
  groups: AgentPickerGroup[];
  value: AgentChoice;
  onSelect: (choice: AgentChoice) => void;
  /** Specialty rows sit indented under their mode. */
  nested?: boolean;
};

export function AgentPickerRow({
  option,
  groups,
  value,
  onSelect,
  nested = false,
}: AgentPickerRowProps) {
  const isSelected = isSameAgentChoice(groups, option, value);
  const Icon = option.icon;

  return (
    <button
      type="button"
      className={[
        "chat-mode-popover__option",
        isSelected ? "chat-mode-popover__option--selected" : "",
        nested ? "chat-mode-popover__option--nested" : "",
      ].join(" ")}
      onClick={() =>
        onSelect({ focus: option.focus, specialty: option.specialty })
      }
      role="option"
      aria-selected={isSelected}
    >
      <span className="chat-mode-popover__option-icon" aria-hidden="true">
        <Icon className="chat-mode-popover__option-icon-svg" />
      </span>
      <span className="chat-mode-popover__option-label">{option.label}</span>
    </button>
  );
}
