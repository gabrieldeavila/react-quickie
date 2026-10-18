import type { ConversationUsage } from "../domain/message-usage.types";
import { formatCost, formatUsageSummary } from "../domain/format-usage";
import "@/styles/chat-usage.css";

type ConversationUsageBadgeProps = { total: ConversationUsage };

/** Conversation total: the cost when known, tokens otherwise. */
export function ConversationUsageBadge({ total }: ConversationUsageBadgeProps) {
  if (total.turns === 0) return null;
  const detail = formatUsageSummary(total);

  return (
    <span className="chat-usage-badge" title={`Total da conversa: ${detail}`}>
      {total.costUsd !== undefined ? formatCost(total.costUsd) : detail}
    </span>
  );
}
