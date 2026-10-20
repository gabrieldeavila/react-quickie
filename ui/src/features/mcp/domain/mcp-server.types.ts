/** Mirrors `GET /mcp/servers` in the API (`api/src/mcp`). */
export type McpServerStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "error"
  | "untrusted"
  | "disabled";

export type McpServerView = {
  name: string;
  source: "global" | "project";
  transport: "stdio" | "http" | "sse" | "unknown";
  status: McpServerStatus;
  toolCount?: number;
  error?: string;
};

export type McpConfigFileView = {
  path: string;
  exists: boolean;
  error?: string;
};

export type McpServersResponse = {
  globalConfig: McpConfigFileView;
  projectConfig: McpConfigFileView & { trusted: boolean; hash?: string };
  servers: McpServerView[];
};
