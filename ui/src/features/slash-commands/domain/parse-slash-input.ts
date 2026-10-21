const SLASH_QUERY = /^\/([A-Za-z0-9-]*)$/;

/**
 * The command query when the whole input is `/` plus letters, digits or
 * dashes ("" for a lone `/`); null otherwise, so a path like `/usr/bin is…`
 * or anything with spaces or newlines is just a message.
 */
export function parseSlashInput(input: string): string | null {
  const match = SLASH_QUERY.exec(input);
  return match ? match[1].toLowerCase() : null;
}
