import type { UIMessage } from 'ai';
import type { TokenUsage } from 'src/llm/domain/token-usage.types';

/** Usage already recorded on the assistant message a request continues. */
export type CarriedUsage = { usage: TokenUsage; costUsd?: number };

const USAGE_KEYS: Array<keyof TokenUsage> = [
  'inputTokens',
  'outputTokens',
  'cacheReadTokens',
  'cacheWriteTokens',
  'reasoningTokens',
];

function isTokenUsage(value: unknown): value is TokenUsage {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return USAGE_KEYS.every(
    (key) => typeof record[key] === 'number' && record[key] >= 0,
  );
}

/**
 * After a tool approval the turn continues in a new request on the same
 * assistant message, and `finish` overwrites its metadata. The usage of the
 * part before the approval is read back here so the turn total includes it.
 * Comes from the client, so anything malformed is ignored.
 */
export function readCarriedUsage(
  messages: UIMessage[],
): CarriedUsage | undefined {
  const last = messages[messages.length - 1];
  if (last?.role !== 'assistant') return undefined;

  const metadata = last.metadata as
    { usage?: unknown; costUsd?: unknown } | undefined;
  if (!isTokenUsage(metadata?.usage)) return undefined;

  const { costUsd } = metadata;
  return {
    usage: metadata.usage,
    costUsd: typeof costUsd === 'number' && costUsd >= 0 ? costUsd : undefined,
  };
}
