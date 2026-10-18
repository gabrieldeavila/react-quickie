import { memo } from "react";
import { describeSubagentGroup } from "../domain/describe-subagent-status";
import type { IndexedPart } from "../domain/group-subagent-parts";
import { toSubagentView } from "../domain/subagent-view";
import { SubagentPart, type SubagentToolPart } from "./SubagentPart";
import "@/styles/subagent-status.css";

type Props = {
  messageId: string;
  items: IndexedPart<SubagentToolPart>[];
  isLatestMessage: boolean;
};

/** Subagents launched in the same step, shown together. */
export const SubagentGroup = memo(function SubagentGroup({
  messageId,
  items,
  isLatestMessage,
}: Props) {
  const cards = items.map(({ part, index }) => (
    <SubagentPart
      key={`${messageId}-subagent-${index}`}
      part={part}
      isLatestMessage={isLatestMessage}
    />
  ));

  if (items.length === 1) {
    return <div className="subagent-status">{cards}</div>;
  }

  return (
    <section className="subagent-status" aria-label="Subagentes">
      <header className="subagent-status__header">
        <span>Subagentes</span>
        <span className="subagent-status__count">
          {describeSubagentGroup(items.map(({ part }) => toSubagentView(part)))}
        </span>
      </header>
      <div className="subagent-status__list">{cards}</div>
    </section>
  );
});
