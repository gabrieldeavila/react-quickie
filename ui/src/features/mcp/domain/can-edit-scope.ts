import type { McpScope, McpServersResponse } from "./mcp-server.types";

/**
 * Saving the project file re-trusts it, so an existing project file must be
 * trusted first (the API refuses otherwise): edits can't approve servers
 * nobody reviewed.
 */
export function canEditScope(
  scope: McpScope,
  data: Pick<McpServersResponse, "projectConfig">,
): boolean {
  if (scope === "global") return true;
  return !data.projectConfig.exists || data.projectConfig.trusted;
}
