import type { UIMessage } from "ai";
import { chatDb } from "@/lib/chatDb";
import { toAssistantRecord } from "../domain/to-assistant-record";

/** Upserts an assistant message by its useChat id (safe to call on every onFinish). */
export async function saveAssistantMessage(
  conversationId: string,
  message: UIMessage,
): Promise<void> {
  const now = Date.now();

  await chatDb.transaction(
    "rw",
    chatDb.messages,
    chatDb.conversations,
    async () => {
      const existing = await chatDb.messages.get(message.id);
      await chatDb.messages.put(
        toAssistantRecord(conversationId, message, existing, now),
      );
      await chatDb.conversations.update(conversationId, {
        updatedAt: now,
        lastMessageAt: now,
      });
    },
  );
}
