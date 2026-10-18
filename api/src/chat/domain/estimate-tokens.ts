import type { UIMessage } from 'ai';

export const CHARS_PER_TOKEN = 4;
/** Rough size of one image in the prompt (providers bill ~1–2k tokens). */
export const IMAGE_TOKENS = 1_600;

function isInlineData(value: unknown): boolean {
  return (
    value instanceof Uint8Array ||
    (typeof value === 'string' && value.startsWith('data:'))
  );
}

/**
 * chars/4 of the JSON form of anything (UI messages, model messages,
 * instructions). Inline file data (data URLs, bytes) counts as one image
 * instead of by its length.
 */
export function estimateTokens(value: unknown): number {
  let images = 0;
  const json =
    JSON.stringify(value, (_key, item: unknown) => {
      if (!isInlineData(item)) return item;
      images += 1;
      return '';
    }) ?? '';

  return Math.ceil(json.length / CHARS_PER_TOKEN) + images * IMAGE_TOKENS;
}

/** The real context size reported for an earlier assistant turn. */
function measuredContextTokens(message: UIMessage): number | undefined {
  if (message.role !== 'assistant') return undefined;
  const metadata = message.metadata as { contextTokens?: unknown } | undefined;
  const tokens = metadata?.contextTokens;
  return typeof tokens === 'number' && tokens > 0 ? tokens : undefined;
}

export type ContextEstimateInput = {
  messages: UIMessage[];
  /** Instructions, summary and anything else sent besides the messages. */
  fixedTokens: number;
};

/**
 * Tokens the next request will use. Starts from the real size the provider
 * reported for the latest assistant turn (it already includes instructions
 * and tools) and adds the heuristic for the messages after it. Without a
 * measured turn, everything is estimated.
 */
export function estimateContextTokens({
  messages,
  fixedTokens,
}: ContextEstimateInput): number {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const measured = measuredContextTokens(messages[index]);
    if (measured !== undefined) {
      return measured + estimateTokens(messages.slice(index + 1));
    }
  }
  return fixedTokens + estimateTokens(messages);
}

/** Applies the size change of a transformation to a calibrated estimate. */
export function scaleEstimate(
  estimate: number,
  before: number,
  after: number,
): number {
  return before > 0 ? Math.round((estimate * after) / before) : estimate;
}
