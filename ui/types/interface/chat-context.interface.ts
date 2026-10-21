import type { Dispatch, RefObject, SetStateAction } from "react";
import type { UseChatHistoryResult } from "./history.interface";
import type { UIMessage } from "ai";
import type { useChat } from "@ai-sdk/react";
import type { useChatComposer } from "@/components/chat/hooks/start/useChatComposer";
import type { ProjectContext } from "./chat.interface";
import type { ConversationModel } from "@/features/models/hooks/useConversationModel";
import type { InstructionsState } from "@/features/instructions/hooks/useInstructions";
import type { InstructionSelection } from "@/features/instructions/hooks/useInstructionSelection";

export type ChatBaseContextValue = {
  isRootModalOpen: boolean;
  setIsRootModalOpen: Dispatch<SetStateAction<boolean>>;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  isInstructionsDialogOpen: boolean;
  setIsInstructionsDialogOpen: Dispatch<SetStateAction<boolean>>;
  isMcpDialogOpen: boolean;
  setIsMcpDialogOpen: Dispatch<SetStateAction<boolean>>;
  projectContext: ProjectContext;
  setProjectContext: Dispatch<SetStateAction<ProjectContext>>;
  draftContext: ProjectContext;
  setDraftContext: Dispatch<SetStateAction<ProjectContext>>;
  pendingConversationIdRef: RefObject<string | null>;
  assistantPersistedIdsRef: RefObject<Set<string>>;
  activeConversationIdRef: RefObject<string | null>;
  sendMessageRef: RefObject<
    ((message: { text: string; files?: import("ai").FileUIPart[] }) => Promise<void>) | null
  >;
  history: UseChatHistoryResult;
  initialMessages: UIMessage[];
  activeChatKey: string;
  activeConversationId: string | null;
  conversationModel: ConversationModel;
  instructions: InstructionsState;
  instructionSelection: InstructionSelection;
} & ReturnType<typeof useChat> &
  ReturnType<typeof useChatComposer>;

export type ChatServicesContextValue = {
  renderedMessages: UIMessage[];
  isChatPending: boolean;
  chatStatusLabel: string;
  handleCreateConversation: () => Promise<void>;
};
