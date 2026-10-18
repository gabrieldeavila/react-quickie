import type { Tool } from 'ai';
import { capMcpToolResult } from './cap-mcp-tool-result';

/** Wraps a tool's `execute` so its result goes through `capMcpToolResult`. */
export function withCappedOutput<T extends Tool>(tool: T): T {
  const execute = tool.execute;
  if (!execute) return tool;

  return {
    ...tool,
    execute: async (input: unknown, options: Parameters<typeof execute>[1]) =>
      capMcpToolResult(await execute(input, options)),
  };
}
