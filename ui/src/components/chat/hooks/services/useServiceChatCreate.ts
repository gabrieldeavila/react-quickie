import { useCallback } from "react";
import { useChatBaseContext } from "../../context/context";

const useServiceChatCreate = () => {
  const {
    pendingConversationIdRef,
    assistantPersistedIdsRef,
    clearInput,
    history,
    activeConversationIdRef,
  } = useChatBaseContext();

  const handleCreateConversation = useCallback(async (): Promise<void> => {
    pendingConversationIdRef.current = null;
    assistantPersistedIdsRef.current.clear();

    clearInput();
    history.setActiveConversationId(null);

    activeConversationIdRef.current = null;
    await history.createConversation();
  }, [
    pendingConversationIdRef,
    assistantPersistedIdsRef,
    clearInput,
    history,
    activeConversationIdRef,
  ]);

  return handleCreateConversation;
};

export default useServiceChatCreate;
