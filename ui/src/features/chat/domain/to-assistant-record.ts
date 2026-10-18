import type { UIMessage } from "ai";
import type { ChatMessageRecord } from "~types/interface/chat-db.interface";

function messageText(message: UIMessage): string {
  return message.parts
    .flatMap((part) => (part.type === "text" ? [part.text] : []))
    .join("")
    .trim();
}

function mergeMetadata(
  stored: ChatMessageRecord["metadata"],
  incoming: unknown,
): ChatMessageRecord["metadata"] {
  if (!incoming || typeof incoming !== "object") return stored;
  return { ...stored, ...(incoming as Record<string, unknown>) };
}

/**
 * The record stored for an assistant message, keyed by the useChat message id.
 * `onFinish` fires more than once for the same message (when an approval is
 * requested, then again after it is answered and the turn continues), each
 * time with the full accumulated parts. So the record replaces its parts
 * instead of appending, and keeps its original `createdAt` (list order).
 */
export function toAssistantRecord(
  conversationId: string,
  message: UIMessage,
  existing: ChatMessageRecord | undefined,
  now: number,
): ChatMessageRecord {
  return {
    ...existing,
    id: message.id,
    conversationId,
    role: "assistant",
    content: messageText(message),
    parts: message.parts,
    // Turn usage arrives as message metadata; earlier stored fields are kept.
    metadata: mergeMetadata(existing?.metadata, message.metadata),
    createdAt: existing?.createdAt ?? now,
  };
}

/** Empty placeholders (failed or aborted before any output) are not stored. */
export function shouldPersistAssistantMessage(message: UIMessage): boolean {
  return message.role === "assistant" && message.parts.length > 0;
}
