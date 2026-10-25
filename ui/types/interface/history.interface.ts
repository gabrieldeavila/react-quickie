import type { UIMessage } from "@ai-sdk/react";
import type {
  ChatConversation,
  NewConversationFields,
} from "./chat-db.interface";

export interface UseChatHistoryResult {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  activeConversation: ChatConversation | undefined;
  setActiveConversationId: (conversationId: string | null) => void;
  historyMessages: UIMessage[];
  isHydrated: boolean;
  createConversation: (
    firstUserMessage?: string,
    initial?: NewConversationFields,
  ) => Promise<string>;
  persistUserMessage: (
    conversationId: string,
    content: string,
    parts?: UIMessage["parts"],
  ) => Promise<void>;
  /** Upserts by message id; called on every onFinish of the same message. */
  persistAssistantMessage: (
    conversationId: string,
    message: UIMessage,
  ) => Promise<void>;
  reloadConversations: () => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  resetHistory: () => Promise<void>;
}
