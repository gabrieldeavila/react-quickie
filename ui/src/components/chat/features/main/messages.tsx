import type { UIMessage } from "ai";
import { memo, useEffect, useMemo, useRef } from "react";
import {
  useChatBaseContext,
  useChatServicesContext,
} from "../../context/context";
import { MAX_VISIBLE_MESSAGES } from "~types/consts/project.const";
import { ChatEmptyState } from "./empty";
import { ChatMessageItem } from "./messageItem";

const ChatMessagesList = memo(() => {
  const { messages } = useChatBaseContext();
  const { isChatPending } = useChatServicesContext();

  const isEmpty: boolean = messages.length === 0;
  const endRef = useRef<HTMLDivElement | null>(null);

  const visibleMessages: UIMessage[] = useMemo(() => {
    if (messages.length <= MAX_VISIBLE_MESSAGES) return messages;
    return messages.slice(messages.length - MAX_VISIBLE_MESSAGES);
  }, [messages]);

  useEffect(() => {
    if (isEmpty && !isChatPending) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isEmpty, isChatPending, visibleMessages.length]);

  return (
    <div
      className="chat-messages"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {isEmpty ? (
        <ChatEmptyState />
      ) : (
        visibleMessages.map((message) => (
          <ChatMessageItem key={message.id} message={message} />
        ))
      )}

      {isChatPending ? (
        <ChatMessageItem
          message={
            {
              id: "typing",
              role: "assistant",
              parts: [{ type: "text", text: "" }],
            } as UIMessage
          }
          isTyping
        />
      ) : null}

      <div ref={endRef} aria-hidden="true" />
    </div>
  );
});

export default ChatMessagesList;
