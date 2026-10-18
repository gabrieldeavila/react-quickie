import type { ConversationUsage } from "./message-usage.types";
import { readMessageUsage } from "./read-message-usage";

type MessageLike = { role: string; metadata?: unknown };

/** Totals of every assistant turn that reported usage. */
export function sumConversationUsage(
  messages: MessageLike[],
): ConversationUsage {
  return messages.reduce<ConversationUsage>(
    (total, message) => {
      const metadata = readMessageUsage(message);
      if (!metadata?.usage) return total;

      return {
        inputTokens: total.inputTokens + metadata.usage.inputTokens,
        outputTokens: total.outputTokens + metadata.usage.outputTokens,
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
