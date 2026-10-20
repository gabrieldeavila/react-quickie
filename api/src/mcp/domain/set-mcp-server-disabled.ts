import {
  readConfigDocument,
  requireServer,
  writeConfigDocument,
} from './mcp-config-text';

/** Sets `"disabled": true`, or removes the key to enable the server again. */
export function setMcpServerDisabled(
  text: string | null,
  name: string,
  disabled: boolean,
): string {
  const document = readConfigDocument(text);
  const entry = { ...requireServer(document, name) };
  if (disabled) entry.disabled = true;
  else delete entry.disabled;
  return writeConfigDocument({
    ...document,
    mcpServers: { ...document.mcpServers, [name]: entry },
  });
}
