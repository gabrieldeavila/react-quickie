import { chatDb } from "@/lib/chatDb";

/** Stores the conversation's `provider:model` (Dexie v4 field). */
export async function saveConversationModel(
  conversationId: string,
  model: string,
): Promise<void> {
  await chatDb.conversations.update(conversationId, { model });
}
