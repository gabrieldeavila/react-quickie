import {
  findLatestCompaction,
  type ContextCompaction,
} from "./find-latest-compaction";

type MessageLike = {
  id?: string;
  parts?: Array<{ type: string; data?: unknown }>;
};

export type CompactedRequest<T> = {
  messages: T[];
  compaction?: ContextCompaction;
};

/**
 * What a request sends after a compaction: the summary plus the messages
 * after `upToMessageId`. If that message is gone (deleted, or the history
 * changed), the full conversation is sent and the API compacts again.
 */
export function applyCompaction<T extends MessageLike>(
  messages: T[],
): CompactedRequest<T> {
  const compaction = findLatestCompaction(messages);
  if (!compaction) return { messages };

  const cut = messages.findIndex(
    (message) => message.id === compaction.upToMessageId,
  );
  if (cut < 0) return { messages };

  return { messages: messages.slice(cut + 1), compaction };
}
