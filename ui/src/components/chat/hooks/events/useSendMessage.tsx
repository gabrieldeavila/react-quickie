import { useCallback } from "react";
import { useChatBaseContext } from "../../context/context";

const useSendMessage = () => {
  const {
    input,
    status,
    history,
    activeConversationIdRef,
    pendingConversationIdRef,
    sendMessageRef,
    clearInput,
  } = useChatBaseContext();

  const handleSendMessage = useCallback(async () => {
    const trimmedInput: string = input.trim();
    if (!trimmedInput || status !== "ready") return;

    const conversationId: string =
      activeConversationIdRef.current ??
      (await history.createConversation(trimmedInput));
    activeConversationIdRef.current = conversationId;
    pendingConversationIdRef.current = conversationId;
    await history.persistUserMessage(conversationId, trimmedInput);
    sendMessageRef.current?.({ text: trimmedInput });
    clearInput();
  }, [
    activeConversationIdRef,
    clearInput,
    history,
    input,
    pendingConversationIdRef,
    sendMessageRef,
    status,
  ]);

  return handleSendMessage;
};

export default useSendMessage;
