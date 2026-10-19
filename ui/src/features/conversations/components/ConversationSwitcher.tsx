import { memo } from "react";
import { FiChevronDown } from "react-icons/fi";
import type { ChatConversation } from "~types/interface/chat-db.interface";
import { useConversationSwitcher } from "../hooks/useConversationSwitcher";
import { ConversationSwitcherPanel } from "./ConversationSwitcherPanel";

type ConversationSwitcherProps = {
  title: string;
  conversations: ChatConversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  onSelect: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
};

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
          <ConversationSwitcherPanel
            switcher={switcher}
            activeConversationId={activeConversationId}
            isLoading={isLoading}
            onDelete={onDelete}
          />
        ) : null}
      </div>
    );
  },
);
