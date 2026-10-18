import { useCallback, useEffect, useState } from "react";
import { fetchMcpServers } from "../api/fetch-mcp-servers";
import { reconnectMcpServer } from "../api/reconnect-mcp-server";
import { trustMcpConfig } from "../api/trust-mcp-config";
import type { McpServersResponse } from "../domain/mcp-server.types";

function messageOf(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

/** MCP server list for `root`, plus the trust and reconnect actions. */
export function useMcpServers(root: string) {
  const [data, setData] = useState<McpServersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** The action in flight: "trust" or a server name. */
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

  const run = useCallback(
    async (key: string, action: () => Promise<McpServersResponse>) => {
      setBusy(key);
      setError(null);
      try {
        setData(await action());
      } catch (reason) {
        setError(messageOf(reason));
        load();
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

  return { data, error, busy, refresh: () => load(), trust, reconnect };
}
