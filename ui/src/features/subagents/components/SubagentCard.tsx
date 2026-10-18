import { memo } from "react";
import { FiChevronDown } from "react-icons/fi";
import { AssistantMarkdown } from "@/components/primitives/assistantMarkdown";
import { describeSubagentStatus } from "../domain/describe-subagent-status";
import { isSubagentActive, type SubagentView } from "../domain/subagent-view";
import { SubagentStatusIcon } from "./SubagentStatusIcon";
import { SubagentStepList } from "./SubagentStepList";

function LatestStep({ view }: { view: SubagentView }) {
  const last = view.steps[view.steps.length - 1];
  if (!isSubagentActive(view) || !last) return null;
  return (
    <span className="subagent-card__latest">
      {last.tool} {last.inputSummary}
    </span>
  );
}

function NeedsApproval({ commands }: { commands: string[] }) {
  if (!commands.length) return null;
  return (
    <div className="subagent-card__held">
      <strong>Não executado (precisa de aprovação):</strong>
      <ul>
        {commands.map((command) => (
          <li key={command}>
            <code>{command}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const SubagentCard = memo(function SubagentCard({
  view,
}: {
  view: SubagentView;
}) {
  return (
    <details className={`subagent-card is-${view.status}`}>
      <summary className="subagent-card__summary">
        <span className={`subagent-status__icon is-${view.status}`}>
          <SubagentStatusIcon status={view.status} />
        </span>
        <span className="subagent-status__body">
          <strong>{view.agent || "subagente"}</strong>
          <span>{view.task}</span>
          <LatestStep view={view} />
        </span>
        <span className="subagent-status__state">
          {describeSubagentStatus(view.status)}
          {view.steps.length ? ` · ${view.steps.length} passos` : ""}
        </span>
        <FiChevronDown className="subagent-card__chevron" aria-hidden="true" />
      </summary>

      <div className="subagent-card__details">
        <SubagentStepList steps={view.steps} />
        {view.error ? (
          <p className="subagent-card__error">{view.error}</p>
        ) : null}
        <NeedsApproval commands={view.needsApproval} />
        {view.text ? (
          <div className="subagent-card__text">
            <AssistantMarkdown text={view.text} />
          </div>
        ) : null}
      </div>
    </details>
  );
});
