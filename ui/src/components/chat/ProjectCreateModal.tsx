import axios from "axios";
import { useCallback, useMemo, useState } from "react";

type ProjectCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (path: string) => void;
};

const CREATE_PROJECT_URL = "http://localhost:3000/project/create";

export function ProjectCreateModal({ isOpen, onClose, onCreated }: ProjectCreateModalProps) {
  const [projectName, setProjectName] = useState("");
  const [selectedPath, setSelectedPath] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUseDirectoryPicker = useMemo(
    () => typeof window !== "undefined" && "showDirectoryPicker" in window,
    [],
  );

  const pickFolder = useCallback(async () => {
    setError(null);

    try {
      if (typeof window !== "undefined" && "showDirectoryPicker" in window) {
        const directoryHandle = await (window as Window & {
          showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
        }).showDirectoryPicker();

        setSelectedPath(directoryHandle.name);
        return;
      }

      const input = document.createElement("input");
      input.type = "file";
      input.webkitdirectory = true;
      input.multiple = true;
      input.onchange = () => {
        const files = input.files;
        const firstFile = files?.[0];
        if (!firstFile) return;

        const relativePath = (firstFile as File & { webkitRelativePath?: string }).webkitRelativePath;
        const folderName = relativePath ? relativePath.split("/")[0] : firstFile.name;
        setSelectedPath(folderName);
      };
      input.click();
    } catch (err) {
      setError("Não foi possível abrir o seletor de pasta.");
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!projectName.trim() || !selectedPath.trim()) {
      setError("Informe o nome do projeto e selecione uma pasta.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(CREATE_PROJECT_URL, {
        name: projectName.trim(),
        path: selectedPath.trim(),
      });

      onCreated?.(selectedPath.trim());
      onClose();
      setProjectName("");
      setSelectedPath("");
    } catch {
      setError("Falha ao criar o projeto.");
    } finally {
      setIsSubmitting(false);
    }
  }, [onClose, onCreated, projectName, selectedPath]);

  if (!isOpen) return null;

  return (
    <div className="chat-modal__backdrop" role="presentation" onClick={onClose}>
      <div className="chat-modal" role="dialog" aria-modal="true" aria-labelledby="project-create-title" onClick={(event) => event.stopPropagation()}>
        <div className="chat-modal__header">
          <div>
            <h2 id="project-create-title">Novo projeto</h2>
            <p>Escolha a pasta para um novo projeto.</p>
          </div>
          <button type="button" className="chat-modal__close" onClick={onClose} aria-label="Fechar modal">
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
                readOnly={canUseDirectoryPicker}
              />
              <button type="button" className="chat-button chat-button--ghost" onClick={pickFolder}>
                Escolher pasta
              </button>
            </div>
          </label>

          {error ? <p className="chat-modal__error">{error}</p> : null}
        </div>

        <div className="chat-modal__actions">
          <button type="button" className="chat-button chat-button--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="chat-button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Criar projeto"}
          </button>
        </div>
      </div>
    </div>
  );
}
