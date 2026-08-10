import { getMessageText } from "@/helpers/chat.helper";
import type { ChatMessageItemProps } from "@/types/interface/chat.interface";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
              blockquote: ({ children }) => (
                <blockquote className="markdown-blockquote">
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => (
                <strong className="markdown-strong">{children}</strong>
              ),
              b: ({ children }) => (
                <strong className="markdown-strong">{children}</strong>
              ),
              ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
              ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
              li: ({ children }) => <li className="markdown-li">{children}</li>,
              em: ({ children }) => <em className="markdown-em">{children}</em>,
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
                <a
                  {...props}
                  className="markdown-link"
                  target="_blank"
                  rel="noreferrer"
                >
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
