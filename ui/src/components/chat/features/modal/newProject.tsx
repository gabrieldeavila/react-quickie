import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import Toggle from "../../../primitives/toggle";
import {
  getCreateProjectUrl,
  PROJECT_TEMPLATE_OPTIONS,
} from "~types/consts/project.const";
import { authHeaders } from "@/host/api/auth-fetch";
import type {
  CreateProjectPayload,
  ProjectTemplate,
} from "~types/interface/project.interface";
import {
  useChatBaseContext,
  useChatServicesContext,
} from "../../context/context";

export function ChatModalNewProject() {
  const { isCreateModalOpen, setIsCreateModalOpen } = useChatBaseContext();
  const { isBackendMode, isAgnosticMode } = useChatServicesContext();

  const defaultTemplate: ProjectTemplate = isBackendMode
    ? "nest-base"
    : isAgnosticMode
      ? "nest-vite-base"
      : "vite-base";

  const [projectName, setProjectName] = useState("");
  const [selectedPath, setSelectedPath] = useState("");
  const [projectTemplate, setProjectTemplate] =
    useState<ProjectTemplate>("vite-base");
  const [initializeGit, setInitializeGit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableTemplateOptions = useMemo(
    () =>
      PROJECT_TEMPLATE_OPTIONS.filter((option) =>
        isBackendMode
          ? option.value === "nest-base"
          : isAgnosticMode
            ? option.value === "nest-vite-base"
            : option.value !== "nest-base" && option.value !== "nest-vite-base",
      ),
    [isAgnosticMode, isBackendMode],
  );

  useEffect(() => {
    setProjectTemplate(defaultTemplate);
  }, [defaultTemplate]);

  const resetForm = useCallback(() => {
    setProjectName("");
    setSelectedPath("");
    setProjectTemplate(defaultTemplate);
    setInitializeGit(true);
    setError(null);
  }, [defaultTemplate]);

  const onClose = useCallback(() => {
    resetForm();
    setIsCreateModalOpen(false);
  }, [resetForm, setIsCreateModalOpen]);

  const onCreated = useCallback(() => {
    resetForm();
    setIsCreateModalOpen(false);
  }, [resetForm, setIsCreateModalOpen]);

  const handleSubmit = useCallback(async () => {
    if (!projectName.trim() || !selectedPath.trim()) {
      setError("Enter a project name and select a folder.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: CreateProjectPayload = {
        name: projectName.trim(),
        path: selectedPath.trim(),
        template: projectTemplate,
        initializeGit,
      };

      const response = await axios.post(getCreateProjectUrl(), payload, {
        headers: authHeaders(),
      });

      if (response.data.success) {
        onCreated();
      } else {
        setError("Couldn't create the project. Check the details and try again.");
      }
    } catch {
      setError("Failed to create the project.");
    } finally {
      setIsSubmitting(false);
    }
  }, [initializeGit, onCreated, projectName, projectTemplate, selectedPath]);

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
            <h2 id="project-create-title">
              {isBackendMode
                ? "New backend project"
                : isAgnosticMode
                  ? "New full-stack server"
                  : "New frontend project"}
            </h2>
            <p>Choose the folder, the template and whether to initialize git.</p>
          </div>
          <button
            type="button"
            className="chat-modal__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="chat-modal__fields">
          <label className="chat-control chat-control--full">
            <span className="chat-control__label">Project name</span>
            <input
              className="chat-input chat-input--modal"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="e.g. My new app"
            />
          </label>

          <label className="chat-control chat-control--full">
            <span className="chat-control__label">Project type</span>
            <select
              className="chat-input chat-input--modal"
              value={projectTemplate}
              onChange={(event) =>
                setProjectTemplate(event.target.value as ProjectTemplate)
              }
            >
              {availableTemplateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="chat-control chat-control--full">
            <span className="chat-control__label">Destination folder</span>
            <div className="chat-folder-picker">
              <input
                className="chat-input chat-input--modal"
                value={selectedPath}
                onChange={(event) => setSelectedPath(event.target.value)}
                placeholder="Select a folder"
              />
            </div>
          </label>

          <Toggle
            checked={initializeGit}
            onChange={setInitializeGit}
            label="Enable git"
            description="Creates the project with a Git repository already initialized."
          />

          {error ? <p className="chat-modal__error">{error}</p> : null}
        </div>

        <div className="chat-modal__actions">
          <button
            type="button"
            className="chat-button chat-button--ghost"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="chat-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create project"}
          </button>
        </div>
      </div>
    </div>
  );
}
