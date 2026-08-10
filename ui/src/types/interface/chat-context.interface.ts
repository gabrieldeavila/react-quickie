import type { Dispatch, RefObject, SetStateAction } from "react";
import type { UseChatHistoryResult } from "./history.interface";
import type { UIMessage } from "ai";
import type { useChat } from "@ai-sdk/react";
import type { useChatComposer } from "@/components/chat/hooks/start/useChatComposer";
import type { ProjectContext } from "./chat.interface";

export type ChatBaseContextValue = {
  isRootModalOpen: boolean;
  setIsRootModalOpen: Dispatch<SetStateAction<boolean>>;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  projectContext: ProjectContext;
  setProjectContext: Dispatch<SetStateAction<ProjectContext>>;
  draftContext: ProjectContext;
  setDraftContext: Dispatch<SetStateAction<ProjectContext>>;
  pendingConversationIdRef: RefObject<string | null>;
  assistantPersistedIdsRef: RefObject<Set<string>>;
  activeConversationIdRef: RefObject<string | null>;
  sendMessageRef: RefObject<
    ((message: { text: string }) => Promise<void>) | null
  >;
  history: UseChatHistoryResult;
  initialMessages: UIMessage[];
  activeChatKey: string;
  activeConversationId: string | null;
} & ReturnType<typeof useChat> &
  ReturnType<typeof useChatComposer>;

export type ChatServicesContextValue = {
  renderedMessages: UIMessage[];
  isChatPending: boolean;
  chatStatusLabel: string;
  isFrontendMode: boolean;
  handleCreateConversation: () => Promise<void>;
};
