import type {
  OAuthAuthorizationServerInformation,
  OAuthClientInformation,
  OAuthTokens,
} from '@ai-sdk/mcp';

/** What Doty keeps per signed-in server in `<data dir>/mcp-oauth.json`. */
export type McpOAuthRecord = {
  tokens?: OAuthTokens;
  /** From dynamic registration; tied to the redirect URL it was registered with. */
  clientInformation?: OAuthClientInformation;
  clientRedirectUrl?: string;
  authorizationServerInformation?: OAuthAuthorizationServerInformation;
  /** PKCE verifier and CSRF state of the sign-in in progress. */
  codeVerifier?: string;
  state?: string;
};

/** A sign-in the user started and the browser hasn't come back from yet. */
export type PendingOAuthFlow = {
  root: string;
  serverName: string;
  /** The record key at start; a config change in between cancels the flow. */
  key: string;
};
