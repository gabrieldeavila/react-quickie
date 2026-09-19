import { getMessageText } from "@/helpers/chat.helper";
import {
  getToolUiMeta,
  isToolPartType,
} from "@/helpers/tool-ui-mapping.helper";
import { AssistantMarkdown } from "@/components/primitives/assistantMarkdown";
import { ToolCallCard } from "@/components/primitives/toolCallCard";
import { BashApprovalCard } from "@/components/primitives/bashApprovalCard";
import { UserMessageContent } from "@/components/primitives/userMessageContent";
import type {
  ChatMessageItemProps,
  ToolStatus,
} from "~types/interface/chat.interface";
import { memo, useCallback } from "react";
import "@/styles/chat-tools.css";
import "@/styles/chat-user-message.css";

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
      const message = toolOutput.message || "Tool executada com sucesso.";
      if (toolOutput.data === undefined) return message;

      const data =
        typeof toolOutput.data === "string"
          ? toolOutput.data
          : JSON.stringify(toolOutput.data, null, 2);
      return `${message}\n\n${data}`;
    }
  }

  try {
    return JSON.stringify(output, null, 2);
  } catch {
    return "Saída da tool indisponível.";
  }
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

export const ChatMessageItem = memo(function ChatMessageItem({
  message,
  isTyping = false,
}: ChatMessageItemProps) {
  const roleClass =
    message.role === "user" ? "user-message" : "assistant-message";
  const messageText = getMessageText(message);
  const isApprovalControlMessage =
    message.role === "user" &&
    messageText.startsWith("[bash-approval-control]");

  const renderAssistantPart = useCallback(
    (part: (typeof message.parts)[number], index: number) => {
      if (part.type === "text") {
        return (
          <AssistantMarkdown
            key={`${message.id}-text-${index}`}
            text={part.text ?? ""}
          />
        );
      }

      if (!isToolPartType(part.type)) return null;

      const meta = getToolUiMeta(part.type);
      const toolPart = isToolOutputPart(part) ? part : undefined;
      const output = toolPart?.output;
      const state = toolPart?.state;
      const approval =
        output && typeof output === "object"
          ? (output as {
              approvalRequired?: boolean;
              approvalId?: string;
              command?: string;
              cwd?: string;
              reason?: string;
            })
          : undefined;

      if (
        approval?.approvalRequired &&
        approval.approvalId &&
        approval.command
      ) {
        return (
          <BashApprovalCard
            key={`${message.id}-approval-${index}`}
            approvalId={approval.approvalId}
            command={approval.command}
            cwd={approval.cwd ?? ""}
            reason={approval.reason ?? "Este comando requer sua aprovação."}
          />
        );
      }

      const hasError = output?.success === false || state === "output-error";
      const status: ToolStatus = hasError
        ? "error"
        : output?.success === true || state === "output-available"
          ? "success"
          : "loading";

      return (
        <ToolCallCard
          key={`${message.id}-tool-${index}`}
          label={getToolLabel(part as Record<string, unknown>, meta.label)}
          status={status}
          outputText={stringifyToolOutput(output)}
        />
      );
    },
    [message],
  );

  if (isApprovalControlMessage) return null;

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
          message.parts.map(renderAssistantPart)
        ) : message.role === "user" ? (
          <UserMessageContent text={messageText} />
        ) : (
          messageText
        )}
      </div>
    </article>
  );
});
