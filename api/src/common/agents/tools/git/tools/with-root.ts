import {
  formatToolError,
  type ToolResult,
} from '../../shared/format-tool-error';

export type GetRoot = () => string | undefined;

/**
 * Runs a git tool body in the project root, turning a missing root or any
 * thrown error into the tool's failure result for `action`.
 */
export async function withRoot<T>(
  getRoot: GetRoot,
  action: string,
  run: (root: string) => Promise<ToolResult<T>>,
): Promise<ToolResult<T>> {
  const root = getRoot();
  if (!root) {
    return formatToolError(
      action,
      new Error('Raiz do projeto não encontrada.'),
    );
  }
  try {
    return await run(root);
  } catch (error) {
    return formatToolError(action, error);
  }
}
