import type { McpServersResponse } from "../domain/mcp-server.types";
import { postJson, requestMcp } from "./request-mcp";

/** Trusts the project config; the API refuses if the file changed since `hash`. */
export function trustMcpConfig(
  root: string,
  hash: string,
): Promise<McpServersResponse> {
  return requestMcp("/trust", postJson({ root, hash }));
}
