import type { UIMessage } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { ChatEmptyState } from "./ChatEmptyState";
import { ChatMessageItem } from "./ChatMessageItem";

type ChatMessageListProps = {
  messages: UIMessage[];
  isPending: boolean;
};

export function ChatMessageList({ messages, isPending }: ChatMessageListProps) {
  const isEmpty = messages.length === 0;
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isPending]);

  return (
    <div className="chat-messages" aria-live="polite" aria-relevant="additions text">
      {isEmpty ? <ChatEmptyState /> : messages.map((message) => <ChatMessageItem key={message.id} message={message} />)}

      {isPending ? (
        <ChatMessageItem
          message={{
            id: "typing",
            role: "assistant",
            parts: [{ type: "text", text: "" }],
          } as UIMessage}
          isTyping
        />
      ) : null}

      <div ref={endRef} aria-hidden="true" />
    </div>
  );
}
