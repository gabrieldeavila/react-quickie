/** Body of the API's `data-compaction` part and of the chat body's `compaction`. */
export type ContextCompaction = {
  summary: string;
  /** Last summarized message; later requests send only what follows it. */
  upToMessageId: string;
};

export const COMPACTION_PART_TYPE = "data-compaction";

type MessageLike = { parts?: Array<{ type: string; data?: unknown }> };

export function isContextCompaction(
  value: unknown,
): value is ContextCompaction {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return (
    typeof data.summary === "string" &&
    data.summary.length > 0 &&
    typeof data.upToMessageId === "string"
  );
}

/**
 * The newest compaction in the conversation. It lives as a part of the
 * assistant message whose request produced it, so it is persisted with that
 * message and each new compaction supersedes the older ones.
 */
export function findLatestCompaction(
  messages: MessageLike[],
): ContextCompaction | undefined {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const parts = messages[index].parts ?? [];
    for (let partIndex = parts.length - 1; partIndex >= 0; partIndex -= 1) {
      const part = parts[partIndex];
      if (
        part.type === COMPACTION_PART_TYPE &&
        isContextCompaction(part.data)
      ) {
        return part.data;
      }
    }
  }
  return undefined;
}
