import { chatDb } from "@/lib/chatDb";

/** Stores whether auto mode is on for the conversation (Dexie v6 field). */
export async function saveConversationAutoApprove(
  conversationId: string,
  autoApprove: boolean,
): Promise<void> {
  await chatDb.conversations.update(conversationId, { autoApprove });
}
