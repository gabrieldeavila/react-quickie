import { memo } from "react";
import { FiChevronDown } from "react-icons/fi";
import type { ToolCallCardProps } from "~types/interface/chat.interface";
import { ToolStatusIcon } from "./toolStatusIcon";

export const ToolCallCard = memo(function ToolCallCard({
  label,
  status,
  outputText,
}: ToolCallCardProps) {
  const isDone = status !== "loading";

  if (!isDone) {
    return (
      <div className="tool-call-card tool-call-card--loading">
        <div className="tool-call-card__header">
          <ToolStatusIcon status={status} />
          <span className="tool-call-card__label">{label}</span>
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
          </div>

          <FiChevronDown
            className="tool-call-card__summary-icon"
            aria-hidden="true"
          />
        </div>
      </summary>

      <div className="tool-call-card__details">
        <pre className="tool-call-card__output">
          {outputText || "Sem retorno textual."}
        </pre>
      </div>
    </details>
  );
});
