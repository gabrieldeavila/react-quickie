import { type ReactNode, useMemo } from "react";
import useStartChatState from "../hooks/start/useStartChatState";
import { ChatServicesContext, useChatBaseContext } from "./context";
import useServiceChatCreate from "../hooks/services/useServiceChatCreate";

export function ChatServicesProvider({ children }: { children: ReactNode }) {
  const { activeConversationId, messages, status } = useChatBaseContext();
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
        ? "Error"
        : status === "ready"
          ? "Online"
          : "Responding",
    [status],
  );

  const handleCreateConversation = useServiceChatCreate();

  const value = useMemo(
    () => ({
      renderedMessages,
      isChatPending,
      chatStatusLabel,
      handleCreateConversation,
    }),
    [
      renderedMessages,
      isChatPending,
      chatStatusLabel,
      handleCreateConversation,
    ],
  );

  return <ChatServicesContext value={value}>{children}</ChatServicesContext>;
}
