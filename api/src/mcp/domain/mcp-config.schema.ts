import { z } from 'zod/v4';

const approvalModeSchema = z.enum(['ask', 'never']);

/** `ask` (default) | `never` | per-tool map; tools missing from the map ask. */
const approvalSchema = z.union([
  approvalModeSchema,
  z.record(z.string(), approvalModeSchema),
]);

const toolFilterFields = {
  approval: approvalSchema.optional(),
  enabledTools: z.array(z.string()).optional(),
  disabledTools: z.array(z.string()).optional(),
};

const stdioServerSchema = z.object({
  type: z.literal('stdio').optional(),
  command: z.string().min(1),
  args: z.array(z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
  ...toolFilterFields,
});

const httpServerSchema = z.object({
  type: z.enum(['http', 'sse']),
  // Checked as a URL after `${VAR}` interpolation (see parse-mcp-config).
  url: z.string().min(1),
  headers: z.record(z.string(), z.string()).optional(),
  ...toolFilterFields,
});

export const mcpServerSchema = z.union([stdioServerSchema, httpServerSchema]);

export const mcpConfigFileSchema = z.object({
  mcpServers: z.record(z.string(), z.unknown()),
});

export type McpApprovalMode = z.infer<typeof approvalModeSchema>;
export type McpApprovalSetting = z.infer<typeof approvalSchema>;
export type McpStdioServerConfig = z.infer<typeof stdioServerSchema>;
export type McpHttpServerConfig = z.infer<typeof httpServerSchema>;
export type McpServerConfig = z.infer<typeof mcpServerSchema>;

export function isStdioServer(
  config: McpServerConfig,
): config is McpStdioServerConfig {
  return 'command' in config;
}
