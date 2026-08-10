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
      aria-label="Chats criados"
      aria-hidden={!isSidebarOpen}
    >
      <button
        type="button"
        className="chat-sidebar__toggle"
        onClick={onToggleSidebar}
        aria-label={isSidebarOpen ? "Fechar sidebar" : "Abrir sidebar"}
        title={isSidebarOpen ? "Fechar sidebar" : "Abrir sidebar"}
      >
        <span className="chat-sidebar__toggle-icon" aria-hidden="true">
          {isSidebarOpen ? "⟨" : "⟩"}
        </span>
      </button>

      <div className="chat-sidebar__content">
        <div className="chat-sidebar__header">
          <div>
            <p className="chat-sidebar__title">Conversas</p>
            <span className="chat-sidebar__subtitle">
              Histórico local sincronizado
            </span>
          </div>

          <button
            className="chat-button chat-button--small chat-sidebar__create-button"
            onClick={handleCreateConversation}
            type="button"
            aria-label="Nova conversa"
            title="Nova conversa"
          >
            <FiPlus className="chat-sidebar__create-icon" aria-hidden="true" />
          </button>
        </div>

        <div className="chat-sidebar__list">
          {!history.isHydrated ? (
            <div className="chat-sidebar__empty">Carregando conversas…</div>
          ) : history.conversations.length === 0 ? (
            <div className="chat-sidebar__empty">
              Nenhuma conversa encontrada. Crie uma nova.
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
                    aria-label={`Abrir conversa ${conversation.title}`}
                    title={`Abrir conversa ${conversation.title}`}
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
                    aria-label={`Excluir conversa ${conversation.title}`}
                    title={`Excluir conversa ${conversation.title}`}
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
