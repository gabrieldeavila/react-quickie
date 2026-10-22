import { Injectable } from '@nestjs/common';
import * as http from 'http';
import { OAUTH_CALLBACK_PATH } from '../domain/resolve-oauth-callback-url';

export type CallbackHandler = (query: URLSearchParams) => Promise<string>;

/**
 * A loopback-only HTTP listener on a fixed port that serves just the OAuth
 * callback. It runs only while a sign-in is waiting for the browser, for
 * setups where the API's own port changes (VS Code).
 */
@Injectable()
export class OAuthCallbackListener {
  private server?: http.Server;
  private port?: number;

  /** Starts listening on `port` unless already; rejects when the port is taken. */
  async open(port: number, handle: CallbackHandler): Promise<void> {
    if (this.server && this.port === port) return;
    await this.close();

    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
      if (req.method !== 'GET' || url.pathname !== OAUTH_CALLBACK_PATH) {
        res.writeHead(404).end();
        return;
      }
      void handle(url.searchParams).then((html) => {
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.end(html);
      });
    });
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', () => {
        server.off('error', reject);
        resolve();
      });
    });
    this.server = server;
    this.port = port;
  }

  async close(): Promise<void> {
    const server = this.server;
    this.server = undefined;
    this.port = undefined;
    if (!server) return;
    // Lets a response in flight finish; idle keep-alive sockets close now.
    const closed = new Promise<void>((resolve) =>
      server.close(() => resolve()),
    );
    server.closeIdleConnections();
    await closed;
  }
}
