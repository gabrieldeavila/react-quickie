import { getMessageText } from "@/helpers/chat.helper";
import { isToolPartType } from "@/helpers/tool-ui-mapping.helper";
import { AssistantMarkdown } from "@/components/primitives/assistantMarkdown";
import { AssistantToolPart } from "@/features/chat/components/AssistantToolPart";
import { CompactionNotice } from "@/features/chat/components/CompactionNotice";
import { COMPACTION_PART_TYPE } from "@/features/chat/domain/find-latest-compaction";
import { isLegacyApprovalControlMessage } from "@/features/chat/domain/legacy-approval";
import { UserMessageContent } from "@/components/primitives/userMessageContent";
import { SubagentGroup } from "@/features/subagents/components/SubagentGroup";
import { groupSubagentParts } from "@/features/subagents/domain/group-subagent-parts";
import { TurnUsageFooter } from "@/features/usage/components/TurnUsageFooter";
import type { ChatMessageItemProps } from "~types/interface/chat.interface";
import { memo, useCallback, useMemo, type ComponentProps } from "react";
import "@/styles/chat-tools.css";
import "@/styles/chat-user-message.css";

export const ChatMessageItem = memo(function ChatMessageItem({
  message,
  isTyping = false,
  isLatest = false,
}: ChatMessageItemProps) {
  const roleClass =
    message.role === "user" ? "user-message" : "assistant-message";
  const messageText = getMessageText(message);
  const partGroups = useMemo(
    () => groupSubagentParts(message.parts),
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

      if (part.type === COMPACTION_PART_TYPE) {
        return <CompactionNotice key={`${message.id}-compaction-${index}`} />;
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
            {partGroups.map((group) =>
              group.kind === "subagents" ? (
                <SubagentGroup
                  key={`${message.id}-subagents-${group.items[0].index}`}
                  messageId={message.id}
                  items={
                    group.items as ComponentProps<typeof SubagentGroup>["items"]
                  }
                  isLatestMessage={isLatest}
                />
              ) : (
                renderAssistantPart(group.part, group.index)
              ),
            )}
            <TurnUsageFooter message={message} />
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
