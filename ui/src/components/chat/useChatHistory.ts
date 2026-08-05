import { type UIMessage } from "@ai-sdk/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  appendMessage,
  clearChatHistory,
  deleteConversationCascade,
  ensureConversation,
  listConversations,
  listMessagesByConversation,
  migrateDefaultConversationTitles,
  type ChatConversation,
} from "../../lib/chatDb";

export interface UseChatHistoryResult {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  activeConversation: ChatConversation | undefined;
  setActiveConversationId: (conversationId: string | null) => void;
  historyMessages: UIMessage[];
  isHydrated: boolean;
  createConversation: (firstUserMessage?: string) => Promise<string>;
  persistUserMessage: (
    conversationId: string,
    content: string,
  ) => Promise<void>;
  persistAssistantMessage: (
    conversationId: string,
    content: string,
  ) => Promise<void>;
  reloadConversations: () => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  resetHistory: () => Promise<void>;
}

export const useChatHistory = (): UseChatHistoryResult => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [historyMessages, setHistoryMessages] = useState<UIMessage[]>([]);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  const reloadConversations = useCallback(async (): Promise<void> => {
    await migrateDefaultConversationTitles();

    const data: ChatConversation[] = await listConversations();
    setConversations(data);
    setActiveConversationId((current) => current ?? data[0]?.id ?? null);
  }, []);

  useEffect(() => {
    const hydrate = async (): Promise<void> => {
      await reloadConversations();
      setIsHydrated(true);
    };

    void hydrate();
  }, [reloadConversations]);

  useEffect(() => {
    const syncHistory = async (): Promise<void> => {
      if (!activeConversationId) {
        setHistoryMessages([]);
        return;
      }

      const records = await listMessagesByConversation(activeConversationId);
      setHistoryMessages(
        records.map((record) => ({
          id: record.id,
          role: record.role,
          parts: [{ type: "text", text: record.content }],
        })),
      );
    };

    void syncHistory();
  }, [activeConversationId]);

  const createConversation = useCallback(
    async (firstUserMessage?: string): Promise<string> => {
      const conversation = await ensureConversation(
        undefined,
        firstUserMessage,
      );
      await reloadConversations();
      setActiveConversationId(conversation.id);
      return conversation.id;
    },
    [reloadConversations],
  );

  const persistUserMessage = useCallback(
    async (conversationId: string, content: string): Promise<void> => {
      await ensureConversation(conversationId, content);
      await appendMessage(conversationId, "user", content);
      await reloadConversations();
    },
    [reloadConversations],
  );

  const persistAssistantMessage = useCallback(
    async (conversationId: string, content: string): Promise<void> => {
      await ensureConversation(conversationId);
      await appendMessage(conversationId, "assistant", content);
      await reloadConversations();
    },
    [reloadConversations],
  );

  const deleteConversation = useCallback(
    async (conversationId: string): Promise<void> => {
      await deleteConversationCascade(conversationId);
      setConversations((current) =>
        current.filter((item) => item.id !== conversationId),
      );
      setActiveConversationId((current) =>
        current === conversationId ? null : current,
      );
      await reloadConversations();
    },
    [reloadConversations],
  );

  const resetHistory = useCallback(async (): Promise<void> => {
    await clearChatHistory();
    setConversations([]);
    setActiveConversationId(null);
    setHistoryMessages([]);
  }, []);

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === activeConversationId,
      ),
    [activeConversationId, conversations],
  );

  return useMemo(
    () => ({
      conversations,
      activeConversationId,
      activeConversation,
      setActiveConversationId,
      historyMessages,
      isHydrated,
      createConversation,
      persistUserMessage,
      persistAssistantMessage,
      reloadConversations,
      deleteConversation,
      resetHistory,
    }),
    [
      activeConversation,
      activeConversationId,
      conversations,
      createConversation,
      deleteConversation,
      historyMessages,
      isHydrated,
      persistAssistantMessage,
      persistUserMessage,
      reloadConversations,
      resetHistory,
    ],
  );
};
