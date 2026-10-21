import { z } from 'zod/v4';
import type { McpApprovalSetting } from './mcp-config.schema';
import {
  McpConfigEditError,
  readConfigDocument,
  requireServer,
  writeConfigDocument,
} from './mcp-config-text';

const approvalMode = z.enum(['ask', 'never']);
const approvalSetting = z.union([
  approvalMode,
  z.record(z.string().min(1), approvalMode),
]);

/**
 * Sets the server's `approval`: `ask` | `never` for every tool, or a per-tool
 * map (tools missing from it ask). `ask` is the default, so it removes the key.
 */
export function setMcpToolApproval(
  text: string | null,
  name: string,
  approval: unknown,
): string {
  const result = approvalSetting.safeParse(approval);
  if (!result.success) {
    throw new McpConfigEditError(
      'invalid-server',
      'Approval must be "ask", "never" or a map of tool name → "ask" | "never".',
    );
  }

  const document = readConfigDocument(text);
  const entry = { ...requireServer(document, name) };
  const setting: McpApprovalSetting = result.data;
  if (setting === 'ask') delete entry.approval;
  else entry.approval = setting;
  return writeConfigDocument({
    ...document,
    mcpServers: { ...document.mcpServers, [name]: entry },
  });
}
