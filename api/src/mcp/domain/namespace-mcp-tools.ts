import type { Tool, ToolSet } from 'ai';
import { assignMcpToolNames, type McpToolRef } from './mcp-tool-name';
import {
  readMcpAnnotations,
  type McpToolAnnotations,
} from './mcp-tool-annotations';

export type McpServerTools = {
  server: string;
  tools: Record<string, Tool>;
  enabledTools?: string[];
  disabledTools?: string[];
};

export type NamespacedMcpTool = McpToolRef & {
  name: string;
  annotations?: McpToolAnnotations;
};

export type NamespacedMcpTools = {
  tools: ToolSet;
  /** Which server/tool each exposed name points to (for approval policies). */
  entries: NamespacedMcpTool[];
};

function isToolEnabled(tool: string, server: McpServerTools): boolean {
  if (server.enabledTools && !server.enabledTools.includes(tool)) return false;
  return !server.disabledTools?.includes(tool);
}

/** Applies enable/disable filters and renames tools to `mcp__<server>__<tool>`. */
export function namespaceMcpTools(
  servers: McpServerTools[],
): NamespacedMcpTools {
  const kept = servers.flatMap((server) =>
    Object.entries(server.tools)
      .filter(([tool]) => isToolEnabled(tool, server))
      .map(([tool, definition]) => ({
        server: server.server,
        tool,
        definition,
      })),
  );
  const names = assignMcpToolNames(kept);

  return {
    tools: Object.fromEntries(
      kept.map(({ definition }, index) => [names[index], definition]),
    ),
    entries: kept.map(({ server, tool, definition }, index) => ({
      name: names[index],
      server,
      tool,
      annotations: readMcpAnnotations(definition),
    })),
  };
}
