import type { ConversationUsage } from "./message-usage.types";
import { readMessageUsage } from "./read-message-usage";
import { turnTokenTotals } from "./turn-token-totals";

type MessageLike = { role: string; metadata?: unknown };

/** Totals of every assistant turn that reported usage, extras included. */
export function sumConversationUsage(
  messages: MessageLike[],
): ConversationUsage {
  return messages.reduce<ConversationUsage>(
    (total, message) => {
      const metadata = readMessageUsage(message);
      if (!metadata?.usage) return total;
      const tokens = turnTokenTotals(metadata);

      return {
        inputTokens: total.inputTokens + tokens.inputTokens,
        outputTokens: total.outputTokens + tokens.outputTokens,
        costUsd:
          metadata.costUsd === undefined
            ? total.costUsd
            : (total.costUsd ?? 0) + metadata.costUsd,
        turns: total.turns + 1,
      };
    },
    { inputTokens: 0, outputTokens: 0, turns: 0 },
  );
}
