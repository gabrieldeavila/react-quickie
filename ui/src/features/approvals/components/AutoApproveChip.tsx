import { memo } from "react";
import { FiZap } from "react-icons/fi";

type Props = {
  isOn: boolean;
  onToggle: () => void;
};

/** Composer chip that turns auto mode on or off for this conversation. */
export const AutoApproveChip = memo(({ isOn, onToggle }: Props) => (
  <button
    type="button"
    className={`chat-mode-popover__trigger chat-mode-popover__trigger--chip auto-approve-chip ${isOn ? "auto-approve-chip--on" : ""}`}
    onClick={onToggle}
    aria-pressed={isOn}
    title={
      isOn
        ? "Auto-approve is on: tool calls run without asking. Deletes, shares, destructive commands, commits and MCP server changes still ask. Click to turn it off."
        : "Auto-approve tool calls in this conversation (destructive ones still ask)."
    }
  >
    <span className="chat-mode-popover__icon" aria-hidden="true">
      <FiZap className="chat-mode-popover__icon-svg" />
    </span>
    <span className="chat-mode-popover__trigger-label">Auto-approve</span>
  </button>
));
