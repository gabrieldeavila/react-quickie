import { useConversationUsage } from "../hooks/useConversationUsage";
import { ContextUsageBadge } from "./ContextUsageBadge";
import { ConversationUsageBadge } from "./ConversationUsageBadge";

type UsageHeaderBadgesProps = {
  messages: Array<{ role: string; metadata?: unknown }>;
  contextWindow: number | undefined;
};

export function UsageHeaderBadges({
  messages,
  contextWindow,
}: UsageHeaderBadgesProps) {
  const { total, contextPercent } = useConversationUsage(
    messages,
    contextWindow,
  );

  return (
    <>
      <ContextUsageBadge percent={contextPercent} />
      <ConversationUsageBadge total={total} />
    </>
  );
}
