import type { UIMessage } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessageItemProps = {
  message: UIMessage;
  isTyping?: boolean;
};

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");
}

export function ChatMessageItem({
  message,
  isTyping = false,
}: ChatMessageItemProps) {
  const roleClass: string =
    message.role === "user" ? "user-message" : "assistant-message";
  const messageText: string = getMessageText(message);

  return (
    <article className={`message ${roleClass}`}>
      <div className="message-content markdown-content">
        {isTyping ? (
          <div className="typing-indicator" aria-label="Assistant is typing">
            <span />
            <span />
            <span />
          </div>
        ) : message.role === "assistant" ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p>{children}</p>,
              code: ({ className, children }) => {
                const isBlock: boolean = Boolean(
                  className?.includes("language-"),
                );

                return isBlock ? (
                  <code className={className}>{children}</code>
                ) : (
                  <code className="inline-code">{children}</code>
                );
              },
              pre: ({ children }) => (
                <pre className="markdown-pre">{children}</pre>
              ),
              a: ({ children, ...props }) => (
                <a {...props} target="_blank" rel="noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {messageText}
          </ReactMarkdown>
        ) : (
          messageText
        )}
      </div>
    </article>
  );
}
