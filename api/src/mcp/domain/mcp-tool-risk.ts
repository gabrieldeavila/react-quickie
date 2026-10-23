import type { ApprovalRisk } from 'src/chat/domain/approval-policy';
import type { McpToolAnnotations } from './mcp-tool-annotations';

/**
 * Risk of an MCP tool that asks. Auto mode runs it unasked only when the
 * server says it just reads, or that it writes without destroying anything
 * and without reaching outside its own system. Missing hints take the MCP
 * spec's defaults (destructive, open world), so they keep asking.
 */
export function mcpToolRisk(
  annotations: McpToolAnnotations | undefined,
): ApprovalRisk {
  if (annotations?.readOnlyHint === true) return 'changes';
  if (
    annotations?.destructiveHint === false &&
    annotations.openWorldHint === false
  ) {
    return 'changes';
  }
  return 'destructive';
}
