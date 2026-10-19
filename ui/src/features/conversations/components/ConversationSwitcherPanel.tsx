import { memo, type KeyboardEvent } from "react";
import type { ConversationSwitcherState } from "../hooks/useConversationSwitcher";
import { ConversationSwitcherItem } from "./ConversationSwitcherItem";

type ConversationSwitcherPanelProps = {
  switcher: ConversationSwitcherState;
  activeConversationId: string | null;
  isLoading: boolean;
  onDelete: (conversationId: string) => void;
};

function emptyMessage(isLoading: boolean, query: string): string {
  if (isLoading) return "Loading conversations…";
  return query.trim() ? "No conversations match." : "No conversations yet.";
}

/**
 * Search box and recent conversations; opened by the header title or the VSCode "History" button.
 * Keyboard: arrows/Home/End move between search and rows, Enter opens, Escape closes.
 */
export const ConversationSwitcherPanel = memo(
  ({
    switcher,
    activeConversationId,
    isLoading,
    onDelete,
  }: ConversationSwitcherPanelProps) => {
    const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      switcher.selectFirstMatch();
    };

    return (
      <div
        ref={switcher.panelRef}
        className="chat-conversation-switcher__panel"
        role="dialog"
        aria-label="Conversations"
        onKeyDown={switcher.handlePanelKeyDown}
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
    );
  },
);
