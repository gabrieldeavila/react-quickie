import type { ChatModeEnum } from "../../enum/chat.enum";
import { ChatModePopover } from "./ChatModePopover";
import { ChatStatusPill } from "./ChatStatusPill";

type ChatHeaderProps = {
  title: string;
  status?: string;
  mode: ChatModeEnum;
  onModeChange: (value: ChatModeEnum) => void;
  onOpenProjectRoot: () => void;
  onOpenCreateProject: () => void;
};

export function ChatHeader({
  title,
  status = "Online",
  mode,
  onModeChange,
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
          <ChatModePopover value={mode} onChange={onModeChange} />

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
