const MCP_PREFIX = "mcp__";

/** `mcp__<server>__<tool>` → `{ server, tool }`, or null for non-MCP names. */
export function parseMcpToolName(
  toolName: string,
): { server: string; tool: string } | null {
  if (!toolName.startsWith(MCP_PREFIX)) return null;

  const rest = toolName.slice(MCP_PREFIX.length);
  const separator = rest.indexOf("__");
  if (separator <= 0 || separator === rest.length - 2) return null;

  return { server: rest.slice(0, separator), tool: rest.slice(separator + 2) };
}

/** "github › search_issues" for MCP tools; null otherwise. */
export function getMcpToolLabel(toolName: string): string | null {
  const parsed = parseMcpToolName(toolName);
  return parsed ? `${parsed.server} › ${parsed.tool}` : null;
}
