import type { McpServersResponse } from "../domain/mcp-server.types";
import { requestMcp } from "./request-mcp";

export function signOutMcpServer(
  root: string,
  name: string,
): Promise<McpServersResponse> {
  const query = new URLSearchParams({ root });
  return requestMcp(`/${encodeURIComponent(name)}/oauth?${query}`, {
    method: "DELETE",
  });
}
