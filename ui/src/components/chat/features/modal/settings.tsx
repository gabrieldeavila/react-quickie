import { PlanningModeLabel } from "@/types/enum/planning-mode.enum";
import { useChatBaseContext } from "../../context/context";
import { useCallback } from "react";
import type { ProjectContext } from "@/types/interface/chat.interface";
import { DEFAULT_PROJECT_CONTEXT } from "@/types/consts/chat.const";

export function ChatModalSettings() {
  const {
    isRootModalOpen,
    draftContext,
    setDraftContext,
    setProjectContext,
    setIsRootModalOpen,
  } = useChatBaseContext();

  const handleChangeDraft = useCallback(
    <K extends keyof ProjectContext>(key: K, value: ProjectContext[K]) => {
      setDraftContext((current) => ({
        ...current,
        [key]: value,
      }));
    },
    [setDraftContext],
  );

  const handleClose = useCallback(() => {
    setIsRootModalOpen(false);
  }, [setIsRootModalOpen]);

  const handleSave = useCallback(() => {
    setProjectContext({
      reference:
        draftContext.reference.trim() || DEFAULT_PROJECT_CONTEXT.reference,
      focus: draftContext.focus,
      specialty: draftContext.specialty,
      planningModeEnabled: draftContext.planningModeEnabled,
    });
    setIsRootModalOpen(false);
  }, [
    draftContext.focus,
    draftContext.planningModeEnabled,
    draftContext.reference,
    draftContext.specialty,
    setIsRootModalOpen,
    setProjectContext,
  ]);

  if (!isRootModalOpen) return null;

  return (
    <div
      className="chat-modal__backdrop"
      role="presentation"
      onClick={handleClose}
    >
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
            onClick={handleClose}
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
              value={draftContext.reference}
              onChange={(event) =>
                handleChangeDraft("reference", event.target.value)
              }
              placeholder="Ex: /src, app/frontend, nome do projeto"
            />
          </label>

          <div className="chat-toggle-card">
            <div className="chat-toggle-card__copy">
              <span className="chat-control__label">Modo de planejamento</span>
              <p className="chat-toggle-card__description">
                {draftContext.planningModeEnabled
                  ? "O chat vai priorizar organização, etapas e validação antes de agir."
                  : "O chat vai responder de forma mais direta, sem a camada extra de planejamento."}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={draftContext.planningModeEnabled}
              aria-label={`Modo de planejamento ${draftContext.planningModeEnabled ? "ligado" : "desligado"}`}
              className={`chat-toggle-switch ${draftContext.planningModeEnabled ? "chat-toggle-switch--on" : "chat-toggle-switch--off"}`}
              onClick={() =>
                handleChangeDraft(
                  "planningModeEnabled",
                  !draftContext.planningModeEnabled,
                )
              }
            >
              <span className="chat-toggle-switch__track" aria-hidden="true" />
              <span className="chat-toggle-switch__thumb" aria-hidden="true" />
              <span className="chat-toggle-switch__state" aria-hidden="true">
                {draftContext.planningModeEnabled
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
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button type="button" className="chat-button" onClick={handleSave}>
            Salvar configurações
          </button>
        </div>
      </div>
    </div>
  );
}
