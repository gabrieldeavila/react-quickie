import { useCallback } from "react";
import { getHostBridge } from "@/host/host-bridge";
import type { McpRowAction } from "../components/McpRowMenu";
import { canEditScope } from "../domain/can-edit-scope";
import type { McpServerView } from "../domain/mcp-server.types";
import { serverActions, type ServerActionKey } from "../domain/server-actions";
import type { McpServerEditor } from "./useMcpServerEditor";
import type { McpServersState } from "./useMcpServers";

const LABELS: Record<ServerActionKey, string> = {
  edit: "Edit",
  enable: "Enable",
  disable: "Disable",
  reconnect: "Reconnect",
  tools: "Tools…",
  remove: "Remove",
  openFile: "Open file",
};

type Input = {
  root: string;
  state: McpServersState;
  editor: McpServerEditor;
  showTools: (name: string) => void;
};

/** Binds each server's menu actions to the API calls and dialog views. */
export function useMcpRowActions({ root, state, editor, showTools }: Input) {
  const host = getHostBridge();

  return useCallback(
    (server: McpServerView): McpRowAction[] => {
      const handlers: Record<ServerActionKey, () => void> = {
        edit: () => editor.edit(server),
        enable: () => state.setDisabled(server, false),
        disable: () => state.setDisabled(server, true),
        reconnect: () => state.reconnect(server.name),
        tools: () => showTools(server.name),
        remove: () => {
          const file = server.scope === "global" ? "global" : "project";
          if (window.confirm(`Remove "${server.name}" from the ${file} mcp.json?`)) {
            state.remove(server);
          }
        },
        openFile: () => host.openMcpConfig(server.scope, root),
      };
      const canEdit = state.data ? canEditScope(server.scope, state.data) : false;
      return serverActions(server, {
        canEdit,
        canOpenFile: host.canOpenFiles,
      }).map((key) => ({
        key,
        label: LABELS[key],
        onSelect: handlers[key],
        disabled: state.busy !== null,
      }));
    },
    [editor, host, root, showTools, state],
  );
}
