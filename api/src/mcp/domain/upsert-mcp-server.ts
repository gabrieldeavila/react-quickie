import { mcpServerSchema } from './mcp-config.schema';
import {
  assertServerName,
  McpConfigEditError,
  readConfigDocument,
  writeConfigDocument,
} from './mcp-config-text';

/**
 * Adds or replaces one server in the file text. The config is validated
 * against the server schema but stored as sent, so fields Doty doesn't know
 * survive. Other servers and top-level keys are kept.
 */
export function upsertMcpServer(
  text: string | null,
  name: string,
  config: unknown,
): string {
  assertServerName(name);
  const result = mcpServerSchema.safeParse(config);
  if (!result.success) {
    throw new McpConfigEditError(
      'invalid-server',
      'Invalid server: set "command" (stdio) or "type" + "url" (http/sse).',
    );
  }

  const document = readConfigDocument(text);
  return writeConfigDocument({
    ...document,
    mcpServers: { ...document.mcpServers, [name]: config },
  });
}
