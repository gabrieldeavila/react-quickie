// Minimal stdio MCP server for tests. `node fake-mcp-server.mjs hang` never
// answers, to exercise the connect timeout.
import { createInterface } from 'node:readline';

const hang = process.argv[2] === 'hang';

const tools = [
  {
    name: 'echo',
    description: 'Echoes the text back',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text'],
    },
    annotations: { title: 'Echo', readOnlyHint: true },
  },
  {
    name: 'big.output',
    description: 'Returns a large text',
    inputSchema: { type: 'object', properties: { size: { type: 'number' } } },
  },
];

function reply(id, result) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id, result })}\n`);
}

function callTool({ name, arguments: args = {} }) {
  if (name === 'echo') return { content: [{ type: 'text', text: args.text }] };
  return { content: [{ type: 'text', text: 'x'.repeat(args.size ?? 10) }] };
}

createInterface({ input: process.stdin }).on('line', (line) => {
  if (hang || !line.trim()) return;
  const message = JSON.parse(line);
  if (message.id === undefined) return; // notification

  if (message.method === 'initialize') {
    reply(message.id, {
      protocolVersion: message.params.protocolVersion,
      capabilities: { tools: {} },
      serverInfo: { name: 'fake', version: '1.0.0' },
    });
  } else if (message.method === 'tools/list') {
    reply(message.id, { tools });
  } else if (message.method === 'tools/call') {
    reply(message.id, callTool(message.params));
  } else {
    reply(message.id, {});
  }
});
