import {
  readActiveConversationId,
  serializeProjectContext,
} from "@/helpers/chat.helper";
import { useEffect, useRef } from "react";
import { useChatBaseContext } from "../../context/context";
import {
  ACTIVE_CHAT_STORAGE_KEY,
  PROJECT_CONTEXT_STORAGE_KEY,
  SIDEBAR_OPEN_STORAGE_KEY,
} from "~types/consts/chat.const";

const useStartChatState = () => {
  const {
    activeConversationIdRef,
    history,
    isSidebarOpen,
    projectContext,
    setDraftContext,
    sendMessageRef,
    sendMessage,
    setMessages,
    initialMessages,
    activeConversationId,
    status,
  } = useChatBaseContext();

  const synchronizedMessagesRef = useRef(initialMessages);
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    activeConversationIdRef.current = history.activeConversationId;
  }, [activeConversationIdRef, history.activeConversationId]);

  useEffect(() => {
    const storedConversationId: string | null = readActiveConversationId();

    if (storedConversationId) {
      history.setActiveConversationId(storedConversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.setActiveConversationId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      SIDEBAR_OPEN_STORAGE_KEY,
      String(isSidebarOpen),
    );
  }, [isSidebarOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      PROJECT_CONTEXT_STORAGE_KEY,
      serializeProjectContext(projectContext),
    );
  }, [projectContext]);

  useEffect(() => {
    setDraftContext(projectContext);
  }, [projectContext, setDraftContext]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (history.activeConversationId) {
      window.localStorage.setItem(
        ACTIVE_CHAT_STORAGE_KEY,
        history.activeConversationId,
      );
      return;
    }
    window.localStorage.removeItem(ACTIVE_CHAT_STORAGE_KEY);
  }, [history.activeConversationId]);

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage, sendMessageRef]);

  useEffect(() => {
    if (statusRef.current !== "ready") return;
    if (synchronizedMessagesRef.current === initialMessages) return;

    synchronizedMessagesRef.current = initialMessages;
    setMessages(initialMessages);
  }, [initialMessages, setMessages, activeConversationId]);
};

export default useStartChatState;
