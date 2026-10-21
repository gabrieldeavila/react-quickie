import type { McpServerView } from "./mcp-server.types";

/** A sign-in the user started; the browser tab may still be open. */
export type PendingSignIn = {
  serverName: string;
  authorizationUrl: string;
  startedAt: number;
};

/** How long the dialog keeps checking before it gives up waiting. */
export const SIGN_IN_WAIT_MS = 5 * 60_000;

/** Done when the server holds tokens and no longer asks for a sign-in. */
export function isSignInDone(server: McpServerView | undefined): boolean {
  return !!server?.signedIn && server.status !== "needs-auth";
}

export function hasSignInTimedOut(
  pending: PendingSignIn,
  now: number,
): boolean {
  return now - pending.startedAt >= SIGN_IN_WAIT_MS;
}
