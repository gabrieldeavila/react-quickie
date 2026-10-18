import { readMessageUsage } from "./read-message-usage";

type MessageLike = { role: string; metadata?: unknown };

/**
 * Share of the context window (0–100, rounded) the latest measured turn
 * used. Undefined without a known window or a measured turn.
 */
export function contextUsagePercent(
  messages: MessageLike[],
  contextWindow: number | undefined,
): number | undefined {
  if (!contextWindow) return undefined;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const tokens = readMessageUsage(messages[index])?.contextTokens;
    if (tokens !== undefined) {
      return Math.min(100, Math.round((tokens / contextWindow) * 100));
    }
  }
  return undefined;
}
