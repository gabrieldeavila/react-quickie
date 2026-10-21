import type { McpServerView } from "./mcp-server.types";

export type StatusTone = "ok" | "muted" | "warning" | "error";

export type ServerStatusDescription = {
  label: string;
  tone: StatusTone;
  /** Only connected/failed/idle servers can be reconnected; untrusted ones need trust first. */
  canReconnect: boolean;
};

function toolCountLabel(count: number | undefined): string {
  if (count === undefined) return "Connected";
  return count === 1
    ? "Connected · 1 tool"
    : `Connected · ${count} tools`;
}

export function describeServerStatus(
  server: McpServerView,
): ServerStatusDescription {
  switch (server.status) {
    case "connected":
      return {
        label: toolCountLabel(server.toolCount),
        tone: "ok",
        canReconnect: true,
      };
    case "connecting":
      return { label: "Connecting…", tone: "muted", canReconnect: false };
    case "idle":
      return {
        label: "Connects on the next message",
        tone: "muted",
        canReconnect: true,
      };
    case "untrusted":
      return {
        label: "Waiting for trust",
        tone: "warning",
        canReconnect: false,
      };
    case "error":
      return { label: "Error", tone: "error", canReconnect: true };
    case "disabled":
      return { label: "Disabled", tone: "muted", canReconnect: false };
  }
}

/** A project config exists and is waiting for the user to review and trust it. */
export function needsProjectTrust(projectConfig: {
  exists: boolean;
  trusted: boolean;
  hash?: string;
}): boolean {
  return projectConfig.exists && !projectConfig.trusted && !!projectConfig.hash;
}
