import { PlanningModeLabel } from "../../types/enum/planning-mode.enum";

type ProjectRootModalProps = {
  isOpen: boolean;
  planningModeEnabled: boolean;
  value: string;
  onChange: (value: string) => void;
  onPlanningModeChange: (enabled: boolean) => void;
  onClose: () => void;
  onSave: () => void;
};

export function ProjectRootModal({
  isOpen,
  planningModeEnabled,
  value,
  onChange,
  onPlanningModeChange,
  onClose,
  onSave,
}: ProjectRootModalProps) {
  if (!isOpen) return null;
  return (
    <div className="chat-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        className="chat-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-root-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="chat-modal__header">
          <div>
            <h2 id="project-root-title">Configurar contexto do projeto</h2>
            <p>
              Defina as informações base usadas pelo chat em qualquer projeto.
            </p>
          </div>
          <button
            type="button"
            className="chat-modal__close"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>
        <div className="chat-modal__fields">
          <label className="chat-control chat-control--full">
            <span className="chat-control__label">
              Caminho ou referência principal
            </span>
            <input
              className="chat-input chat-input--modal"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Ex: /src, app/frontend, nome do projeto"
            />
          </label>

          <div className="chat-toggle-card">
            <div className="chat-toggle-card__copy">
              <span className="chat-control__label">Modo de planejamento</span>
              <p className="chat-toggle-card__description">
                {planningModeEnabled
                  ? "O chat vai priorizar organização, etapas e validação antes de agir."
                  : "O chat vai responder de forma mais direta, sem a camada extra de planejamento."}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={planningModeEnabled}
              aria-label={`Modo de planejamento ${planningModeEnabled ? "ligado" : "desligado"}`}
              className={`chat-toggle-switch ${planningModeEnabled ? "chat-toggle-switch--on" : "chat-toggle-switch--off"}`}
              onClick={() => onPlanningModeChange(!planningModeEnabled)}
            >
              <span className="chat-toggle-switch__track" aria-hidden="true" />
              <span className="chat-toggle-switch__thumb" aria-hidden="true" />
              <span className="chat-toggle-switch__state" aria-hidden="true">
                {planningModeEnabled
                  ? PlanningModeLabel.ON
                  : PlanningModeLabel.OFF}
              </span>
            </button>
          </div>
        </div>
        <div className="chat-modal__actions">
          <button
            type="button"
            className="chat-button chat-button--ghost"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button type="button" className="chat-button" onClick={onSave}>
            Salvar configurações
          </button>
        </div>
      </div>
    </div>
  );
}
