import { FiPlus } from "react-icons/fi";
import type { ChatConversation } from "../../lib/chatDb";

type ChatSidebarProps = {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  onCreateConversation: () => void;
  onSelectConversation: (conversationId: string | null) => void;
  onDeleteConversation: (conversationId: string) => Promise<void>;
  isHydrated: boolean;
  isOpen: boolean;
  onToggleSidebar: () => void;
};

const formatTimestamp = (timestamp: number): string => {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
};

export function ChatSidebar({
  conversations,
  activeConversationId,
  onCreateConversation,
  onSelectConversation,
  onDeleteConversation,
  isHydrated,
  isOpen,
  onToggleSidebar,
}: ChatSidebarProps) {
  return (
    <aside
      className={`chat-sidebar ${isOpen ? "chat-sidebar--open" : "chat-sidebar--closed"}`}
      aria-label="Chats criados"
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className="chat-sidebar__toggle"
        onClick={onToggleSidebar}
        aria-label={isOpen ? "Fechar sidebar" : "Abrir sidebar"}
        title={isOpen ? "Fechar sidebar" : "Abrir sidebar"}
      >
        <span className="chat-sidebar__toggle-icon" aria-hidden="true">
          {isOpen ? "⟨" : "⟩"}
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
            onClick={onCreateConversation}
            type="button"
            aria-label="Nova conversa"
            title="Nova conversa"
          >
            <FiPlus className="chat-sidebar__create-icon" aria-hidden="true" />
          </button>
        </div>

        <div className="chat-sidebar__list">
          {!isHydrated ? (
            <div className="chat-sidebar__empty">Carregando conversas…</div>
          ) : conversations.length === 0 ? (
            <div className="chat-sidebar__empty">
              Nenhuma conversa encontrada. Crie uma nova.
            </div>
          ) : (
            conversations.map((conversation) => {
              const isActive: boolean =
                conversation.id === activeConversationId;

              return (
                <article
                  key={conversation.id}
                  className={`chat-sidebar__item ${isActive ? "chat-sidebar__item--active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <button
                    className="chat-sidebar__item-button"
                    type="button"
                    onClick={() => onSelectConversation(conversation.id)}
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
                    onClick={() => void onDeleteConversation(conversation.id)}
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
}
