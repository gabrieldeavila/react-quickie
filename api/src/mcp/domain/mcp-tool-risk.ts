import type { ApprovalRisk } from 'src/chat/domain/approval-policy';
import type { McpToolAnnotations } from './mcp-tool-annotations';
import { removesOrShares } from './removes-or-shares';

/**
 * Risk of an MCP tool that asks. Auto mode runs reads, creates and edits
 * unasked, the work the user asked for; tools that delete data or share it
 * with other people keep asking. A read-only hint wins over the name.
 */
export function mcpToolRisk(
  toolName: string,
  annotations: McpToolAnnotations | undefined,
): ApprovalRisk {
  if (annotations?.readOnlyHint === true) return 'changes';
  return removesOrShares(toolName) ? 'destructive' : 'changes';
}
