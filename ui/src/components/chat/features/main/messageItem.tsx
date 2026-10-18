import { getMessageText } from "@/helpers/chat.helper";
import { isToolPartType } from "@/helpers/tool-ui-mapping.helper";
import { AssistantMarkdown } from "@/components/primitives/assistantMarkdown";
import { AssistantToolPart } from "@/features/chat/components/AssistantToolPart";
import { isLegacyApprovalControlMessage } from "@/features/chat/domain/legacy-approval";
import { UserMessageContent } from "@/components/primitives/userMessageContent";
import { SubagentStatusCard } from "@/components/primitives/subagentStatusCard";
import type {
  ChatMessageItemProps,
  SubagentStatus,
} from "~types/interface/chat.interface";
import { memo, useCallback, useMemo, type ComponentProps } from "react";
import "@/styles/chat-tools.css";
import "@/styles/chat-user-message.css";

function getSubagentStatuses(parts: unknown[]): SubagentStatus[] {
  const statuses = new Map<string, SubagentStatus>();

  for (const part of parts) {
    if (!part || typeof part !== "object") continue;
    const candidate = part as Record<string, unknown>;
    if (candidate.type !== "data-subagent") continue;

    const data = candidate.data;
    if (!data || typeof data !== "object") continue;
    const value = data as Record<string, unknown>;
    if (
      typeof value.id !== "string" ||
      typeof value.name !== "string" ||
      typeof value.task !== "string" ||
      !["running", "completed", "failed"].includes(String(value.status))
    ) {
      continue;
    }

    statuses.set(value.id, {
      id: value.id,
      name: value.name,
      task: value.task,
      status: value.status as SubagentStatus["status"],
    });
  }

  return [...statuses.values()];
}

export const ChatMessageItem = memo(function ChatMessageItem({
  message,
  isTyping = false,
  isLatest = false,
}: ChatMessageItemProps) {
  const roleClass =
    message.role === "user" ? "user-message" : "assistant-message";
  const messageText = getMessageText(message);
  const subagentStatuses = useMemo(
    () => getSubagentStatuses(message.parts),
    [message.parts],
  );
  const isApprovalControlMessage = isLegacyApprovalControlMessage(message);

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

      if (!isToolPartType(part.type) && part.type !== "dynamic-tool") {
        return null;
      }

      return (
        <AssistantToolPart
          key={`${message.id}-tool-${index}`}
          part={part as ComponentProps<typeof AssistantToolPart>["part"]}
          isLatestMessage={isLatest}
        />
      );
    },
    [isLatest, message],
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
          <>
            <SubagentStatusCard agents={subagentStatuses} />
            {message.parts.map(renderAssistantPart)}
          </>
        ) : message.role === "user" ? (
          <UserMessageContent
            text={messageText}
            images={message.parts.flatMap((part) =>
              part.type === "file" && part.mediaType.startsWith("image/")
                ? [{ url: part.url, filename: part.filename }]
                : [],
            )}
          />
        ) : (
          messageText
        )}
      </div>
    </article>
  );
});
