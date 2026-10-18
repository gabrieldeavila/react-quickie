import { memo } from "react";
import { FiChevronDown, FiExternalLink } from "react-icons/fi";
import type { ToolCallCardProps } from "~types/interface/chat.interface";
import { ToolStatusIcon } from "./toolStatusIcon";

export const ToolCallCard = memo(function ToolCallCard({
  label,
  status,
  outputText,
  onOpenFile,
}: ToolCallCardProps) {
  const isDone = status !== "loading";
  const openButton = onOpenFile ? (
    <button
      type="button"
      className="tool-call-card__open"
      title="Open in editor"
      aria-label="Open in editor"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onOpenFile();
      }}
    >
      <FiExternalLink aria-hidden="true" />
    </button>
  ) : null;

  if (!isDone) {
    return (
      <div className="tool-call-card tool-call-card--loading">
        <div className="tool-call-card__header">
          <ToolStatusIcon status={status} />
          <span className="tool-call-card__label">{label}</span>
          {openButton}
        </div>
      </div>
    );
  }

  return (
    <details className="tool-call-card tool-call-card--done">
      <summary className="tool-call-card__summary">
        <div className="tool-call-card__summary-content">
          <div className="tool-call-card__header">
            <ToolStatusIcon status={status} />
            <span className="tool-call-card__label">{label}</span>
            {openButton}
          </div>

          <FiChevronDown
            className="tool-call-card__summary-icon"
            aria-hidden="true"
          />
        </div>
      </summary>

      <div className="tool-call-card__details">
        <pre className="tool-call-card__output">
          {outputText || "No text output."}
        </pre>
      </div>
    </details>
  );
});
