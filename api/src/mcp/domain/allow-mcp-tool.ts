import type { McpApprovalSetting } from './mcp-config.schema';

/**
 * The server's `approval` after "Always allow": `never` for the whole server,
 * or `never` for one tool while the others keep their setting.
 */
export function allowMcpTool(
  setting: McpApprovalSetting | undefined,
  tool: string,
  wholeServer: boolean,
): McpApprovalSetting {
  if (wholeServer || setting === 'never') return 'never';
  const map = typeof setting === 'object' ? setting : {};
  return { ...map, [tool]: 'never' };
}
