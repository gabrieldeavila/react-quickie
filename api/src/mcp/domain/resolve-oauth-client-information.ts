import type { OAuthClientInformation } from '@ai-sdk/mcp';
import type { McpOAuthSettings } from './mcp-config.schema';
import type { McpOAuthRecord } from './mcp-oauth.types';

/**
 * The OAuth client Doty signs in as: the one from the config when set
 * (pre-registered), else the dynamically registered one, as long as it was
 * registered for the current redirect URL (the API port may change between
 * VS Code sessions). Undefined → the SDK registers a new client.
 */
export function resolveOAuthClientInformation(
  settings: McpOAuthSettings | undefined,
  record: McpOAuthRecord,
  redirectUrl: string,
): OAuthClientInformation | undefined {
  if (settings?.clientId) {
    return {
      client_id: settings.clientId,
      ...(settings.clientSecret
        ? { client_secret: settings.clientSecret }
        : {}),
    };
  }
  if (record.clientRedirectUrl !== redirectUrl) return undefined;
  return record.clientInformation;
}
