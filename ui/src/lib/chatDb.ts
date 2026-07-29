import Dexie, { type Table } from "dexie";

export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  lastMessageAt: number;
  metadata?: Record<string, unknown>;
  attachments?: unknown[];
}

export interface ChatMessageRecord {
  id: string;
  conversationId: string;
  role: ChatMessageRole;
  content: string;
  createdAt: number;
  tokens?: number;
  metadata?: Record<string, unknown>;
  attachments?: unknown[];
}

class ChatDatabase extends Dexie {
  conversations!: Table<ChatConversation, string>;
  messages!: Table<ChatMessageRecord, string>;

  constructor() {
    super("react-quickie-chat");

    this.version(1).stores({
      conversations: "id, updatedAt, lastMessageAt, createdAt",
      messages: "id, conversationId, createdAt",
    });
  }
}

export const chatDb: ChatDatabase = new ChatDatabase();

export const createId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

export const getConversationTitle = (firstUserMessage: string): string => {
  const normalized: string = firstUserMessage.trim().replace(/\s+/g, " ");
  if (!normalized) return "Nova conversa";

  const maxLength: number = 42;
  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, maxLength).trimEnd()}…`;
};

export const ensureConversation = async (
  conversationId?: string,
  firstUserMessage?: string,
): Promise<ChatConversation> => {
  const now: number = Date.now();

  if (conversationId) {
    const existing: ChatConversation | undefined = await chatDb.conversations.get(
      conversationId,
    );

    if (existing) return existing;
  }

  const conversation: ChatConversation = {
    id: conversationId ?? createId(),
    title: getConversationTitle(firstUserMessage ?? "Nova conversa"),
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
  };

  await chatDb.conversations.put(conversation);
  return conversation;
};

export const appendMessage = async (
  conversationId: string,
  role: ChatMessageRole,
  content: string,
): Promise<ChatMessageRecord> => {
  const now: number = Date.now();
  const message: ChatMessageRecord = {
    id: createId(),
    conversationId,
    role,
    content,
    createdAt: now,
  };

  await chatDb.transaction("rw", chatDb.messages, chatDb.conversations, async () => {
    await chatDb.messages.add(message);
    await chatDb.conversations.update(conversationId, {
      updatedAt: now,
      lastMessageAt: now,
    });
  });

  return message;
};

export const listConversations = async (): Promise<ChatConversation[]> => {
  return chatDb.conversations.orderBy("lastMessageAt").reverse().toArray();
};

export const getConversationById = async (
  conversationId: string,
): Promise<ChatConversation | undefined> => {
  return chatDb.conversations.get(conversationId);
};

export const listMessagesByConversation = async (
  conversationId: string,
): Promise<ChatMessageRecord[]> => {
  return chatDb.messages
    .where("conversationId")
    .equals(conversationId)
    .sortBy("createdAt");
};

export const deleteConversationCascade = async (
  conversationId: string,
): Promise<void> => {
  await chatDb.transaction("rw", chatDb.messages, chatDb.conversations, async () => {
    await chatDb.messages.where("conversationId").equals(conversationId).delete();
    await chatDb.conversations.delete(conversationId);
  });
};

export const clearChatHistory = async (): Promise<void> => {
  await chatDb.transaction("rw", chatDb.messages, chatDb.conversations, async () => {
    await chatDb.messages.clear();
    await chatDb.conversations.clear();
  });
};
