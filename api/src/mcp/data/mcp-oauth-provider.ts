import type {
  OAuthAuthorizationServerInformation,
  OAuthClientInformation,
  OAuthClientMetadata,
  OAuthClientProvider,
  OAuthTokens,
} from '@ai-sdk/mcp';
import { randomBytes } from 'crypto';
import type { McpOAuthSettings } from '../domain/mcp-config.schema';
import type { McpOAuthRecord } from '../domain/mcp-oauth.types';
import { resolveOAuthClientInformation } from '../domain/resolve-oauth-client-information';
import type { McpOAuthRepository } from './mcp-oauth.repository';

type InvalidationScope = 'all' | 'client' | 'tokens' | 'verifier';

const WITHOUT: Record<InvalidationScope, (keyof McpOAuthRecord)[]> = {
  all: [
    'tokens',
    'clientInformation',
    'clientRedirectUrl',
    'authorizationServerInformation',
    'codeVerifier',
    'state',
  ],
  client: ['clientInformation', 'clientRedirectUrl'],
  tokens: ['tokens'],
  verifier: ['codeVerifier'],
};

function omit(
  record: McpOAuthRecord,
  fields: (keyof McpOAuthRecord)[],
): McpOAuthRecord {
  const next = { ...record };
  for (const field of fields) delete next[field];
  return next;
}

/**
 * The SDK's view of one server's OAuth state, backed by the repository.
 *
 * `interactive` is false for background connections: they read and refresh
 * tokens but never start a sign-in, which would overwrite the state and
 * verifier of one the user may have open in the browser.
 */
export class McpOAuthProvider implements OAuthClientProvider {
  /** Set when the SDK asks to send the user to the provider. */
  authorizationUrl?: URL;

  constructor(
    private readonly repository: McpOAuthRepository,
    private readonly key: string,
    private readonly settings: McpOAuthSettings | undefined,
    readonly redirectUrl: string,
    private readonly interactive: boolean,
  ) {}

  get clientMetadata(): OAuthClientMetadata {
    return {
      client_name: 'Doty',
      redirect_uris: [this.redirectUrl],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
      ...(this.settings?.scope ? { scope: this.settings.scope } : {}),
    };
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    return (await this.record()).tokens;
  }

  saveTokens(tokens: OAuthTokens): Promise<void> {
    return this.update((record) => ({
      ...omit(record, ['codeVerifier', 'state']),
      tokens,
    }));
  }

  async clientInformation(): Promise<OAuthClientInformation | undefined> {
    return resolveOAuthClientInformation(
      this.settings,
      await this.record(),
      this.redirectUrl,
    );
  }

  async saveClientInformation(
    clientInformation: OAuthClientInformation,
  ): Promise<void> {
    if (this.settings?.clientId) return;
    await this.update((record) => ({
      ...record,
      clientInformation,
      clientRedirectUrl: this.redirectUrl,
    }));
  }

  async authorizationServerInformation(): Promise<
    OAuthAuthorizationServerInformation | undefined
  > {
    return (await this.record()).authorizationServerInformation;
  }

  async saveAuthorizationServerInformation(
    authorizationServerInformation: OAuthAuthorizationServerInformation,
  ): Promise<void> {
    if (!this.interactive) return;
    await this.update((record) => ({
      ...record,
      authorizationServerInformation,
    }));
  }

  state(): string {
    return randomBytes(24).toString('base64url');
  }

  async saveState(state: string): Promise<void> {
    if (!this.interactive) return;
    await this.update((record) => ({ ...record, state }));
  }

  async storedState(): Promise<string | undefined> {
    return (await this.record()).state;
  }

  async saveCodeVerifier(codeVerifier: string): Promise<void> {
    if (!this.interactive) return;
    await this.update((record) => ({ ...record, codeVerifier }));
  }

  async codeVerifier(): Promise<string> {
    const { codeVerifier } = await this.record();
    if (!codeVerifier) throw new Error('No sign-in in progress.');
    return codeVerifier;
  }

  redirectToAuthorization(authorizationUrl: URL): void {
    this.authorizationUrl = authorizationUrl;
  }

  invalidateCredentials(scope: InvalidationScope): Promise<void> {
    return this.update((record) => omit(record, WITHOUT[scope]));
  }

  private record(): Promise<McpOAuthRecord> {
    return this.repository.get(this.key);
  }

  private update(
    change: (record: McpOAuthRecord) => McpOAuthRecord,
  ): Promise<void> {
    return this.repository.update(this.key, change);
  }
}
