import type { McpSignInRequest, SignInSource } from './sign-in-request.types';

/** What the chat shows; the URL itself is only handed out on accept. */
export type SignInRequestView = {
  id: string;
  serverName: string;
  source: SignInSource;
  /** The site the user will sign in to, when known. */
  host?: string;
  message?: string;
};

export function toSignInRequestView(
  request: McpSignInRequest,
): SignInRequestView {
  return {
    id: request.id,
    serverName: request.serverName,
    source: request.source,
    ...(request.url ? { host: new URL(request.url).host } : {}),
    ...(request.message ? { message: request.message } : {}),
  };
}
