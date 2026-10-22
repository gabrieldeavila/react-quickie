import { Injectable } from '@nestjs/common';
import type { ElicitResult } from '@ai-sdk/mcp';
import { randomUUID } from 'crypto';
import { parseUrlElicitation } from '../domain/parse-url-elicitation';
import {
  SIGN_IN_REQUEST_TTL_MS,
  SignInRequestRegistry,
} from '../domain/sign-in-request-registry';
import type { McpSignInRequest } from '../domain/sign-in-request.types';

type ElicitAction = ElicitResult['action'];

/**
 * Sign-in requests from every MCP server, whatever asked: a 401, a URL
 * elicitation or a login link a local server printed. The chat shows them
 * as a popup; URL elicitations wait here until the user answers.
 */
@Injectable()
export class McpSignInRequestsService {
  private readonly registry = new SignInRequestRegistry(() => randomUUID());
  private readonly waiters = new Map<string, (action: ElicitAction) => void>();

  list(root: string): McpSignInRequest[] {
    return this.registry.list(root, Date.now());
  }

  get(id: string): McpSignInRequest | undefined {
    return this.registry.get(id);
  }

  has(root: string, serverName: string): boolean {
    return this.registry.has(root, serverName);
  }

  addFromOAuth(root: string, serverName: string): void {
    this.registry.add({ root, serverName, source: 'oauth' }, Date.now());
  }

  addFromOutput(root: string, serverName: string, url: string): void {
    this.registry.add(
      { root, serverName, source: 'server-output', url },
      Date.now(),
    );
  }

  /** The server signed in (or connected): its OAuth request is done. */
  clearOAuth(root: string, serverName: string): void {
    this.registry.clearServer(root, serverName, ['oauth']);
  }

  /** A tool call of the server worked: the links it printed are stale. */
  clearPrintedLinks(root: string, serverName: string): void {
    this.registry.clearServer(root, serverName, ['server-output']);
  }

  /** The client closed: its printed links and open elicitations are stale. */
  onServerClosed(root: string, serverName: string): void {
    const removed = this.registry.clearServer(root, serverName, [
      'server-output',
      'elicitation',
    ]);
    for (const request of removed) this.settle(request.id, 'cancel');
  }

  /**
   * Answers an `elicitation/create`: URL mode becomes a sign-in request and
   * resolves when the user answers (or `cancel` after the TTL); form mode,
   * which Doty doesn't support, is declined.
   */
  handleElicitation(
    root: string,
    serverName: string,
    params: unknown,
  ): Promise<ElicitResult> {
    const elicitation = parseUrlElicitation(params);
    if (!elicitation) return Promise.resolve({ action: 'decline' });

    const request = this.registry.add(
      {
        root,
        serverName,
        source: 'elicitation',
        url: elicitation.url,
        message: elicitation.message,
      },
      Date.now(),
    );
    return new Promise((resolve) => {
      const timer = setTimeout(
        () => this.settle(request.id, 'cancel'),
        SIGN_IN_REQUEST_TTL_MS,
      );
      timer.unref();
      this.waiters.set(request.id, (action) => {
        clearTimeout(timer);
        resolve({ action });
      });
    });
  }

  /**
   * The user clicked Sign in. URL requests are done once the page opens;
   * an OAuth request stays until the server connects.
   */
  accept(id: string): McpSignInRequest | undefined {
    const request = this.registry.get(id);
    if (!request) return undefined;
    if (request.source !== 'oauth') {
      this.registry.remove(id);
      this.settle(id, 'accept');
    }
    return request;
  }

  dismiss(id: string): McpSignInRequest | undefined {
    const request = this.registry.remove(id);
    if (request) this.settle(id, 'decline');
    return request;
  }

  private settle(id: string, action: ElicitAction): void {
    const resolve = this.waiters.get(id);
    this.waiters.delete(id);
    this.registry.remove(id);
    resolve?.(action);
  }
}
