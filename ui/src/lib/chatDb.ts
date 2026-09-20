import Dexie, { type Table } from "dexie";
import type { UIMessage } from "ai";
import type {
  ChatConversation,
  ChatMessageRecord,
  ChatMessageRole,
} from "../../types/interface/chat-db.interface";

class ChatDatabase extends Dexie {
  conversations!: Table<ChatConversation, string>;
  messages!: Table<ChatMessageRecord, string>;

  constructor() {
    super("react-quickie-chat");

    this.version(3).stores({
      conversations: "id, updatedAt, lastMessageAt, createdAt",
      messages: "id, conversationId, createdAt, role",
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
  const firstUserMessage = records.find(
    (record) => record.role === "user",
  )?.content;
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
    const existing: ChatConversation | undefined =
      await chatDb.conversations.get(conversationId);

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
  parts?: UIMessage["parts"],
): Promise<ChatMessageRecord> => {
  const now: number = Date.now();
  const message: ChatMessageRecord = {
    id: createId(),
    conversationId,
    role,
    content,
    parts,
    createdAt: now,
  };

  await chatDb.transaction(
    "rw",
    chatDb.messages,
    chatDb.conversations,
    async () => {
      await chatDb.messages.put(message);
      await chatDb.conversations.update(conversationId, {
        updatedAt: now,
        lastMessageAt: now,
      });
    },
  );

  return message;
};

export const upsertMessage = async (
  message: ChatMessageRecord,
): Promise<void> => {
  await chatDb.messages.put(message);
};

const hasApprovalId = (message: ChatMessageRecord, approvalId: string): boolean => {
  return (message.parts ?? []).some((part) => {
    if (!part || typeof part !== "object") return false;

    const candidate = part as { approvalId?: unknown; output?: unknown };
    if (candidate.approvalId === approvalId) return true;
    if (!candidate.output || typeof candidate.output !== "object") return false;

    return "approvalId" in candidate.output && candidate.output.approvalId === approvalId;
  });
};

export const appendPartsToLatestAssistantMessage = async (
  conversationId: string,
  parts: UIMessage["parts"],
  approvalId?: string,
): Promise<void> => {
  const attempts = approvalId ? 20 : 1;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const messages = await listMessagesByConversation(conversationId);
    const assistantMessages = messages.filter(
      (message) => message.role === "assistant",
    );
    const targetMessage = approvalId
      ? [...assistantMessages].reverse().find((message) =>
          hasApprovalId(message, approvalId),
        )
      : assistantMessages.at(-1);

    if (targetMessage) {
      await chatDb.messages.update(targetMessage.id, {
        parts: [...(targetMessage.parts ?? []), ...parts],
      });
      return;
    }

    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
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
  await chatDb.transaction(
    "rw",
    chatDb.messages,
    chatDb.conversations,
    async () => {
      await chatDb.messages
        .where("conversationId")
        .equals(conversationId)
        .delete();
      await chatDb.conversations.delete(conversationId);
    },
  );
};

export const clearChatHistory = async (): Promise<void> => {
  await chatDb.transaction(
    "rw",
    chatDb.messages,
    chatDb.conversations,
    async () => {
      await chatDb.messages.clear();
      await chatDb.conversations.clear();
    },
  );
};
