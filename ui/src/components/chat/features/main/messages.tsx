import { useVirtualizer } from "@tanstack/react-virtual";
import type { UIMessage } from "ai";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { FiRefreshCw } from "react-icons/fi";
import {
  useChatBaseContext,
  useChatServicesContext,
} from "../../context/context";
import { MAX_VISIBLE_MESSAGES } from "~types/consts/project.const";
import { ChatEmptyState } from "./empty";
import { ChatMessageItem } from "./messageItem";

const ChatMessagesList = memo(() => {
  const { messages, error, clearError, regenerate } = useChatBaseContext();
  const { isChatPending } = useChatServicesContext();
  const handleRetry = useCallback(() => {
    clearError();
    void regenerate();
  }, [clearError, regenerate]);

  const isEmpty: boolean = messages.length === 0;
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const shouldFollowScrollRef = useRef(true);
  const lastMessageIdRef = useRef<string | undefined>(undefined);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldFollowScrollRef.current = distanceFromBottom <= 80;
  }, []);

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
    const latestMessage = messages[messages.length - 1];
    const isNewUserMessage =
      latestMessage?.role === "user" &&
      latestMessage.id !== lastMessageIdRef.current;

    if (isNewUserMessage) shouldFollowScrollRef.current = true;
    lastMessageIdRef.current = latestMessage?.id;

    if (isEmpty && !isChatPending) return;

    const frame = requestAnimationFrame(() => {
      const container = scrollRef.current;
      if (!container || !shouldFollowScrollRef.current) return;

      // Scroll instantly on each streamed update so the response stays visible
      // without introducing smooth-scroll animation that can lag behind tokens.
      container.scrollTo({ top: container.scrollHeight, behavior: "auto" });
    });

    return () => cancelAnimationFrame(frame);
  }, [error, isEmpty, isChatPending, messages]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
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

      {error && !isChatPending ? (
        <div className="chat-request-error" role="alert">
          <p>{error.message || "Não foi possível gerar uma resposta."}</p>
          <button
            type="button"
            className="chat-request-error__retry"
            onClick={handleRetry}
            disabled={isChatPending}
          >
            <FiRefreshCw aria-hidden="true" />
            Tentar novamente
          </button>
        </div>
      ) : null}
    </div>
  );
});

export default ChatMessagesList;
