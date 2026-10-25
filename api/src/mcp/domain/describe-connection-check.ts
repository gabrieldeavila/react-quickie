export type ConnectionCheck =
  | { status: 'connected'; toolCount: number }
  | { status: 'needs-sign-in' }
  | { status: 'error'; error: string }
  /** Disabled, or a project server waiting for trust: not connected. */
  | { status: 'inactive'; reason: string };

/** What the agent tells the user after saving a server. */
export function describeConnectionCheck(
  name: string,
  check: ConnectionCheck,
): string {
  switch (check.status) {
    case 'connected':
      return `"${name}" connected with ${check.toolCount} tool(s); they are available from the next message.`;
    case 'needs-sign-in':
      return `"${name}" needs the user to sign in. Doty shows a sign-in prompt in the chat; tell the user to click Sign in there, then the tools are available.`;
    case 'error':
      return `"${name}" did not connect: ${check.error}. Report this to the user as it is; don't guess a fix you can't check.`;
    case 'inactive':
      return `"${name}" is saved but not active: ${check.reason}.`;
  }
}
