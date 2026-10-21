import { useCallback, useEffect, useState } from "react";
import { getHostBridge } from "@/host/host-bridge";
import {
  hasSignInTimedOut,
  isSignInDone,
  type PendingSignIn,
} from "../domain/sign-in-progress";
import type { McpServersState } from "./useMcpServers";

const POLL_MS = 2000;

/**
 * Sign-in to an OAuth MCP server: opens the provider's page in the browser,
 * then refreshes the list until the server is signed in (or it times out).
 */
export function useMcpSignIn(state: McpServersState) {
  const { startSignIn, refresh, data } = state;
  const [pending, setPending] = useState<PendingSignIn | null>(null);
  const server = data?.servers.find(
    (item) => item.name === pending?.serverName,
  );

  const signIn = useCallback(
    async (name: string) => {
      const result = await startSignIn(name);
      if (!result?.authorizationUrl) return;
      getHostBridge().openExternal(result.authorizationUrl);
      setPending({
        serverName: name,
        authorizationUrl: result.authorizationUrl,
        startedAt: Date.now(),
      });
    },
    [startSignIn],
  );

  useEffect(() => {
    if (!pending || isSignInDone(server)) return;
    const timer = window.setTimeout(() => {
      if (hasSignInTimedOut(pending, Date.now())) setPending(null);
      else refresh();
    }, POLL_MS);
    return () => window.clearTimeout(timer);
  }, [pending, server, refresh]);

  const waiting = pending && server && !isSignInDone(server) ? pending : null;

  return {
    signIn,
    /** The sign-in the dialog is waiting for, if any. */
    waiting,
    reopen: () =>
      waiting && getHostBridge().openExternal(waiting.authorizationUrl),
    cancel: () => setPending(null),
  };
}

export type McpSignInState = ReturnType<typeof useMcpSignIn>;
