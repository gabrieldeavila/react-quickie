import {
  readConfigDocument,
  requireServer,
  writeConfigDocument,
} from './mcp-config-text';

/** Removes one server from the file text; throws `not-found`. */
export function removeMcpServer(text: string | null, name: string): string {
  const document = readConfigDocument(text);
  requireServer(document, name);
  const servers = { ...document.mcpServers };
  delete servers[name];
  return writeConfigDocument({ ...document, mcpServers: servers });
}
