import type { PendingOAuthFlow } from './mcp-oauth.types';

/** How long the user has to finish signing in in the browser. */
export const OAUTH_FLOW_TTL_MS = 10 * 60_000;

type Entry = { flow: PendingOAuthFlow; expiresAt: number };

/**
 * Sign-ins waiting for the browser, by OAuth `state`. Each state works once
 * and expires, so a stray or replayed callback can't complete a sign-in.
 */
export class PendingOAuthFlows {
  private readonly entries = new Map<string, Entry>();

  add(state: string, flow: PendingOAuthFlow, now: number): void {
    this.prune(now);
    this.entries.set(state, { flow, expiresAt: now + OAUTH_FLOW_TTL_MS });
  }

  /** The flow for `state`, removed so it can't be used again. */
  take(state: string, now: number): PendingOAuthFlow | undefined {
    this.prune(now);
    const entry = this.entries.get(state);
    this.entries.delete(state);
    return entry?.flow;
  }

  /** No sign-in is waiting for the browser (expired ones don't count). */
  isEmpty(now: number): boolean {
    this.prune(now);
    return this.entries.size === 0;
  }

  private prune(now: number): void {
    for (const [state, entry] of this.entries) {
      if (entry.expiresAt <= now) this.entries.delete(state);
    }
  }
}
