import { useState } from "react";
import { ConfirmationBar } from "@/components/primitives/ConfirmationBar";
import { useConfirmation } from "@/components/primitives/useConfirmation";
import { useEscapeKey } from "@/components/primitives/useEscapeKey";
import { getHostBridge } from "@/host/host-bridge";
import { canEditScope } from "../domain/can-edit-scope";
import { needsProjectTrust } from "../domain/describe-server-status";
import { useMcpRowActions } from "../hooks/useMcpRowActions";
import { useMcpServerEditor } from "../hooks/useMcpServerEditor";
import { useMcpServers } from "../hooks/useMcpServers";
import { McpConfigFiles } from "./McpConfigFiles";
import { McpDialogActions } from "./McpDialogActions";
import { McpServerForm } from "./McpServerForm";
import { McpServerRow } from "./McpServerRow";
import { McpToolList } from "./McpToolList";
import { McpTrustNotice } from "./McpTrustNotice";

type Props = { root: string; onClose: () => void };

/** Everything MCP: list, add / edit, enable, tools, trust and the files. */
export function McpDialog({ root, onClose }: Props) {
  const state = useMcpServers(root);
  const editor = useMcpServerEditor(state);
  const [toolsFor, setToolsFor] = useState<string | null>(null);
  const confirmation = useConfirmation();
  const actionsFor = useMcpRowActions({
    root,
    state,
    editor,
    showTools: setToolsFor,
    askConfirmation: confirmation.ask,
  });
  const { data } = state;
  const toolsServer = data?.servers.find((server) => server.name === toolsFor);
  const view = editor.draft ? "form" : toolsServer ? "tools" : "list";

  // Escape cancels a pending confirmation, steps back (form or tools →
  // list), then closes.
  useEscapeKey(() => {
    if (confirmation.pending) confirmation.cancel();
    else if (view === "form") editor.cancel();
    else if (view === "tools") setToolsFor(null);
    else onClose();
  });

  const untrusted = data?.servers.filter((s) => s.status === "untrusted") ?? [];
  const title =
    view === "form"
      ? editor.draft?.isNew
        ? "Add MCP server"
        : `Edit "${editor.draft?.values.name}"`
      : view === "tools"
        ? `Tools of "${toolsServer?.name}"`
        : "MCP servers";
  const newProjectBlocked =
    editor.draft?.isNew &&
    data &&
    !canEditScope(editor.draft.values.scope, data);

  return (
    <div className="chat-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        className="chat-modal mcp-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mcp-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="chat-modal__header">
          <div>
            <h2 id="mcp-dialog-title">{title}</h2>
            <p>Tools from external servers the agent can use.</p>
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

        {state.error ? (
          <p className="chat-modal__error" role="alert">
            {state.error}
          </p>
        ) : null}
        {!data && !state.error ? (
          <p className="mcp-section__empty">Loading…</p>
        ) : null}

        {data && view === "list" ? (
          <>
            {needsProjectTrust(data.projectConfig) ? (
              <McpTrustNotice
                path={data.projectConfig.path}
                servers={untrusted}
                isBusy={state.busy === "trust"}
                onTrust={state.trust}
              />
            ) : null}
            {data.servers.length === 0 ? (
              <p className="mcp-section__empty">No servers configured yet.</p>
            ) : (
              <ul className="mcp-server-list mcp-server-list--dialog">
                {data.servers.map((server) => (
                  <McpServerRow
                    key={`${server.scope}:${server.name}`}
                    server={server}
                    isBusy={state.busy === server.name}
                    actions={actionsFor(server)}
                  />
                ))}
              </ul>
            )}
            <McpConfigFiles
              data={data}
              canOpen={getHostBridge().canOpenFiles}
              onOpen={(scope) => getHostBridge().openMcpConfig(scope, root)}
            />
          </>
        ) : null}

        {view === "form" ? (
          <>
            <McpServerForm editor={editor} />
            {newProjectBlocked ? (
              <p className="chat-modal__error">
                Trust this project's MCP config before adding servers to it.
              </p>
            ) : null}
            {editor.formError ? (
              <p className="chat-modal__error" role="alert">
                {editor.formError}
              </p>
            ) : null}
          </>
        ) : null}

        {view === "tools" && toolsServer ? (
          <McpToolList server={toolsServer} state={state} />
        ) : null}

        <ConfirmationBar confirmation={confirmation} />

        <McpDialogActions
          view={view}
          isSaving={editor.isSaving}
          saveDisabled={!!newProjectBlocked}
          onAdd={editor.create}
          onSave={editor.submit}
          onBack={() => (view === "form" ? editor.cancel() : setToolsFor(null))}
          onClose={onClose}
          onRefresh={state.refresh}
        />
      </div>
    </div>
  );
}
