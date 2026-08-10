import { CREATE_PROJECT_URL } from "@/types/consts/project.const";
import axios from "axios";
import { useCallback, useState } from "react";
import { useChatBaseContext } from "../../context/context";

export function ChatModalNewProject() {
  const { isCreateModalOpen, setIsCreateModalOpen } = useChatBaseContext();

  const [projectName, setProjectName] = useState("");
  const [selectedPath, setSelectedPath] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClose = useCallback(() => {
    setIsCreateModalOpen(false);
  }, [setIsCreateModalOpen]);

  const onCreated = useCallback(() => {
    setIsCreateModalOpen(false);
  }, [setIsCreateModalOpen]);

  const handleSubmit = useCallback(async () => {
    if (!projectName.trim() || !selectedPath.trim()) {
      setError("Informe o nome do projeto e selecione uma pasta.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(CREATE_PROJECT_URL, {
        name: projectName.trim(),
        path: selectedPath.trim(),
      });

      if (response.data.success) {
        onCreated();
      } else {
        setError("Erro ao criar o projeto. Verifique!");
      }

      onClose();
      setProjectName("");
      setSelectedPath("");
    } catch {
      setError("Falha ao criar o projeto.");
    } finally {
      setIsSubmitting(false);
    }
  }, [onClose, onCreated, projectName, selectedPath]);

  if (!isCreateModalOpen) return null;

  return (
    <div className="chat-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        className="chat-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-create-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="chat-modal__header">
          <div>
            <h2 id="project-create-title">Novo projeto</h2>
            <p>Escolha a pasta para um novo projeto.</p>
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
            <span className="chat-control__label">Nome do projeto</span>
            <input
              className="chat-input chat-input--modal"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Ex: Meu novo app"
            />
          </label>

          <label className="chat-control chat-control--full">
            <span className="chat-control__label">Pasta de destino</span>
            <div className="chat-folder-picker">
              <input
                className="chat-input chat-input--modal"
                value={selectedPath}
                onChange={(event) => setSelectedPath(event.target.value)}
                placeholder="Selecione uma pasta"
              />
            </div>
          </label>

          {error ? <p className="chat-modal__error">{error}</p> : null}
        </div>

        <div className="chat-modal__actions">
          <button
            type="button"
            className="chat-button chat-button--ghost"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="chat-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Criar projeto"}
          </button>
        </div>
      </div>
    </div>
  );
}
