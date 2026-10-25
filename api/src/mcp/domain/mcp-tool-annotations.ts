import type { Tool } from 'ai';

/** The behaviour hints an MCP server declares for a tool (MCP spec, `ToolAnnotations`). */
export type McpToolAnnotations = {
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
};

/** An AI SDK tool that keeps its server's hints, which `client.tools()` drops. */
export type AnnotatedMcpTool = Tool & { mcpAnnotations?: McpToolAnnotations };

type ToolDefinition = { name: string; annotations?: Record<string, unknown> };

function pickHints(raw: Record<string, unknown> | undefined) {
  if (!raw) return undefined;
  const hints: McpToolAnnotations = {};
  for (const key of [
    'readOnlyHint',
    'destructiveHint',
    'idempotentHint',
    'openWorldHint',
  ] as const) {
    if (typeof raw[key] === 'boolean') hints[key] = raw[key];
  }
  return hints;
}

/** Attaches each definition's hints to the tool built from it. */
export function withMcpAnnotations(
  tools: Record<string, Tool>,
  definitions: ToolDefinition[],
): Record<string, AnnotatedMcpTool> {
  const byName = new Map(
    definitions.map(({ name, annotations }) => [name, pickHints(annotations)]),
  );
  return Object.fromEntries(
    Object.entries(tools).map(([name, tool]) => [
      name,
      { ...tool, mcpAnnotations: byName.get(name) },
    ]),
  );
}

export function readMcpAnnotations(tool: Tool): McpToolAnnotations | undefined {
  return (tool as AnnotatedMcpTool).mcpAnnotations;
}
