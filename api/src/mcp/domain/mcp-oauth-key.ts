import type { McpConfigSource } from './mcp-server.types';

type KeyInput = {
  root: string;
  source: McpConfigSource;
  name: string;
  url: string;
};

/**
 * Tokens belong to one server URL: changing the URL means signing in again.
 * Global servers share tokens across projects; project ones don't.
 */
export function mcpOAuthKey({ root, source, name, url }: KeyInput): string {
  const owner = source === 'global' ? 'global' : `project:${root}`;
  return `${owner}|${name}|${url}`;
}
