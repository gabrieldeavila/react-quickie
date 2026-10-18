import { memo, useCallback } from "react";
import {
  useChatBaseContext,
  useChatServicesContext,
} from "../context/context";
import { FiPlus } from "react-icons/fi";
import { formatTimestamp } from "@/helpers/time.helper";

const ChatSidebar = memo(() => {
  const { isSidebarOpen, setIsSidebarOpen, history } = useChatBaseContext();
  const { handleCreateConversation } = useChatServicesContext();

  const onToggleSidebar = useCallback(() => {
    setIsSidebarOpen((current) => !current);
  }, [setIsSidebarOpen]);

  return (
    <aside
      className={`chat-sidebar ${isSidebarOpen ? "chat-sidebar--open" : "chat-sidebar--closed"}`}
      aria-label="Conversations"
      aria-hidden={!isSidebarOpen}
    >
      <button
        type="button"
        className="chat-sidebar__toggle"
        onClick={onToggleSidebar}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        <span className="chat-sidebar__toggle-icon" aria-hidden="true">
          {isSidebarOpen ? "⟨" : "⟩"}
        </span>
      </button>

      <div className="chat-sidebar__content">
        <div className="chat-sidebar__header">
          <div>
            <p className="chat-sidebar__title">Conversations</p>
            <span className="chat-sidebar__subtitle">
              Local history, synced
            </span>
          </div>

          <button
            className="chat-button chat-button--small chat-sidebar__create-button"
            onClick={handleCreateConversation}
            type="button"
            aria-label="New conversation"
            title="New conversation"
          >
            <FiPlus className="chat-sidebar__create-icon" aria-hidden="true" />
          </button>
        </div>

        <div className="chat-sidebar__list">
          {!history.isHydrated ? (
            <div className="chat-sidebar__empty">Loading conversations…</div>
          ) : history.conversations.length === 0 ? (
            <div className="chat-sidebar__empty">
              No conversations yet. Start a new one.
            </div>
          ) : (
            history.conversations.map((conversation) => {
              const isActive: boolean =
                conversation.id === history.activeConversationId;

              return (
                <article
                  key={conversation.id}
                  className={`chat-sidebar__item ${isActive ? "chat-sidebar__item--active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <button
                    className="chat-sidebar__item-button"
                    type="button"
                    onClick={() => history.setActiveConversationId(conversation.id)}
                    aria-label={`Open conversation ${conversation.title}`}
                    title={`Open conversation ${conversation.title}`}
                  >
                    <div className="chat-sidebar__item-body">
                      <div className="chat-sidebar__item-title">
                        {conversation.title}
                      </div>
                      <div className="chat-sidebar__item-meta">
                        {formatTimestamp(conversation.lastMessageAt)}
                      </div>
                    </div>
                  </button>

                  <button
                    className="chat-sidebar__item-delete chat-button chat-button--ghost chat-button--x-small"
                    type="button"
                    onClick={() => history.deleteConversation(conversation.id)}
                    aria-label={`Delete conversation ${conversation.title}`}
                    title={`Delete conversation ${conversation.title}`}
                  >
                    <span className="chat-sidebar__item-delete-icon">x</span>
                  </button>
                </article>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
});

export default ChatSidebar;
