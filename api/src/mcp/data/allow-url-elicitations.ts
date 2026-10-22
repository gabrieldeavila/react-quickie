import type { MCPClient } from '@ai-sdk/mcp';
import { fillUrlElicitationSchema } from '../domain/fill-url-elicitation-schema';

type IncomingRequest = { method?: unknown; params?: unknown };
type RequestHandler = (request: IncomingRequest) => Promise<void>;
type WithRequestHandler = { onRequestMessage?: RequestHandler };

/**
 * Lets URL-mode elicitations through the SDK's request validation (see
 * `fillUrlElicitationSchema`). The SDK dispatches every server request to
 * the client's own `onRequestMessage`, which is wrapped here; the SDK
 * version is pinned and the sign-in integration test covers it.
 */
export function allowUrlElicitations(client: MCPClient): void {
  const target = client as unknown as WithRequestHandler;
  const original: RequestHandler | undefined =
    target.onRequestMessage?.bind(client);
  if (!original) return;
  target.onRequestMessage = (request: IncomingRequest): Promise<void> =>
    original(fillUrlElicitationSchema(request));
}
