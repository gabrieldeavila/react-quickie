/** Mirrors `GET /mcp/servers` in the API (`api/src/mcp`). */
export type McpServerStatus =
  | "idle"
  | "connecting"
  | "connected"
  /** An http/sse server wants an OAuth sign-in. */
  | "needs-auth"
  | "error"
  | "untrusted"
  | "disabled";

export type McpScope = "global" | "project";

export type McpTransport = "stdio" | "http" | "sse";

export type McpApprovalMode = "ask" | "never";

/** `ask` | `never` for every tool, or a per-tool map (tools missing from it ask). */
export type McpApprovalSetting =
  | McpApprovalMode
  | Record<string, McpApprovalMode>;

export type McpServerView = {
  name: string;
  source: McpScope;
  /** The file the entry lives in (same as `source`). */
  scope: McpScope;
  transport: McpTransport | "unknown";
  status: McpServerStatus;
  disabled: boolean;
  toolCount?: number;
  /** The server's tool names, known once connected. */
  toolNames?: string[];
  error?: string;
  /** The entry as written in the file; literal secrets are "••••". */
  config?: unknown;
  /** Doty holds OAuth tokens for this server. */
  signedIn?: boolean;
};

export type McpConfigFileView = {
  path: string;
  exists: boolean;
  error?: string;
  /** Sent back as `baseHash` with an edit, so changes made elsewhere are caught. */
  hash?: string;
};

export type McpServersResponse = {
  globalConfig: McpConfigFileView;
  projectConfig: McpConfigFileView & { trusted: boolean };
  servers: McpServerView[];
};
