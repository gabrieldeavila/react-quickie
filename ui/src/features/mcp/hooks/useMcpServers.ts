import { useCallback, useEffect, useState } from "react";
import { deleteMcpServer } from "../api/delete-mcp-server";
import { fetchMcpServers } from "../api/fetch-mcp-servers";
import { McpConflictError } from "../api/mcp-conflict.error";
import { patchMcpServer } from "../api/patch-mcp-server";
import { reconnectMcpServer } from "../api/reconnect-mcp-server";
import { saveMcpServer } from "../api/save-mcp-server";
import { trustMcpConfig } from "../api/trust-mcp-config";
import type {
  McpApprovalSetting,
  McpScope,
  McpServersResponse,
  McpServerView,
} from "../domain/mcp-server.types";

const CHANGED_ELSEWHERE =
  "The MCP config changed outside this dialog. The list is up to date now; review it and try again.";

function messageOf(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

/** MCP server list for `root`, plus every action the dialog offers. */
export function useMcpServers(root: string) {
  const [data, setData] = useState<McpServersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** The action in flight: "trust", "save" or a server name. */
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(
    (signal?: AbortSignal) => {
      setError(null);
      fetchMcpServers(root, signal)
        .then(setData)
        .catch((reason: unknown) => {
          if (signal?.aborted) return;
          setError(messageOf(reason));
        });
    },
    [root],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  /** The hash of the file an edit goes to; null when it doesn't exist yet. */
  const baseHashFor = useCallback(
    (scope: McpScope): string | null => {
      const file = scope === "global" ? data?.globalConfig : data?.projectConfig;
      return file?.hash ?? null;
    },
    [data],
  );

  /** Runs an action; returns its error message (null on success). */
  const run = useCallback(
    async (
      key: string,
      action: () => Promise<McpServersResponse>,
    ): Promise<string | null> => {
      setBusy(key);
      setError(null);
      try {
        setData(await action());
        return null;
      } catch (reason) {
        if (reason instanceof McpConflictError) {
          setData(reason.latest);
          setError(CHANGED_ELSEWHERE);
          return CHANGED_ELSEWHERE;
        }
        const message = messageOf(reason);
        setError(message);
        load();
        return message;
      } finally {
        setBusy(null);
      }
    },
    [load],
  );

  const trust = useCallback(() => {
    const hash = data?.projectConfig.hash;
    if (!hash) return;
    void run("trust", () => trustMcpConfig(root, hash));
  }, [data?.projectConfig.hash, root, run]);

  const reconnect = useCallback(
    (name: string) => void run(name, () => reconnectMcpServer(root, name)),
    [root, run],
  );

  const save = useCallback(
    (scope: McpScope, name: string, config: unknown) =>
      run("save", () =>
        saveMcpServer(root, name, { scope, config, baseHash: baseHashFor(scope) }),
      ),
    [baseHashFor, root, run],
  );

  const remove = useCallback(
    (server: McpServerView) =>
      void run(server.name, () =>
        deleteMcpServer(root, server.name, server.scope, baseHashFor(server.scope)),
      ),
    [baseHashFor, root, run],
  );

  const setDisabled = useCallback(
    (server: McpServerView, disabled: boolean) =>
      void run(server.name, () =>
        patchMcpServer(root, server.name, {
          scope: server.scope,
          baseHash: baseHashFor(server.scope),
          disabled,
        }),
      ),
    [baseHashFor, root, run],
  );

  const setToolApproval = useCallback(
    (server: McpServerView, toolApproval: McpApprovalSetting) =>
      run(server.name, () =>
        patchMcpServer(root, server.name, {
          scope: server.scope,
          baseHash: baseHashFor(server.scope),
          toolApproval,
        }),
      ),
    [baseHashFor, root, run],
  );

  return {
    data,
    error,
    busy,
    refresh: () => load(),
    trust,
    reconnect,
    save,
    remove,
    setDisabled,
    setToolApproval,
  };
}

export type McpServersState = ReturnType<typeof useMcpServers>;
