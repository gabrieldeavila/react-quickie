import type { ChatMessageMetadata, TokenUsage } from "./message-usage.types";

type MessageLike = { role: string; metadata?: unknown };

const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

function isTokenUsage(value: unknown): value is TokenUsage {
  if (!value || typeof value !== "object") return false;
  const usage = value as Record<string, unknown>;
  return isCount(usage.inputTokens) && isCount(usage.outputTokens);
}

/**
 * The usage metadata of an assistant message, or undefined (user messages,
 * turns saved before Phase 6, aborted turns that never reached `finish`).
 */
export function readMessageUsage(
  message: MessageLike,
): ChatMessageMetadata | undefined {
  if (message.role !== "assistant") return undefined;
  const metadata = message.metadata as Record<string, unknown> | undefined;
  if (!metadata || typeof metadata.model !== "string") return undefined;

  return {
    model: metadata.model,
    usage: isTokenUsage(metadata.usage) ? metadata.usage : undefined,
    contextTokens: isCount(metadata.contextTokens)
      ? metadata.contextTokens
      : undefined,
    costUsd: isCount(metadata.costUsd) ? metadata.costUsd : undefined,
  };
}
