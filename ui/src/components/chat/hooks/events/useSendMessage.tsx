import { useCallback } from "react";
import { useChatBaseContext } from "../../context/context";

const useSendMessage = () => {
  const {
    input,
    status,
    clearError,
    history,
    activeConversationIdRef,
    pendingConversationIdRef,
    sendMessageRef,
    clearInput,
    pastedImages,
  } = useChatBaseContext();

  const handleSendMessage = useCallback(async () => {
    const trimmedInput: string = input.trim();
    if (
      (!trimmedInput && pastedImages.length === 0) ||
      (status !== "ready" && status !== "error")
    ) {
      return;
    }

    const userParts = pastedImages.map((image) => ({
      type: image.type,
      mediaType: image.mediaType,
      filename: image.filename,
      url: image.url,
    }));
    const title = trimmedInput || "Imagem";
    const conversationId: string =
      activeConversationIdRef.current ??
      (await history.createConversation(title));
    activeConversationIdRef.current = conversationId;
    pendingConversationIdRef.current = conversationId;
    const persistedParts = [
      ...(trimmedInput ? [{ type: "text" as const, text: trimmedInput }] : []),
      ...userParts,
    ];
    await history.persistUserMessage(conversationId, trimmedInput, persistedParts);
    clearError();
    void sendMessageRef.current?.({
      text: trimmedInput,
      ...(userParts.length > 0 ? { files: userParts } : {}),
    });
    clearInput();
  }, [
    activeConversationIdRef,
    clearError,
    clearInput,
    history,
    input,
    pastedImages,
    pendingConversationIdRef,
    sendMessageRef,
    status,
  ]);

  return handleSendMessage;
};

export default useSendMessage;
