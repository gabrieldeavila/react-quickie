import { useCallback, useEffect, useState } from "react";
import { getHostBridge } from "@/host/host-bridge";
import {
  acceptSignInRequest,
  dismissSignInRequest,
  fetchSignInRequests,
} from "../api/sign-in-requests";
import type { SignInRequest } from "../domain/sign-in-request.types";

const POLL_MS = 3000;

function messageOf(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

/**
 * Open sign-in requests of `root`'s MCP servers, checked every few seconds
 * while the page is visible. Accepting opens the page in the browser; an
 * OAuth request stays listed (with its page) until the server connects.
 */
export function useSignInRequests(root: string) {
  const [requests, setRequests] = useState<SignInRequest[]>([]);
  /** Request id → the page already opened for it. */
  const [opened, setOpened] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!root || document.visibilityState !== "visible") return;
      try {
        setRequests(await fetchSignInRequests(root, signal));
      } catch {
        // The API may be restarting; the next poll tries again.
      }
    },
    [root],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    const timer = window.setInterval(() => void load(controller.signal), POLL_MS);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [load]);

  const accept = useCallback(
    async (request: SignInRequest) => {
      setError(null);
      try {
        const url = await acceptSignInRequest(root, request.id);
        if (url) {
          getHostBridge().openExternal(url);
          setOpened((current) => ({ ...current, [request.id]: url }));
        }
      } catch (reason) {
        setError(messageOf(reason));
      }
      await load();
    },
    [load, root],
  );

  const dismiss = useCallback(
    async (request: SignInRequest) => {
      setError(null);
      setRequests((current) => current.filter((item) => item.id !== request.id));
      await dismissSignInRequest(root, request.id).catch(() => undefined);
    },
    [root],
  );

  return {
    requests,
    error,
    /** The page opened for a request, so the popup can offer to open it again. */
    openedUrl: (id: string): string | undefined => opened[id],
    accept,
    dismiss,
    reopen: (url: string) => getHostBridge().openExternal(url),
  };
}

export type SignInRequestsState = ReturnType<typeof useSignInRequests>;
