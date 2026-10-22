import type { McpSignInRequest, SignInSource } from './sign-in-request.types';

export type NewSignInRequest = Omit<McpSignInRequest, 'id' | 'createdAt'>;

/** Requests older than this are dropped (the user ignored them). */
export const SIGN_IN_REQUEST_TTL_MS = 30 * 60_000;

/**
 * Open sign-in requests. The same server, source and URL make one request,
 * so a server that prints its link on every start doesn't pile up popups.
 * A printed link replaces the server's previous one: servers print a new
 * link (new state) on every attempt, and only the latest one works.
 */
export class SignInRequestRegistry {
  private readonly requests = new Map<string, McpSignInRequest>();

  constructor(private readonly createId: () => string) {}

  add(request: NewSignInRequest, now: number): McpSignInRequest {
    this.prune(now);
    const existing = [...this.requests.values()].find(
      (item) =>
        item.root === request.root &&
        item.serverName === request.serverName &&
        item.source === request.source &&
        item.url === request.url,
    );
    if (existing) return existing;
    if (request.source === 'server-output') {
      this.clearServer(request.root, request.serverName, ['server-output']);
    }
    const created = { ...request, id: this.createId(), createdAt: now };
    this.requests.set(created.id, created);
    return created;
  }

  get(id: string): McpSignInRequest | undefined {
    return this.requests.get(id);
  }

  list(root: string, now: number): McpSignInRequest[] {
    this.prune(now);
    return [...this.requests.values()].filter((item) => item.root === root);
  }

  has(root: string, serverName: string): boolean {
    return [...this.requests.values()].some(
      (item) => item.root === root && item.serverName === serverName,
    );
  }

  remove(id: string): McpSignInRequest | undefined {
    const request = this.requests.get(id);
    this.requests.delete(id);
    return request;
  }

  /** Removes a server's requests from these sources; returns what was removed. */
  clearServer(
    root: string,
    serverName: string,
    sources: SignInSource[],
  ): McpSignInRequest[] {
    const removed = [...this.requests.values()].filter(
      (item) =>
        item.root === root &&
        item.serverName === serverName &&
        sources.includes(item.source),
    );
    for (const item of removed) this.requests.delete(item.id);
    return removed;
  }

  private prune(now: number): void {
    for (const [id, item] of this.requests) {
      if (now - item.createdAt >= SIGN_IN_REQUEST_TTL_MS)
        this.requests.delete(id);
    }
  }
}
