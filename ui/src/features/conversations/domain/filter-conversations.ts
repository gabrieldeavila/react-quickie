import type { ChatConversation } from "~types/interface/chat-db.interface";

/** Lowercase, accents stripped and whitespace collapsed, so "Café" matches "cafe". */
export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function matchesEveryWord(title: string, words: string[]): boolean {
  const normalizedTitle = normalizeSearchText(title);
  return words.every((word) => normalizedTitle.includes(word));
}

/** Most recent activity first; ties fall back to the last update. */
export function compareByRecency(
  a: ChatConversation,
  b: ChatConversation,
): number {
  return b.lastMessageAt - a.lastMessageAt || b.updatedAt - a.updatedAt;
}

/**
 * Conversations whose title contains every word of the query, most recent
 * first. An empty query returns every conversation. Never mutates the input.
 */
export function filterConversations(
  conversations: ChatConversation[],
  query: string,
): ChatConversation[] {
  const normalizedQuery = normalizeSearchText(query);
  const words = normalizedQuery ? normalizedQuery.split(" ") : [];
  return conversations
    .filter((conversation) => matchesEveryWord(conversation.title, words))
    .sort(compareByRecency);
}
