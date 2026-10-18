import type { McpServerConfig } from './mcp-config.schema';

export type McpConfigSource = 'global' | 'project';

/** A server entry after parsing: either a usable config or the reason it isn't. */
export type ParsedMcpServer =
  | {
      name: string;
      source: McpConfigSource;
      config: McpServerConfig;
      error?: undefined;
    }
  | {
      name: string;
      source: McpConfigSource;
      config?: undefined;
      error: string;
    };

export type UsableMcpServer = Extract<ParsedMcpServer, { config: object }>;

export type McpServerStatus =
  'idle' | 'connecting' | 'connected' | 'error' | 'untrusted';

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
  return server.config !== undefined;
}
