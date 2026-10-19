import { InvalidChatMessagesError } from './invalid-chat-messages.error';

/** Body of the `data-compaction` part, and the chat body's `compaction`. */
export type ContextCompaction = {
  summary: string;
  /** Last summarized message; later requests send only what follows it. */
  upToMessageId: string;
};

export const COMPACTION_DATA_TYPE = 'data-compaction';

const MAX_SUMMARY_CHARS = 100_000;
const INVALID_COMPACTION = 'Invalid conversation summary.';

function isValid(value: Record<string, unknown>): boolean {
  return (
    typeof value.summary === 'string' &&
    value.summary.trim().length > 0 &&
    value.summary.length <= MAX_SUMMARY_CHARS &&
    typeof value.upToMessageId === 'string'
  );
}

/** The chat body's `compaction`: absent → undefined, malformed → 400. */
export function parseCompaction(raw: unknown): ContextCompaction | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== 'object' || !isValid(raw as Record<string, unknown>)) {
    throw new InvalidChatMessagesError(INVALID_COMPACTION);
  }
  const { summary, upToMessageId } = raw as ContextCompaction;
  return { summary, upToMessageId };
}
