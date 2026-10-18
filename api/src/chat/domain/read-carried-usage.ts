import type { UIMessage } from 'ai';
import { isCost, isTokenUsage } from 'src/llm/domain/is-token-usage';
import type { TokenUsage } from 'src/llm/domain/token-usage.types';
import type { ExtraUsage } from './chat-message-metadata.types';

/** Usage already recorded on the assistant message a request continues. */
export type CarriedUsage = {
  usage: TokenUsage;
  /** Whole turn so far, extras included. */
  costUsd?: number;
  extraUsage?: ExtraUsage[];
};

const SOURCES = new Set<unknown>(['subagent', 'compaction']);

function toExtraUsage(value: unknown): ExtraUsage | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const entry = value as Record<string, unknown>;
  if (!SOURCES.has(entry.source) || typeof entry.model !== 'string') {
    return undefined;
  }
  if (!isTokenUsage(entry.usage)) return undefined;
  return {
    source: entry.source as ExtraUsage['source'],
    model: entry.model,
    usage: entry.usage,
    costUsd: isCost(entry.costUsd) ? entry.costUsd : undefined,
  };
}

function readExtraUsage(value: unknown): ExtraUsage[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const entries = value
    .map(toExtraUsage)
    .filter((entry): entry is ExtraUsage => entry !== undefined);
  return entries.length > 0 ? entries : undefined;
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
    { usage?: unknown; costUsd?: unknown; extraUsage?: unknown } | undefined;
  if (!isTokenUsage(metadata?.usage)) return undefined;

  return {
    usage: metadata.usage,
    costUsd: isCost(metadata.costUsd) ? metadata.costUsd : undefined,
    extraUsage: readExtraUsage(metadata.extraUsage),
  };
}
