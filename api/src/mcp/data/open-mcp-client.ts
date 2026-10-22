import type { Logger } from '@nestjs/common';
import {
  createMCPClient,
  ElicitationRequestSchema,
  type MCPClient,
  type MCPTransport,
  type OAuthClientProvider,
} from '@ai-sdk/mcp';
import type { Tool } from 'ai';
import { isUnauthorizedError } from '../domain/is-unauthorized-error';
import type { UsableMcpServer } from '../domain/mcp-server.types';
import { findSignInUrl } from '../domain/sign-in-url';
import { allowUrlElicitations } from './allow-url-elicitations';
import { createMcpTransport } from './create-mcp-transport';
import type { McpSignInRequestsService } from './mcp-sign-in-requests.service';
import { watchServerOutput } from './watch-server-output';
import { withTimeout } from './with-timeout';

export type OpenedMcpClient = {
  client: MCPClient;
  tools: Record<string, Tool>;
};

export type OpenMcpClientInput = {
  root: string;
  server: UsableMcpServer;
  authProvider?: OAuthClientProvider;
  signIns: McpSignInRequestsService;
  logger: Logger;
  timeoutMs: number;
  /** Called when a stdio process exits after connecting. */
  onLost: (error: unknown) => void;
};

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isTransport(value: unknown): value is MCPTransport {
  return typeof (value as MCPTransport)?.start === 'function';
}

/** A stdio process that exits marks the server as failed, so it reconnects later. */
function watchClose(transport: MCPTransport, onLost: (error: unknown) => void) {
  const clientOnClose = transport.onclose;
  transport.onclose = () => {
    clientOnClose?.();
    onLost(new Error('The MCP server process exited.'));
  };
}

/**
 * Connects one server and lists its tools, within the timeout. Any sign-in
 * the server asks for (URL elicitation, a printed login link) goes to the
 * sign-in requests; a 401 surfaces as the thrown `UnauthorizedError`.
 */
export function openMcpClient(
  input: OpenMcpClientInput,
): Promise<OpenedMcpClient> {
  const { root, server, signIns, logger } = input;
  const transport = createMcpTransport(server.config, root, input.authProvider);
  if (isTransport(transport)) {
    watchServerOutput(transport, (line) => {
      const url = findSignInUrl(line);
      if (url) signIns.addFromOutput(root, server.name, url);
    });
  }

  const opening = (async () => {
    const client = await createMCPClient({
      transport,
      clientName: 'doty',
      // Doty can open URLs (sign-in pages); it has no forms to fill.
      capabilities: { elicitation: { url: {} } },
      // Not fatal on its own (e.g. a malformed notification); a dead
      // process is caught by `watchClose`. A 401 is reported here too; the
      // needs-auth status covers it.
      onUncaughtError: (error) => {
        if (isUnauthorizedError(error)) return;
        logger.warn(`MCP "${server.name}": ${describeError(error)}`);
      },
    });
    allowUrlElicitations(client);
    client.onElicitationRequest(ElicitationRequestSchema, (request) =>
      signIns.handleElicitation(root, server.name, request.params),
    );
    if (isTransport(transport)) watchClose(transport, input.onLost);
    try {
      return { client, tools: await client.tools() };
    } catch (error) {
      await client.close().catch(() => undefined);
      throw error;
    }
  })();

  return withTimeout(opening, input.timeoutMs, () => {
    // Kills a stdio process that never finished the handshake.
    if (isTransport(transport)) void transport.close().catch(() => undefined);
    void opening.then(({ client }) => client.close()).catch(() => undefined);
  });
}
