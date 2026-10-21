import { mcpServerSchema } from './mcp-config.schema';
import { assertServerName, McpConfigEditError } from './mcp-config-text';

/** Throws `McpConfigEditError` when the name or entry can't be saved. */
export function checkMcpServerRequest(name: string, config: unknown): void {
  assertServerName(name);
  if (!mcpServerSchema.safeParse(config).success) {
    throw new McpConfigEditError(
      'invalid-server',
      'Invalid server: set "command" (stdio) or "type" + "url" (http/sse).',
    );
  }
}
