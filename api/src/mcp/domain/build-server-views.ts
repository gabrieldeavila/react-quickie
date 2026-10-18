import {
  isUsableServer,
  type McpServerStatus,
  type McpServerView,
  type ParsedMcpServer,
  type UsableMcpServer,
} from './mcp-server.types';

export type ConnectionSnapshot = {
  status: Exclude<McpServerStatus, 'idle' | 'untrusted'>;
  toolCount?: number;
  error?: string;
};

function transportOf(server: ParsedMcpServer): McpServerView['transport'] {
  if (!server.config) return 'unknown';
  return 'command' in server.config ? 'stdio' : server.config.type;
}

function activeView(
  server: ParsedMcpServer,
  snapshotOf: (server: UsableMcpServer) => ConnectionSnapshot | undefined,
): McpServerView {
  const base = {
    name: server.name,
    source: server.source,
    transport: transportOf(server),
  };
  if (!isUsableServer(server)) {
    return { ...base, status: 'error', error: server.error };
  }
  const snapshot = snapshotOf(server);
  if (!snapshot) return { ...base, status: 'idle' };
  return { ...base, ...snapshot };
}

/** The settings list: active servers with their connection state, then untrusted ones. */
export function buildServerViews(
  active: ParsedMcpServer[],
  untrusted: ParsedMcpServer[],
  snapshotOf: (server: UsableMcpServer) => ConnectionSnapshot | undefined,
): McpServerView[] {
  return [
    ...active.map((server) => activeView(server, snapshotOf)),
    ...untrusted.map((server): McpServerView => ({
      name: server.name,
      source: server.source,
      transport: transportOf(server),
      status: 'untrusted',
      error: server.error,
    })),
  ];
}
