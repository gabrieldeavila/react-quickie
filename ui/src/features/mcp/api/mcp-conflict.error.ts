import type { McpServersResponse } from "../domain/mcp-server.types";

/** 409: the file changed elsewhere; carries the fresh list the API sent. */
export class McpConflictError extends Error {
  constructor(
    message: string,
    readonly latest: McpServersResponse,
  ) {
    super(message);
  }
}
