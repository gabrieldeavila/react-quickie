/** The file changed since the client read it (its hash no longer matches). */
export class McpConfigConflictError extends Error {
  constructor() {
    super(
      'The MCP config changed elsewhere. Review the new list and try again.',
    );
  }
}
