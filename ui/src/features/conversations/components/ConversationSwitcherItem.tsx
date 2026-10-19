import { memo } from "react";
import { FiTrash2 } from "react-icons/fi";
import { formatTimestamp } from "@/helpers/time.helper";
import type { ChatConversation } from "~types/interface/chat-db.interface";

type ConversationSwitcherItemProps = {
  conversation: ChatConversation;
  isActive: boolean;
  onSelect: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
};

/** One conversation row; the delete button shows on hover or keyboard focus. */
export const ConversationSwitcherItem = memo(
  ({
    conversation,
    isActive,
    onSelect,
    onDelete,
  }: ConversationSwitcherItemProps) => (
    <li
      className={`chat-conversation-item ${isActive ? "chat-conversation-item--active" : ""}`}
    >
      <button
        type="button"
        className="chat-conversation-item__open"
        onClick={() => onSelect(conversation.id)}
        aria-current={isActive ? "true" : undefined}
        title={conversation.title}
      >
        <span className="chat-conversation-item__title">
          {conversation.title}
        </span>
        <span className="chat-conversation-item__meta">
          {formatTimestamp(conversation.lastMessageAt)}
        </span>
      </button>
      <button
        type="button"
        className="chat-conversation-item__delete"
        onClick={() => onDelete(conversation.id)}
        aria-label={`Delete conversation ${conversation.title}`}
        title="Delete conversation"
      >
        <FiTrash2 aria-hidden="true" />
      </button>
    </li>
  ),
);
