// Stdio MCP server that asks for a login the two non-HTTP ways, for tests:
// it prints a login link to stderr on start, and its `login` tool sends a
// URL-mode `elicitation/create` (only if the client declared support).
import { createInterface } from 'node:readline';

process.stderr.write(
  'Please visit https://accounts.example.com/o/oauth2/auth?client_id=x to authorize.\n',
);

let canOpenUrls = false;
const pendingCalls = new Map();

function send(message) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', ...message })}\n`);
}

function startLogin(callId) {
  if (!canOpenUrls) {
    send({
      id: callId,
      result: { content: [{ type: 'text', text: 'no url capability' }] },
    });
    return;
  }
  const elicitId = `elicit-${callId}`;
  pendingCalls.set(elicitId, callId);
  send({
    id: elicitId,
    method: 'elicitation/create',
    params: {
      mode: 'url',
      url: 'https://login.example.com/connect?session=abc',
      message: 'Connect your Example account',
      elicitationId: 'e1',
    },
  });
}

createInterface({ input: process.stdin }).on('line', (line) => {
  if (!line.trim()) return;
  const message = JSON.parse(line);

  // The client's answer to our elicitation.
  if (message.method === undefined && pendingCalls.has(message.id)) {
    const callId = pendingCalls.get(message.id);
    pendingCalls.delete(message.id);
    const text = `elicitation: ${message.result?.action ?? 'error'}`;
    send({ id: callId, result: { content: [{ type: 'text', text }] } });
    return;
  }
  if (message.id === undefined) return; // notification

  if (message.method === 'initialize') {
    canOpenUrls = !!message.params.capabilities?.elicitation?.url;
    send({
      id: message.id,
      result: {
        protocolVersion: message.params.protocolVersion,
        capabilities: { tools: {} },
        serverInfo: { name: 'fake-sign-in', version: '1.0.0' },
      },
    });
  } else if (message.method === 'tools/list') {
    send({
      id: message.id,
      result: {
        tools: [
          {
            name: 'login',
            description: 'Asks the client to open a login page',
            inputSchema: { type: 'object', properties: {} },
          },
        ],
      },
    });
  } else if (message.method === 'tools/call') {
    startLogin(message.id);
  } else {
    send({ id: message.id, result: {} });
  }
});
