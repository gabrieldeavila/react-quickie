import type { McpServersResponse } from "../domain/mcp-server.types";
import { postJson, requestMcp } from "./request-mcp";

export function reconnectMcpServer(
  root: string,
  name: string,
): Promise<McpServersResponse> {
  return requestMcp(
    `/${encodeURIComponent(name)}/reconnect`,
    postJson({ root }),
  );
}
