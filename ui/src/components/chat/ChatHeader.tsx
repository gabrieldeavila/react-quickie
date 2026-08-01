import { AgentFocusEnum, AgentSpecialtyEnum } from "../../enum/agent.enum";
import { ChatModePopover, ChatSpecialtyPopover } from "./ChatModePopover";
import { ChatStatusPill } from "./ChatStatusPill";
import { FiFolderPlus, FiSettings } from "react-icons/fi";

type ChatHeaderProps = {
  title: string;
  status?: string;
  focus: AgentFocusEnum;
  specialty: AgentSpecialtyEnum;
  onFocusChange: (value: AgentFocusEnum) => void;
  onSpecialtyChange: (value: AgentSpecialtyEnum) => void;
  onOpenProjectRoot: () => void;
  onOpenCreateProject: () => void;
};

export function ChatHeader({ title, status = "Online", focus, specialty, onFocusChange, onSpecialtyChange, onOpenProjectRoot, onOpenCreateProject }: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <div className="chat-header__top">
        <div>
          <div className="chat-header__eyebrow">AI Assistant</div>
          <h1 className="chat-title">{title}</h1>
        </div>

        <div className="chat-header__actions flex items-center gap-3">
          <ChatStatusPill label={status} />
          <ChatModePopover value={focus} onChange={onFocusChange} />
          <ChatSpecialtyPopover value={specialty} onChange={onSpecialtyChange} focus={focus} />

          <button type="button" className="chat-button chat-button--ghost chat-header__action-button" onClick={onOpenCreateProject} aria-label="Novo projeto" title="Novo projeto">
            <span className="chat-button__icon-wrap chat-header__action-icon-wrap" aria-hidden="true">
              <FiFolderPlus className="chat-button__icon chat-header__action-icon" />
            </span>
          </button>

          <button type="button" className="chat-button chat-button--icon" onClick={onOpenProjectRoot} aria-label="Abrir configurações do projeto" title="Configurações">
            <span className="chat-button__icon-wrap" aria-hidden="true">
              <FiSettings className="chat-button__icon" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
