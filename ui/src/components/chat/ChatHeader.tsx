import type { ChatModeEnum } from "../../enum/chat.enum";
import { ChatModePopover } from "./ChatModePopover";
import { ChatStatusPill } from "./ChatStatusPill";
import { FiPlus, FiSettings } from "react-icons/fi";

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

          <button
            type="button"
            className="chat-button chat-button--ghost chat-header__action-button"
            onClick={onOpenCreateProject}
          >
            <span className="chat-button__icon-wrap chat-header__action-icon-wrap" aria-hidden="true">
              <FiPlus className="chat-button__icon chat-header__action-icon" />
            </span>
            <span>Novo projeto</span>
          </button>

          <button
            type="button"
            className="chat-button chat-button--icon"
            onClick={onOpenProjectRoot}
            aria-label="Abrir configurações do projeto"
            title="Configurações"
          >
            <span className="chat-button__icon-wrap" aria-hidden="true">
              <FiSettings className="chat-button__icon" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
