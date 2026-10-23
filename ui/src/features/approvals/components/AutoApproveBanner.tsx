import { memo } from "react";
import { FiZap } from "react-icons/fi";

type Props = {
  onTurnOff: () => void;
};

/** Shown above the message box while auto mode is on. */
export const AutoApproveBanner = memo(({ onTurnOff }: Props) => (
  <div className="auto-approve-banner" role="status">
    <FiZap className="auto-approve-banner__icon" aria-hidden="true" />
    <p className="auto-approve-banner__text">
      Auto-approve is on: tool calls run without asking. Destructive commands,
      commits and MCP server changes still ask.
    </p>
    <button
      type="button"
      className="auto-approve-banner__off"
      onClick={onTurnOff}
    >
      Turn off
    </button>
  </div>
));
