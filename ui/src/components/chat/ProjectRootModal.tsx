import type { AgentFocusEnum, AgentSpecialtyEnum } from "../../enum/agent.enum";
import { ChatModePopover, ChatSpecialtyPopover } from "./ChatModePopover";

type ProjectRootModalProps = {
  isOpen: boolean;
  mode: AgentFocusEnum;
  specialty: AgentSpecialtyEnum;
  onModeChange: (value: AgentFocusEnum) => void;
  onSpecialtyChange: (value: AgentSpecialtyEnum) => void;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export function ProjectRootModal({ isOpen, mode, specialty, onModeChange, onSpecialtyChange, value, onChange, onClose, onSave }: ProjectRootModalProps) {
  if (!isOpen) return null;
  return (
    <div className="chat-modal__backdrop" role="presentation" onClick={onClose}>
      <div className="chat-modal" role="dialog" aria-modal="true" aria-labelledby="project-root-title" onClick={(event) => event.stopPropagation()}>
        <div className="chat-modal__header">
          <div>
            <h2 id="project-root-title">Configurar contexto do projeto</h2>
            <p>Defina as informações base usadas pelo chat em qualquer projeto.</p>
          </div>
          <button type="button" className="chat-modal__close" onClick={onClose} aria-label="Fechar modal">×</button>
        </div>
        <div className="chat-modal__fields">
          <label className="chat-control chat-control--full">
            <span className="chat-control__label">Foco do agente</span>
            <div className="chat-mode-inline">
              <ChatModePopover value={mode} onChange={onModeChange} />
              <input className="chat-input chat-input--modal chat-input--mode" value={mode} readOnly aria-label="Foco selecionado" />
            </div>
          </label>
          <label className="chat-control chat-control--full">
            <span className="chat-control__label">Especialidade</span>
            <div className="chat-mode-inline">
              <ChatSpecialtyPopover value={specialty} onChange={onSpecialtyChange} focus={mode} />
              <input className="chat-input chat-input--modal chat-input--mode" value={specialty} readOnly aria-label="Especialidade selecionada" />
            </div>
          </label>
          <label className="chat-control chat-control--full">
            <span className="chat-control__label">Caminho ou referência principal</span>
            <input className="chat-input chat-input--modal" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Ex: /src, app/frontend, nome do projeto" />
          </label>
        </div>
        <div className="chat-modal__actions">
          <button type="button" className="chat-button chat-button--ghost" onClick={onClose}>Cancelar</button>
          <button type="button" className="chat-button" onClick={onSave}>Salvar configurações</button>
        </div>
      </div>
    </div>
  );
}
