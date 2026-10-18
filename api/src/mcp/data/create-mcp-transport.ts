import type { MCPTransport } from '@ai-sdk/mcp';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from '@ai-sdk/mcp/mcp-stdio';
import {
  isStdioServer,
  type McpHttpServerConfig,
  type McpServerConfig,
} from '../domain/mcp-config.schema';

type HttpTransportConfig = Pick<
  McpHttpServerConfig,
  'type' | 'url' | 'headers'
>;

/**
 * Stdio servers run in the project root. The SDK passes them only a safe set
 * of inherited env vars (HOME, PATH, …) plus the config's `env`.
 */
export function createMcpTransport(
  config: McpServerConfig,
  cwd: string,
): MCPTransport | HttpTransportConfig {
  if (isStdioServer(config)) {
    return new StdioMCPTransport({
      command: config.command,
      args: config.args,
      env: config.env,
      cwd,
    });
  }
  return { type: config.type, url: config.url, headers: config.headers };
}
