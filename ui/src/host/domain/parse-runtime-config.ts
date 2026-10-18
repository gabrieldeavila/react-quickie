import type { RuntimeConfig } from "./runtime-config.types";

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readRoots(raw: Record<string, unknown>): string[] {
  const roots = Array.isArray(raw.roots) ? raw.roots : [raw.root];
  return roots.map(readString).filter((root): root is string => root !== null);
}

/**
 * `injected` is `window.__DOTY_CONFIG__` (set by the VSCode extension);
 * anything missing falls back to the browser setup (`VITE_API_URL`).
 */
export function parseRuntimeConfig(
  injected: unknown,
  fallbackApiUrl: string,
): RuntimeConfig {
  const raw =
    injected && typeof injected === "object"
      ? (injected as Record<string, unknown>)
      : {};

  return {
    apiUrl: (readString(raw.apiUrl) ?? fallbackApiUrl).replace(/\/+$/, ""),
    token: readString(raw.token),
    roots: readRoots(raw),
    host: raw.host === "vscode" ? "vscode" : "browser",
  };
}
