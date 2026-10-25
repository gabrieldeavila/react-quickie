import type { ToolApprovalPolicy } from 'src/chat/domain/approval-policy';
import type { McpApprovalMode, McpApprovalSetting } from './mcp-config.schema';
import { mcpToolRisk } from './mcp-tool-risk';
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

const NEVER: ToolApprovalPolicy = () => ({ decision: 'never' });

/**
 * One policy per exposed MCP tool. Every tool gets an entry: without one the
 * SDK treats the call as `not-applicable` and runs it unasked. An ask carries
 * the risk from the server's hints, which auto mode reads.
 */
export function createMcpApprovalPolicies(
  entries: NamespacedMcpTool[],
  approvalByServer: Record<string, McpApprovalSetting | undefined>,
): Record<string, ToolApprovalPolicy> {
  return Object.fromEntries(
    entries.map(
      ({ name, server, tool, annotations }): [string, ToolApprovalPolicy] => {
        if (
          resolveMcpApprovalMode(approvalByServer[server], tool) === 'never'
        ) {
          return [name, NEVER];
        }
        const risk = mcpToolRisk(tool, annotations);
        return [name, () => ({ decision: 'ask', risk })];
      },
    ),
  );
}
