export type McpConfigEditErrorKind =
  'invalid-file' | 'invalid-name' | 'invalid-server' | 'not-found';

/** An edit that can't be applied; the controller maps `kind` to a status. */
export class McpConfigEditError extends Error {
  constructor(
    readonly kind: McpConfigEditErrorKind,
    message: string,
  ) {
    super(message);
  }
}

/** The whole file: `mcpServers` plus any other top-level keys, kept as they are. */
export type McpConfigDocument = Record<string, unknown> & {
  mcpServers: Record<string, unknown>;
};

const SERVER_NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** File text (null when the file doesn't exist) → document. Throws on a broken file. */
export function readConfigDocument(text: string | null): McpConfigDocument {
  if (text === null || !text.trim()) return { mcpServers: {} };

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new McpConfigEditError(
      'invalid-file',
      'The file is not valid JSON. Fix it by hand before editing it here.',
    );
  }
  if (!isPlainObject(parsed)) {
    throw new McpConfigEditError(
      'invalid-file',
      'The file is not a JSON object.',
    );
  }
  const servers = parsed.mcpServers ?? {};
  if (!isPlainObject(servers)) {
    throw new McpConfigEditError(
      'invalid-file',
      'The file\'s "mcpServers" is not an object.',
    );
  }
  return { ...parsed, mcpServers: servers };
}

/** 2-space JSON with a trailing newline. */
export function writeConfigDocument(document: McpConfigDocument): string {
  return `${JSON.stringify(document, null, 2)}\n`;
}

export function assertServerName(name: string): void {
  if (!SERVER_NAME.test(name)) {
    throw new McpConfigEditError(
      'invalid-name',
      'Server names use letters, digits, ".", "_" and "-" (up to 64).',
    );
  }
}

/** The raw entry of an existing server; throws `not-found`. */
export function requireServer(
  document: McpConfigDocument,
  name: string,
): Record<string, unknown> {
  const entry = document.mcpServers[name];
  if (!isPlainObject(entry)) {
    throw new McpConfigEditError(
      'not-found',
      `MCP server "${name}" not found.`,
    );
  }
  return entry;
}
