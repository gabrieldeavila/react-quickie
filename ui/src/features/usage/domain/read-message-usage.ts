import type {
  ChatMessageMetadata,
  ExtraUsage,
  TokenUsage,
} from "./message-usage.types";

type MessageLike = { role: string; metadata?: unknown };

const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

function isTokenUsage(value: unknown): value is TokenUsage {
  if (!value || typeof value !== "object") return false;
  const usage = value as Record<string, unknown>;
  return isCount(usage.inputTokens) && isCount(usage.outputTokens);
}

const SOURCES = new Set<unknown>(["subagent", "compaction"]);

function isExtraUsage(value: unknown): value is ExtraUsage {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    SOURCES.has(entry.source) &&
    typeof entry.model === "string" &&
    isTokenUsage(entry.usage) &&
    (entry.costUsd === undefined || isCount(entry.costUsd))
  );
}

function readExtraUsage(value: unknown): ExtraUsage[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const entries = value.filter(isExtraUsage);
  return entries.length > 0 ? entries : undefined;
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
    extraUsage: readExtraUsage(metadata.extraUsage),
    costUsd: isCount(metadata.costUsd) ? metadata.costUsd : undefined,
  };
}
