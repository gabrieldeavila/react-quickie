import { memo } from "react";
import { ToolApprovalCard } from "@/features/chat/components/ToolApprovalCard";
import { getPendingApproval } from "@/features/chat/domain/tool-approval";
import { toSubagentView } from "../domain/subagent-view";
import { SubagentCard } from "./SubagentCard";

export type SubagentToolPart = {
  type: string;
  state?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  approval?: { id?: unknown; approved?: unknown; reason?: unknown };
};

type Props = {
  part: SubagentToolPart;
  /** Only the latest message can still answer an approval request. */
  isLatestMessage: boolean;
};

/** One `run_subagent` call: the approval card while it waits, then its progress. */
export const SubagentPart = memo(function SubagentPart({
  part,
  isLatestMessage,
}: Props) {
  const approval = getPendingApproval(part);
  if (approval) {
    return (
      <ToolApprovalCard approval={approval} isAnswerable={isLatestMessage} />
    );
  }
  return <SubagentCard view={toSubagentView(part)} />;
});
