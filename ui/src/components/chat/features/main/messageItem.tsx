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

type ToolOutput = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: unknown;
};

type ToolOutputPart = {
  output?: ToolOutput;
  state?: string;
  input?: Record<string, unknown>;
  type: string;
};

function isToolOutputPart(part: unknown): part is ToolOutputPart {
  return (
    typeof part === "object" &&
    part !== null &&
    "output" in part &&
    "type" in part
  );
}

function stringifyToolOutput(output: unknown): string {
  if (output == null) return "";
  if (typeof output === "string") return output;

  if (typeof output === "object") {
    const toolOutput = output as ToolOutput;

    if (toolOutput.success === false) {
      return (
        toolOutput.error || toolOutput.message || "Erro na execução da tool."
      );
    }

    if (toolOutput.success === true) {
      return toolOutput.message || "Tool executada com sucesso.";
    }
  }

  try {
    return JSON.stringify(output, null, 2);
  } catch {
    return "Saída da tool indisponível.";
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

function shortenToolPath(path?: string, maxSegments = 4): string {
  if (!path) return "";

  const normalized = path.replace(/\\/g, "/");
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length <= maxSegments) return normalized;

  return `…/${segments.slice(-maxSegments).join("/")}`;
}

function getToolLabel(
  part: Record<string, unknown>,
  fallbackLabel: string,
): string {
  const input = part.input as Record<string, unknown> | undefined;

  if (part.type === "tool-read_file") {
    const path = typeof input?.path === "string" ? input.path : undefined;
    return path
      ? `Lendo conteúdo do arquivo: ${shortenToolPath(path)}`
      : fallbackLabel;
  }

  if (part.type === "tool-list_folders") {
    const parentPath =
      typeof input?.parentPath === "string" ? input.parentPath : undefined;
    return parentPath
      ? `Listando arquivos e pastas: ${shortenToolPath(parentPath)}`
      : fallbackLabel;
  }

  return fallbackLabel;
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
              const toolPart = isToolOutputPart(part) ? part : undefined;
              const output = toolPart?.output;
              const state = toolPart?.state;
              const hasError =
                output?.success === false || state === "output-error";
              const status: "loading" | "success" | "error" = hasError
                ? "error"
                : output?.success === true || state === "output-available"
                  ? "success"
                  : "loading";
              const outputText = stringifyToolOutput(output);

              const label = getToolLabel(
                part as Record<string, unknown>,
                meta.label,
              );

              return (
                <ToolCallCard
                  key={`${message.id}-tool-${index}`}
                  label={label}
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
