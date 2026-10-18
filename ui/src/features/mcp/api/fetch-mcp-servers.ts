import type { McpServersResponse } from "../domain/mcp-server.types";
import { requestMcp } from "./request-mcp";

/** `GET /mcp/servers?root=`: status, tool count and trust state per server. */
export function fetchMcpServers(
  root: string,
  signal?: AbortSignal,
): Promise<McpServersResponse> {
  return requestMcp(`/servers?root=${encodeURIComponent(root)}`, { signal });
}
