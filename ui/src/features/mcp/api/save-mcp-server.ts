import type { McpScope, McpServersResponse } from "../domain/mcp-server.types";
import { requestMcp, sendJson } from "./request-mcp";

/** `PUT /mcp/servers/:name`: adds or replaces the server in that scope's file. */
export function saveMcpServer(
  root: string,
  name: string,
  body: { scope: McpScope; config: unknown; baseHash: string | null },
): Promise<McpServersResponse> {
  return requestMcp(
    `/servers/${encodeURIComponent(name)}?root=${encodeURIComponent(root)}`,
    sendJson("PUT", body),
  );
}
