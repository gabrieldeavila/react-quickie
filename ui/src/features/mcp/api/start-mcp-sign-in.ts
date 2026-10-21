import type { McpServersResponse } from "../domain/mcp-server.types";
import { postJson, requestMcp } from "./request-mcp";

/** `authorizationUrl` is missing when stored tokens could just be refreshed. */
export type McpSignInResponse = McpServersResponse & {
  authorizationUrl?: string;
};

export function startMcpSignIn(
  root: string,
  name: string,
): Promise<McpSignInResponse> {
  return requestMcp<McpSignInResponse>(
    `/${encodeURIComponent(name)}/oauth/start`,
    postJson({ root }),
  );
}
