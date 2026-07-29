import { ChatStatusPill } from "./ChatStatusPill";

type ChatHeaderProps = {
  title: string;
  status?: string;
  onOpenProjectRoot: () => void;
  onOpenCreateProject: () => void;
};

export function ChatHeader({
  title,
  status = "Online",
  onOpenProjectRoot,
  onOpenCreateProject,
}: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <div className="chat-header__top">
        <div>
          <div className="chat-header__eyebrow">AI Assistant</div>
          <h1 className="chat-title">{title}</h1>
        </div>

        <div className="chat-header__actions flex items-center gap-3">
          <ChatStatusPill label={status} />

          <button type="button" className="chat-button chat-button--ghost" onClick={onOpenCreateProject}>
            Novo projeto
          </button>

          <button
            type="button"
            className="chat-button chat-button--icon"
            onClick={onOpenProjectRoot}
            aria-label="Abrir configurações do projeto"
            title="Configurações"
          >
            <span className="chat-button__icon" aria-hidden="true">
              ⚙
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
