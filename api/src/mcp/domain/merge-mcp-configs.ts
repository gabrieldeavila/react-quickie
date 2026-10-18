import type { ParsedMcpServer } from './mcp-server.types';

/**
 * Project servers override global ones by name. Callers pass an empty
 * project list when the project config is not trusted, so an untrusted file
 * can never replace a global server's command.
 */
export function mergeMcpConfigs(
  globalServers: ParsedMcpServer[],
  projectServers: ParsedMcpServer[],
): ParsedMcpServer[] {
  const byName = new Map<string, ParsedMcpServer>();
  for (const server of [...globalServers, ...projectServers]) {
    byName.set(server.name, server);
  }
  return [...byName.values()];
}
