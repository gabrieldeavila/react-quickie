import { useConversationUsage } from "../hooks/useConversationUsage";
import { ContextUsageBadge } from "./ContextUsageBadge";
import { ConversationUsageBadge } from "./ConversationUsageBadge";

type UsageBadgesProps = {
  messages: Array<{ role: string; metadata?: unknown }>;
  contextWindow: number | undefined;
};

export function UsageBadges({ messages, contextWindow }: UsageBadgesProps) {
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
