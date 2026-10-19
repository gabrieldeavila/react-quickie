import { memo, type KeyboardEvent } from "react";
import { FiChevronDown } from "react-icons/fi";
import type { ChatConversation } from "~types/interface/chat-db.interface";
import { useConversationSwitcher } from "../hooks/useConversationSwitcher";
import { ConversationSwitcherItem } from "./ConversationSwitcherItem";

type ConversationSwitcherProps = {
  title: string;
  conversations: ChatConversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  onSelect: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
};

function emptyMessage(isLoading: boolean, query: string): string {
  if (isLoading) return "Loading conversations…";
  return query.trim() ? "No conversations match." : "No conversations yet.";
}

/** The header title, as a button that opens the recent conversations with a search box. */
export const ConversationSwitcher = memo(
  ({
    title,
    conversations,
    activeConversationId,
    isLoading,
    onSelect,
    onDelete,
  }: ConversationSwitcherProps) => {
    const switcher = useConversationSwitcher({ conversations, onSelect });

    const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      switcher.selectFirstMatch();
    };

    return (
      <div className="chat-conversation-switcher" ref={switcher.containerRef}>
        <button
          type="button"
          className="chat-conversation-switcher__trigger"
          onClick={switcher.toggleOpen}
          aria-haspopup="dialog"
          aria-expanded={switcher.isOpen}
          title={`${title} — switch conversation`}
        >
          <span className="chat-title">{title}</span>
          <FiChevronDown
            className="chat-conversation-switcher__chevron"
            aria-hidden="true"
          />
        </button>

        {switcher.isOpen ? (
          <div
            ref={switcher.panelRef}
            className="chat-conversation-switcher__panel"
            role="dialog"
            aria-label="Conversations"
          >
            <input
              type="search"
              className="chat-conversation-switcher__search"
              placeholder="Search conversations"
              aria-label="Search conversations"
              value={switcher.query}
              onChange={(event) => switcher.setQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              autoFocus
            />
            {switcher.visibleConversations.length === 0 ? (
              <p className="chat-conversation-switcher__empty">
                {emptyMessage(isLoading, switcher.query)}
              </p>
            ) : (
              <ul className="chat-conversation-switcher__list">
                {switcher.visibleConversations.map((conversation) => (
                  <ConversationSwitcherItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={conversation.id === activeConversationId}
                    onSelect={switcher.select}
                    onDelete={onDelete}
                  />
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    );
  },
);
