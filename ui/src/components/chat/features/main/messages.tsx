import { useVirtualizer } from "@tanstack/react-virtual";
import type { UIMessage } from "ai";
import { memo, useEffect, useMemo, useRef } from "react";
import {
  useChatBaseContext,
  useChatServicesContext,
} from "../../context/context";
import { MAX_VISIBLE_MESSAGES } from "~types/consts/project.const";
import { ChatEmptyState } from "./empty";
import { ChatMessageItem } from "./messageItem";

const ChatMessagesList = memo(() => {
  const { messages } = useChatBaseContext();
  const { isChatPending } = useChatServicesContext();

  const isEmpty: boolean = messages.length === 0;
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const visibleMessages: UIMessage[] = useMemo(() => {
    if (messages.length <= MAX_VISIBLE_MESSAGES) return messages;
    return messages.slice(messages.length - MAX_VISIBLE_MESSAGES);
  }, [messages]);

  const virtualizer = useVirtualizer({
    count: visibleMessages.length,
    getItemKey: (index) => visibleMessages[index]?.id ?? index,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 120,
    overscan: 8,
    gap: 18,
  });

  useEffect(() => {
    if (isEmpty && !isChatPending) return;

    const frame = requestAnimationFrame(() => {
      if (visibleMessages.length > 0) {
        virtualizer.scrollToIndex(visibleMessages.length - 1, {
          align: "end",
          behavior: "auto",
        });
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [isEmpty, isChatPending, visibleMessages.length, virtualizer]);

  return (
    <div
      ref={scrollRef}
      className="chat-messages"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {isEmpty ? (
        <ChatEmptyState />
      ) : (
        <div
          className="chat-messages__virtualizer"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const message = visibleMessages[virtualRow.index];

            return (
              <div
                key={virtualRow.key}
                ref={virtualizer.measureElement}
                data-index={virtualRow.index}
                className="chat-messages__item"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <ChatMessageItem message={message} />
              </div>
            );
          })}
        </div>
      )}

      {isChatPending ? (
        <div className="chat-messages__typing">
          <ChatMessageItem
            message={
              {
                id: "typing",
                role: "assistant",
                parts: [{ type: "text", text: "" }],
              } as UIMessage
            }
            isTyping
          />
        </div>
      ) : null}

    </div>
  );
});

export default ChatMessagesList;
