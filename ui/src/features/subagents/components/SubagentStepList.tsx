import { describeStepState } from "../domain/describe-subagent-status";
import type { SubagentStepView } from "../domain/subagent-view";

export function SubagentStepList({ steps }: { steps: SubagentStepView[] }) {
  if (!steps.length) return null;

  return (
    <ol className="subagent-steps">
      {steps.map((step) => (
        <li className={`subagent-steps__item is-${step.state}`} key={step.id}>
          <span className="subagent-steps__tool">{step.tool}</span>
          <span className="subagent-steps__input">{step.inputSummary}</span>
          <span className="subagent-steps__state">
            {describeStepState(step.state)}
          </span>
        </li>
      ))}
    </ol>
  );
}
