import type { UIMessage } from "@ai-sdk/react";
import { ChatEmptyState } from "./ChatEmptyState";
import { ChatMessageItem } from "./ChatMessageItem";

type ChatMessageListProps = {
  messages: UIMessage[];
  isPending: boolean;
};

export function ChatMessageList({ messages, isPending }: ChatMessageListProps) {
  const isEmpty = messages.length === 0;

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
    </div>
  );
}
