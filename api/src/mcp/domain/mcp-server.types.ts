import type { McpServerConfig } from './mcp-config.schema';

export type McpConfigSource = 'global' | 'project';

/** A server entry after parsing: either a usable config or the reason it isn't. */
export type ParsedMcpServer =
  | {
      name: string;
      source: McpConfigSource;
      config: McpServerConfig;
      error?: undefined;
      /** Set (true) only for `"disabled": true` servers, which never connect. */
      disabled?: true;
    }
  | {
      name: string;
      source: McpConfigSource;
      config?: undefined;
      error: string;
      disabled?: undefined;
    };

export type UsableMcpServer = Extract<ParsedMcpServer, { config: object }> & {
  disabled?: undefined;
};

export type McpServerStatus =
  'idle' | 'connecting' | 'connected' | 'error' | 'untrusted' | 'disabled';

export type McpServerView = {
  name: string;
  source: McpConfigSource;
  transport: 'stdio' | 'http' | 'sse' | 'unknown';
  status: McpServerStatus;
  toolCount?: number;
  error?: string;
};

export function isUsableServer(
  server: ParsedMcpServer,
): server is UsableMcpServer {
  return server.config !== undefined && !server.disabled;
}
