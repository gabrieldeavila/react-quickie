import { type ReactNode, useMemo, useRef, useState } from "react";
import {
  getMessageText,
  readProjectContext,
  readSidebarOpenState,
} from "../../../helpers/chat.helper";
import type { ProjectContext } from "../../../types/interface/chat.interface";
import { useChatHistory } from "../hooks/start/useChatHistory";
import { ChatBaseContext } from "./context";
import { createChatTransport } from "@/helpers/chat.transport.helper";
import { useChat } from "@ai-sdk/react";
import { useChatComposer } from "../hooks/start/useChatComposer";

export function ChatBaseProvider({ children }: { children: ReactNode }) {
  const [isRootModalOpen, setIsRootModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const [isSidebarOpen, setIsSidebarOpen] =
    useState<boolean>(readSidebarOpenState);
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
        focus: projectContext.focus,
        specialty: projectContext.specialty,
        planningModeEnabled: projectContext.planningModeEnabled,
      }),
    [
      projectContext.focus,
      projectContext.planningModeEnabled,
      projectContext.reference,
      projectContext.specialty,
    ],
  );

  const chat = useChat({
    transport,
    id: activeConversationId ?? undefined,
    messages: initialMessages,
    onError: () => {
      pendingConversationIdRef.current = null;
    },
    onFinish: ({ message }) => {
      const content = getMessageText(message).trim();
      if (activeConversationId && content) {
        history.persistAssistantMessage(activeConversationId, content);
      }
    },
  });

  const value = useMemo(
    () => ({
      isRootModalOpen,
      setIsRootModalOpen,
      isCreateModalOpen,
      setIsCreateModalOpen,
      isSidebarOpen,
      setIsSidebarOpen,
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
      ...chat,
      ...chatComposer,
    }),
    [
      isRootModalOpen,
      isCreateModalOpen,
      isSidebarOpen,
      projectContext,
      draftContext,
      history,
      initialMessages,
      activeChatKey,
      activeConversationId,
      chat,
      chatComposer,
    ],
  );

  return <ChatBaseContext value={value}>{children}</ChatBaseContext>;
}
