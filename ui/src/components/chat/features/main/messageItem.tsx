import { getMessageText } from "@/helpers/chat.helper";
import {
  getToolUiMeta,
  isToolPartType,
} from "@/helpers/tool-ui-mapping.helper";
import type { ChatMessageItemProps } from "~types/interface/chat.interface";
import { FiAlertCircle, FiCheckCircle, FiChevronDown } from "react-icons/fi";
import { LuLoaderCircle } from "react-icons/lu";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "@/styles/chat-tools.css";

function stringifyToolOutput(output: unknown): string {
  if (output == null) return "";
  if (typeof output === "string") return output;

  try {
    return JSON.stringify(output, null, 2);
  } catch {
    return String(output);
  }
}

function ToolStatusIcon({
  status,
}: {
  status: "loading" | "success" | "error";
}) {
  const className = "tool-status-icon";

  if (status === "loading") {
    return (
      <LuLoaderCircle
        className={`${className} tool-status-icon--loading`}
        aria-hidden="true"
      />
    );
  }

  if (status === "success") {
    return (
      <FiCheckCircle
        className={`${className} tool-status-icon--success`}
        aria-hidden="true"
      />
    );
  }

  return (
    <FiAlertCircle
      className={`${className} tool-status-icon--error`}
      aria-hidden="true"
    />
  );
}

function ToolCallCard({
  label,
  status,
  outputText,
}: {
  label: string;
  status: "loading" | "success" | "error";
  outputText?: string;
}) {
  const isDone = status !== "loading";

  if (!isDone) {
    return (
      <div className="tool-call-card tool-call-card--loading">
        <div className="tool-call-card__header">
          <ToolStatusIcon status={status} />
          <span className="tool-call-card__label">{label}</span>
        </div>
      </div>
    );
  }

  return (
    <details className="tool-call-card tool-call-card--done">
      <summary className="tool-call-card__summary">
        <div className="tool-call-card__summary-content">
          <div className="tool-call-card__header">
            <ToolStatusIcon status={status} />
            <span className="tool-call-card__label">{label}</span>
          </div>

          <FiChevronDown
            className="tool-call-card__summary-icon"
            aria-hidden="true"
          />
        </div>
      </summary>

      <div className="tool-call-card__details">
        <pre className="tool-call-card__output">
          {outputText || "Sem retorno textual."}
        </pre>
      </div>
    </details>
  );
}

export function ChatMessageItem({
  message,
  isTyping = false,
}: ChatMessageItemProps) {
  const roleClass: string =
    message.role === "user" ? "user-message" : "assistant-message";
  const messageText: string = getMessageText(message);
  const toolParts =
    message.parts?.filter((part) => isToolPartType(part.type)) ?? [];

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
          <>
            {toolParts.map((part, index) => {
              const meta = getToolUiMeta(part.type);
              const outputText = stringifyToolOutput(part.output);
              const state = (part as Record<string, unknown>).state;
              const hasOutput =
                part.output !== undefined && part.output !== null;
              const hasError =
                state === "output-error" ||
                Boolean(
                  (part as Record<string, unknown>).error ??
                  (part as Record<string, unknown>).toolError ??
                  (part as Record<string, unknown>).errorText,
                );
              const status: "loading" | "success" | "error" = hasError
                ? "error"
                : state === "output-available" || hasOutput
                  ? "success"
                  : "loading";

              return (
                <ToolCallCard
                  key={`${message.id}-tool-${index}`}
                  label={meta.label}
                  status={status}
                  outputText={outputText}
                />
              );
            })}
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
                ol: ({ children }) => (
                  <ol className="markdown-ol">{children}</ol>
                ),
                ul: ({ children }) => (
                  <ul className="markdown-ul">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="markdown-li">{children}</li>
                ),
                em: ({ children }) => (
                  <em className="markdown-em">{children}</em>
                ),
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
          </>
        ) : (
          messageText
        )}
      </div>
    </article>
  );
}
