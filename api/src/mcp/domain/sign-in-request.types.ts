/**
 * How a server asked for a login:
 * - `oauth`: an http/sse server answered 401 (MCP authorization spec)
 * - `elicitation`: the server sent a URL-mode `elicitation/create`
 * - `server-output`: a local server printed a login URL (best guess)
 */
export type SignInSource = 'oauth' | 'elicitation' | 'server-output';

export type McpSignInRequest = {
  id: string;
  root: string;
  serverName: string;
  source: SignInSource;
  /** The page to open; none for `oauth` (the flow builds it on accept). */
  url?: string;
  /** What the server said, for `elicitation`. */
  message?: string;
  createdAt: number;
};
