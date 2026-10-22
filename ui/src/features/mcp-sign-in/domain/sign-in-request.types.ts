/** Mirrors `GET /mcp/sign-in-requests` in the API (`api/src/mcp`). */
export type SignInSource = "oauth" | "elicitation" | "server-output";

export type SignInRequest = {
  id: string;
  serverName: string;
  source: SignInSource;
  /** The site the user will sign in to, when known. */
  host?: string;
  message?: string;
};
