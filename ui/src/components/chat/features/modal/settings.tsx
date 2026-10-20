import { useChatBaseContext } from "../../context/context";
import { useCallback } from "react";
import type { ProjectContext } from "~types/interface/chat.interface";
import { DEFAULT_PROJECT_CONTEXT } from "~types/consts/chat.const";
import { getHostFeatures } from "@/host/domain/host-features";
import { getRuntimeConfig } from "@/host/runtime-config";
import { WorkspaceRootSelect } from "@/host/components/WorkspaceRootSelect";

const { canTypeRoot } = getHostFeatures(getRuntimeConfig().host);

export function ChatModalSettings() {
  const {
    isRootModalOpen,
    projectContext,
    draftContext,
    setDraftContext,
    setProjectContext,
    setIsRootModalOpen,
    setIsMcpDialogOpen,
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
    });
    setIsRootModalOpen(false);
  }, [
    draftContext.reference,
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
            <h2 id="project-root-title">Project context</h2>
            <p>
              Set the base information the chat uses in any project.
            </p>
          </div>
          <button
            type="button"
            className="chat-modal__close"
            onClick={handleClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        <div className="chat-modal__fields">
          {canTypeRoot ? (
            <label className="chat-control chat-control--full">
              <span className="chat-control__label">
                Main path or reference
              </span>
              <input
                className="chat-input chat-input--modal"
                value={draftContext.reference}
                onChange={(event) =>
                  handleChangeDraft("reference", event.target.value)
                }
                placeholder="e.g. /src, app/frontend, project name"
              />
            </label>
          ) : (
            <WorkspaceRootSelect
              value={draftContext.reference}
              onChange={(root) => handleChangeDraft("reference", root)}
            />
          )}
        </div>

        {projectContext.reference ? (
          <section className="mcp-section" aria-labelledby="mcp-link-title">
            <div className="mcp-section__header">
              <h3 id="mcp-link-title">MCP servers</h3>
              <button
                type="button"
                className="chat-button chat-button--ghost"
                onClick={() => {
                  setIsRootModalOpen(false);
                  setIsMcpDialogOpen(true);
                }}
              >
                Manage MCP servers…
              </button>
            </div>
            <p className="mcp-section__empty">
              Add, edit, enable and trust servers. Also: type /mcp in the
              message box.
            </p>
          </section>
        ) : null}

        <div className="chat-modal__actions">
          <button
            type="button"
            className="chat-button chat-button--ghost"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button type="button" className="chat-button" onClick={handleSave}>
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
}
