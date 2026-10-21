import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  lastAssistantMessageIsCompleteWithApprovalResponses,
  type UIMessage,
} from "ai";
import { createChatTransport } from "@/helpers/chat.transport.helper";
import { shouldPersistAssistantMessage } from "@/features/chat/domain/to-assistant-record";
import { useConversationModel } from "@/features/models/hooks/useConversationModel";
import { useInstructions } from "@/features/instructions/hooks/useInstructions";
import { useInstructionSelection } from "@/features/instructions/hooks/useInstructionSelection";
import { useHostSelection } from "@/host/hooks/useHostSelection";
import { readProjectContext } from "../../../helpers/chat.helper";
import { useChatComposer } from "../hooks/start/useChatComposer";
import { useChatHistory } from "../hooks/start/useChatHistory";
import type { ProjectContext } from "~types/interface/chat.interface";
import { ChatBaseContext } from "./context";

export function ChatBaseProvider({ children }: { children: ReactNode }) {
  const [isRootModalOpen, setIsRootModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isInstructionsDialogOpen, setIsInstructionsDialogOpen] =
    useState<boolean>(false);
  const [isMcpDialogOpen, setIsMcpDialogOpen] = useState<boolean>(false);

  const [projectContext, setProjectContext] =
    useState<ProjectContext>(readProjectContext);
  const [draftContext, setDraftContext] =
    useState<ProjectContext>(readProjectContext);

  const pendingConversationIdRef = useRef<string | null>(null);
  const assistantPersistedIdsRef = useRef<Set<string>>(new Set());
  const activeConversationIdRef = useRef<string | null>(null);

  const sendMessageRef = useRef<
    ((message: { text: string }) => Promise<void>) | null
  >(null);

  const history = useChatHistory();
  const chatComposer = useChatComposer();
  useHostSelection(chatComposer.setInput);
  const conversationModel = useConversationModel({
    conversation: history.activeConversation,
    reloadConversations: history.reloadConversations,
  });
  const instructions = useInstructions(projectContext.reference);
  const instructionSelection = useInstructionSelection({
    root: projectContext.reference,
    conversation: history.activeConversation,
    available: instructions.instructions,
    reloadConversations: history.reloadConversations,
  });

  const activeConversationId = useMemo(
    () => history.activeConversationId,
    [history.activeConversationId],
  );

  const initialMessages = useMemo(() => {
    if (!activeConversationId) return [];
    return history.historyMessages;
  }, [activeConversationId, history.historyMessages]);

  const activeChatKey = useMemo(
    () => activeConversationId ?? "no-active-chat",
    [activeConversationId],
  );

  const transport = useMemo(
    () =>
      createChatTransport({
        projectRoot: projectContext.reference,
        instructionIds: instructionSelection.selectedIds,
        model: conversationModel.modelRef,
        modelTarget: conversationModel.target,
      }),
    [
      projectContext.reference,
      instructionSelection.selectedIds,
      conversationModel.modelRef,
      conversationModel.target,
    ],
  );

  const handleError = useCallback((error: unknown) => {
    console.log(error);
    pendingConversationIdRef.current = null;
  }, []);

  // Fires once when a tool approval is requested and again after the
  // approved/denied turn continues; the upsert keeps one record per message.
  const handleFinish = useCallback(
    ({ message }: { message: UIMessage }) => {
      if (!activeConversationId || !shouldPersistAssistantMessage(message)) {
        return;
      }
      void history.persistAssistantMessage(activeConversationId, message);
    },
    [activeConversationId, history],
  );

  const chat = useChat({
    transport,
    id: activeConversationId ?? undefined,
    messages: initialMessages,
    onError: handleError,
    onFinish: handleFinish,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });

  const value = useMemo(
    () => ({
      isRootModalOpen,
      setIsRootModalOpen,
      isCreateModalOpen,
      setIsCreateModalOpen,
      isInstructionsDialogOpen,
      setIsInstructionsDialogOpen,
      isMcpDialogOpen,
      setIsMcpDialogOpen,
      projectContext,
      setProjectContext,
      draftContext,
      setDraftContext,
      pendingConversationIdRef,
      assistantPersistedIdsRef,
      activeConversationIdRef,
      sendMessageRef,
      history,
      initialMessages,
      activeChatKey,
      activeConversationId,
      conversationModel,
      instructions,
      instructionSelection,
      ...chat,
      ...chatComposer,
    }),
    [
      isRootModalOpen,
      isCreateModalOpen,
      isInstructionsDialogOpen,
      isMcpDialogOpen,
      projectContext,
      draftContext,
      history,
      initialMessages,
      activeChatKey,
      activeConversationId,
      conversationModel,
      instructions,
      instructionSelection,
      chat,
      chatComposer,
    ],
  );

  return <ChatBaseContext value={value}>{children}</ChatBaseContext>;
}
