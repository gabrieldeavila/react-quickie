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

export const DEFAULT_CONVERSATION_TITLE = "Nova conversa";

export const getConversationTitle = (firstUserMessage: string): string => {
  const normalized: string = firstUserMessage.trim().replace(/\s+/g, " ");
  if (!normalized) return DEFAULT_CONVERSATION_TITLE;

  const maxLength: number = 42;
  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, maxLength).trimEnd()}…`;
};

export const isDefaultConversationTitle = (title: string): boolean => {
  return title.trim() === "" || title === DEFAULT_CONVERSATION_TITLE;
};

export const migrateDefaultConversationTitle = async (
  conversation: ChatConversation,
): Promise<ChatConversation> => {
  if (!isDefaultConversationTitle(conversation.title)) return conversation;

  const records = await listMessagesByConversation(conversation.id);
  const firstUserMessage = records.find((record) => record.role === "user")?.content;
  if (!firstUserMessage) return conversation;

  const renamedConversation: ChatConversation = {
    ...conversation,
    title: getConversationTitle(firstUserMessage),
    updatedAt: Date.now(),
  };

  await chatDb.conversations.put(renamedConversation);
  return renamedConversation;
};

export const migrateDefaultConversationTitles = async (): Promise<void> => {
  const conversations = await listConversations();
  await Promise.all(conversations.map(migrateDefaultConversationTitle));
};

const shouldRenameConversation = (title: string): boolean => {
  return isDefaultConversationTitle(title);
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

    if (existing) {
      if (firstUserMessage && shouldRenameConversation(existing.title)) {
        const renamedConversation: ChatConversation = {
          ...existing,
          title: getConversationTitle(firstUserMessage),
          updatedAt: now,
          lastMessageAt: now,
        };

        await chatDb.conversations.put(renamedConversation);
        return renamedConversation;
      }

      return existing;
    }
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
