import type { McpScope, McpServersResponse } from "../domain/mcp-server.types";
import { requestMcp } from "./request-mcp";

/** `DELETE /mcp/servers/:name`: removes it from that scope's file. */
export function deleteMcpServer(
  root: string,
  name: string,
  scope: McpScope,
  baseHash: string | null,
): Promise<McpServersResponse> {
  const query = new URLSearchParams({ root, scope, baseHash: baseHash ?? "" });
  return requestMcp(`/servers/${encodeURIComponent(name)}?${query}`, {
    method: "DELETE",
  });
}
