import type { MCPTransport, OAuthClientProvider } from '@ai-sdk/mcp';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from '@ai-sdk/mcp/mcp-stdio';
import {
  isStdioServer,
  type McpHttpServerConfig,
  type McpServerConfig,
} from '../domain/mcp-config.schema';

type HttpTransportConfig = Pick<
  McpHttpServerConfig,
  'type' | 'url' | 'headers'
> & { authProvider?: OAuthClientProvider };

/**
 * Stdio servers run in the project root. The SDK passes them only a safe set
 * of inherited env vars (HOME, PATH, …) plus the config's `env`. Http/sse
 * servers get the OAuth provider, used when the server answers 401.
 */
export function createMcpTransport(
  config: McpServerConfig,
  cwd: string,
  authProvider?: OAuthClientProvider,
): MCPTransport | HttpTransportConfig {
  if (isStdioServer(config)) {
    return new StdioMCPTransport({
      command: config.command,
      args: config.args,
      env: config.env,
      cwd,
      // Read by `watchServerOutput`, which echoes it and looks for login links.
      stderr: 'pipe',
    });
  }
  return {
    type: config.type,
    url: config.url,
    headers: config.headers,
    ...(authProvider ? { authProvider } : {}),
  };
}
