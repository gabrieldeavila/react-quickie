import { useMemo } from "react";
import { contextUsagePercent } from "../domain/context-usage-percent";
import { sumConversationUsage } from "../domain/sum-conversation-usage";

type MessageLike = { role: string; metadata?: unknown };

/** Conversation totals and context share, recomputed when messages change. */
export function useConversationUsage(
  messages: MessageLike[],
  contextWindow: number | undefined,
) {
  const total = useMemo(() => sumConversationUsage(messages), [messages]);
  const contextPercent = useMemo(
    () => contextUsagePercent(messages, contextWindow),
    [messages, contextWindow],
  );

  return { total, contextPercent };
}
