/**
 * A write to a project mcp.json that the user hasn't trusted. Writing would
 * re-trust the whole file, including servers nobody reviewed, so it waits.
 */
export class McpConfigUntrustedError extends Error {
  constructor() {
    super("Review and trust this project's MCP config before editing it here.");
  }
}
