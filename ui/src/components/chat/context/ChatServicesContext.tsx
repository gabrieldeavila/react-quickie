import { type ReactNode, useMemo } from "react";
import useStartChatState from "../hooks/start/useStartChatState";
import { ChatServicesContext, useChatBaseContext } from "./context";
import useServiceChatCreate from "../hooks/services/useServiceChatCreate";
import { AgentFocusEnum } from "@/types/enum/agent.enum";

export function ChatServicesProvider({ children }: { children: ReactNode }) {
  const { activeConversationId, messages, status, projectContext } =
    useChatBaseContext();
  useStartChatState();

  const renderedMessages = useMemo(() => {
    if (!activeConversationId) return [];
    return messages.filter(
      (message) => message.id !== "typing" && message.id !== "error",
    );
  }, [activeConversationId, messages]);

  const isChatPending: boolean = useMemo(
    () => status === "submitted" || status === "streaming",
    [status],
  );

  const chatStatusLabel: string = useMemo(
    () =>
      status === "error"
        ? "Erro"
        : status === "ready"
          ? "Online"
          : "Respondendo",
    [status],
  );

  const isFrontendMode: boolean = useMemo(
    () => projectContext.focus === AgentFocusEnum.FRONTEND,
    [projectContext.focus],
  );

  const handleCreateConversation = useServiceChatCreate();

  const value = useMemo(
    () => ({
      renderedMessages,
      isChatPending,
      chatStatusLabel,
      handleCreateConversation,
      isFrontendMode,
    }),
    [
      chatStatusLabel,
      handleCreateConversation,
      isChatPending,
      isFrontendMode,
      renderedMessages,
    ],
  );

  return <ChatServicesContext value={value}>{children}</ChatServicesContext>;
}
