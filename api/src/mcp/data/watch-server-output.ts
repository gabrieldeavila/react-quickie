import type { MCPTransport } from '@ai-sdk/mcp';
import { createInterface } from 'readline';
import type { Readable } from 'stream';

type WithChildProcess = { process?: { stderr?: Readable | null } };

/**
 * Reads a stdio server's stderr line by line, still echoing it to the API's
 * own stderr. The SDK keeps the child process private, so this reaches into
 * it right after `start()` (the SDK version is pinned; the integration test
 * fails if that changes). If stderr isn't reachable, starting fails: an
 * unread pipe would fill up and freeze the server.
 */
export function watchServerOutput(
  transport: MCPTransport,
  onLine: (line: string) => void,
): void {
  const start: () => Promise<void> = transport.start.bind(transport);
  transport.start = async () => {
    await start();
    const stderr = (transport as unknown as WithChildProcess).process?.stderr;
    if (!stderr) {
      throw new Error('Doty could not read the MCP server output.');
    }
    stderr.on('data', (chunk: Buffer) => process.stderr.write(chunk));
    createInterface({ input: stderr }).on('line', onLine);
  };
}
