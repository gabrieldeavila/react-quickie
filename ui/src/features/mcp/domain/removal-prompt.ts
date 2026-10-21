import type { McpServerView } from "./mcp-server.types";

/** The question asked before removing a server from its mcp.json. */
export function removalPrompt(server: Pick<McpServerView, "name" | "scope">) {
  return {
    message: `Remove "${server.name}" from the ${server.scope} mcp.json?`,
    confirmLabel: "Remove",
  };
}
