import * as http from 'http';
import type { AddressInfo } from 'net';

// An http MCP server behind OAuth, for tests: discovery, dynamic client
// registration, PKCE token exchange, and a JSON-only Streamable HTTP endpoint
// that answers 401 until it gets the issued access token.

export const FAKE_CODE = 'the-code';
const ACCESS_TOKEN = 'access-1';

type JsonRpc = {
  id?: number;
  method: string;
  params?: { protocolVersion?: string };
};

export type FakeOAuthMcpServer = {
  url: string;
  mcpUrl: string;
  /** The `code_verifier` the token request carried (PKCE). */
  lastCodeVerifier?: string;
  close: () => Promise<void>;
};

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += String(chunk)));
    req.on('end', () => resolve(body));
  });
}

function sendJson(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function answerMcp(message: JsonRpc): unknown {
  if (message.method === 'initialize') {
    return {
      protocolVersion: message.params?.protocolVersion,
      capabilities: { tools: {} },
      serverInfo: { name: 'fake-oauth', version: '1.0.0' },
    };
  }
  if (message.method === 'tools/list') {
    return {
      tools: [
        {
          name: 'echo',
          description: 'Echoes',
          inputSchema: { type: 'object', properties: {} },
        },
      ],
    };
  }
  return {};
}

export async function startFakeOAuthMcpServer(): Promise<FakeOAuthMcpServer> {
  const state: { lastCodeVerifier?: string } = {};
  let base = '';

  const server = http.createServer((req, res) => {
    void (async () => {
      const url = new URL(req.url ?? '/', base);
      const body = await readBody(req);

      if (url.pathname.startsWith('/.well-known/oauth-protected-resource')) {
        return sendJson(res, 200, {
          resource: `${base}/mcp`,
          authorization_servers: [base],
        });
      }
      if (url.pathname === '/.well-known/oauth-authorization-server') {
        return sendJson(res, 200, {
          issuer: base,
          authorization_endpoint: `${base}/authorize`,
          token_endpoint: `${base}/token`,
          registration_endpoint: `${base}/register`,
          response_types_supported: ['code'],
          code_challenge_methods_supported: ['S256'],
          token_endpoint_auth_methods_supported: ['none'],
        });
      }
      if (url.pathname === '/register') {
        return sendJson(res, 201, {
          ...(JSON.parse(body) as object),
          client_id: 'client-1',
        });
      }
      if (url.pathname === '/token') {
        const params = new URLSearchParams(body);
        if (params.get('code') !== FAKE_CODE) {
          return sendJson(res, 400, { error: 'invalid_grant' });
        }
        state.lastCodeVerifier = params.get('code_verifier') ?? undefined;
        return sendJson(res, 200, {
          access_token: ACCESS_TOKEN,
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: 'refresh-1',
        });
      }
      if (url.pathname === '/mcp') {
        if (req.headers.authorization !== `Bearer ${ACCESS_TOKEN}`) {
          res.writeHead(401, {
            'WWW-Authenticate': `Bearer resource_metadata="${base}/.well-known/oauth-protected-resource/mcp"`,
          });
          return res.end();
        }
        if (req.method !== 'POST') {
          res.writeHead(405);
          return res.end();
        }
        const message = JSON.parse(body) as JsonRpc;
        if (message.id === undefined) {
          res.writeHead(202);
          return res.end();
        }
        return sendJson(res, 200, {
          jsonrpc: '2.0',
          id: message.id,
          result: answerMcp(message),
        });
      }
      res.writeHead(404);
      res.end();
    })();
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  return {
    url: base,
    mcpUrl: `${base}/mcp`,
    get lastCodeVerifier() {
      return state.lastCodeVerifier;
    },
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}
