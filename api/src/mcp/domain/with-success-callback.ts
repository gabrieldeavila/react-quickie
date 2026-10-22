import type { Tool } from 'ai';

/** An MCP `CallToolResult` that reports a failure (`isError: true`). */
function isErrorResult(result: unknown): boolean {
  return (
    !!result &&
    typeof result === 'object' &&
    (result as { isError?: unknown }).isError === true
  );
}

/** Wraps a tool's `execute` to call `onSuccess` after a call that worked. */
export function withSuccessCallback<T extends Tool>(
  tool: T,
  onSuccess: () => void,
): T {
  const execute = tool.execute;
  if (!execute) return tool;

  return {
    ...tool,
    execute: async (input: unknown, options: Parameters<typeof execute>[1]) => {
      const result: unknown = await execute(input, options);
      if (!isErrorResult(result)) onSuccess();
      return result;
    },
  };
}
