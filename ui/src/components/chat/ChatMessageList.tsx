import type { UIMessage } from "@ai-sdk/react";
import { useEffect, useMemo, useRef } from "react";
import { ChatEmptyState } from "./ChatEmptyState";
import { ChatMessageItem } from "./ChatMessageItem";

type ChatMessageListProps = {
  messages: UIMessage[];
  isPending: boolean;
};

const MAX_VISIBLE_MESSAGES = 500;

export function ChatMessageList({ messages, isPending }: ChatMessageListProps) {
  const isEmpty: boolean = messages.length === 0;
  const endRef = useRef<HTMLDivElement | null>(null);

  const visibleMessages: UIMessage[] = useMemo(() => {
    if (messages.length <= MAX_VISIBLE_MESSAGES) return messages;
    return messages.slice(messages.length - MAX_VISIBLE_MESSAGES);
  }, [messages]);

  useEffect(() => {
    if (isEmpty && !isPending) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isEmpty, isPending, visibleMessages.length]);

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

      {isPending ? (
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
}
