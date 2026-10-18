import { memo } from "react";
import { ToolCallCard } from "@/components/primitives/toolCallCard";
import { getToolUiMeta } from "@/helpers/tool-ui-mapping.helper";
import { getMcpToolLabel } from "../domain/mcp-tool-label";
import { getPendingApproval, getToolName } from "../domain/tool-approval";
import { getToolLabel } from "../domain/tool-label";
import {
  formatToolOutput,
  getToolStatus,
  type ToolPartView,
} from "../domain/tool-part-view";
import { ToolApprovalCard } from "./ToolApprovalCard";

type Props = {
  part: ToolPartView & { input?: unknown; toolName?: unknown };
  /** Only the latest message can still answer an approval request. */
  isLatestMessage: boolean;
};

export const AssistantToolPart = memo(function AssistantToolPart({
  part,
  isLatestMessage,
}: Props) {
  const approval = getPendingApproval(part);
  if (approval) {
    return (
      <ToolApprovalCard approval={approval} isAnswerable={isLatestMessage} />
    );
  }

  const status = getToolStatus(part);
  // MCP tools arrive as `dynamic-tool` parts with no TOOL_UI_MAPPING entry.
  const fallbackLabel =
    getMcpToolLabel(getToolName(part)) ?? getToolUiMeta(part.type).label;

  return (
    <ToolCallCard
      label={getToolLabel(part, fallbackLabel)}
      status={status}
      outputText={status === "loading" ? "" : formatToolOutput(part)}
    />
  );
});
