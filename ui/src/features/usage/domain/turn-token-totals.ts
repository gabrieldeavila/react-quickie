import type { ChatMessageMetadata } from "./message-usage.types";

export type TokenTotals = { inputTokens: number; outputTokens: number };

/** Tokens of the whole turn: the main model plus subagents and summaries. */
export function turnTokenTotals(metadata: ChatMessageMetadata): TokenTotals {
  const all = [
    ...(metadata.usage ? [metadata.usage] : []),
    ...(metadata.extraUsage ?? []).map((extra) => extra.usage),
  ];
  return all.reduce<TokenTotals>(
    (total, usage) => ({
      inputTokens: total.inputTokens + usage.inputTokens,
      outputTokens: total.outputTokens + usage.outputTokens,
    }),
    { inputTokens: 0, outputTokens: 0 },
  );
}
