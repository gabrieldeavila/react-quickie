import type { ToolApprovalPolicy } from 'src/chat/domain/approval-policy';
import type { McpApprovalMode, McpApprovalSetting } from './mcp-config.schema';
import type { NamespacedMcpTool } from './namespace-mcp-tools';

/** Server setting → mode for one tool. Unlisted tools and no setting both ask. */
export function resolveMcpApprovalMode(
  setting: McpApprovalSetting | undefined,
  tool: string,
): McpApprovalMode {
  if (setting === undefined) return 'ask';
  if (typeof setting === 'string') return setting;
  return setting[tool] ?? 'ask';
}

const ASK: ToolApprovalPolicy = () => ({ decision: 'ask' });
const NEVER: ToolApprovalPolicy = () => ({ decision: 'never' });

/**
 * One policy per exposed MCP tool. Every tool gets an entry: without one the
 * SDK treats the call as `not-applicable` and runs it unasked.
 */
export function createMcpApprovalPolicies(
  entries: NamespacedMcpTool[],
  approvalByServer: Record<string, McpApprovalSetting | undefined>,
): Record<string, ToolApprovalPolicy> {
  return Object.fromEntries(
    entries.map(({ name, server, tool }) => [
      name,
      resolveMcpApprovalMode(approvalByServer[server], tool) === 'never'
        ? NEVER
        : ASK,
    ]),
  );
}
