import { chatDb } from "@/lib/chatDb";

/** Stores the conversation's selected instruction ids (Dexie v5 field). */
export async function saveConversationInstructions(
  conversationId: string,
  instructionIds: string[],
): Promise<void> {
  await chatDb.conversations.update(conversationId, { instructionIds });
}
