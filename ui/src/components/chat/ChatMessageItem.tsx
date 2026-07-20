import type { UIMessage } from "@ai-sdk/react";

type ChatMessageItemProps = {
  message: UIMessage;
  isTyping?: boolean;
};

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function ChatMessageItem({ message, isTyping = false }: ChatMessageItemProps) {
  const roleClass = message.role === "user" ? "user-message" : "assistant-message";

  return (
    <article className={`message ${roleClass}`}>
      <div className="message-avatar">{message.role === "user" ? "U" : "AI"}</div>
      <div className="message-content">
        {isTyping ? (
          <div className="typing-indicator" aria-label="Assistant is typing">
            <span />
            <span />
            <span />
          </div>
        ) : (
          getMessageText(message)
        )}
      </div>
    </article>
  );
}
