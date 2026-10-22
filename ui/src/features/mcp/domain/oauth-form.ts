import type { KeyValueRow } from "./mcp-server-form";
import type { McpScope, McpServerView } from "./mcp-server.types";

/** The `oauth` block as the form edits it. */
export type OAuthFormValues = {
  clientId: string;
  /** "••••" for a stored literal secret (the API keeps it on save). */
  clientSecret: string;
  /** Space-separated scopes. */
  scope: string;
  /** `authorizationParams`: extra sign-in URL parameters. */
  params: KeyValueRow[];
};

/** A server whose OAuth client can be reused for another one. */
export type OAuthClientSource = {
  scope: McpScope;
  name: string;
  oauth: OAuthFormValues;
};

/** Google only issues a refresh token with these; without them sign-in lasts ~1 h. */
export const STAY_SIGNED_IN_PARAMS: KeyValueRow[] = [
  { key: "access_type", value: "offline" },
  { key: "prompt", value: "consent" },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function emptyOAuthForm(): OAuthFormValues {
  return { clientId: "", clientSecret: "", scope: "", params: [] };
}

export function readOAuthForm(value: unknown): OAuthFormValues {
  if (!isRecord(value)) return emptyOAuthForm();
  const params = isRecord(value.authorizationParams)
    ? Object.entries(value.authorizationParams).map(([key, item]) => ({
        key,
        value: text(item),
      }))
    : [];
  return {
    clientId: text(value.clientId),
    clientSecret: text(value.clientSecret),
    scope: text(value.scope),
    params,
  };
}

/** The `oauth` block to store; undefined when every field is empty. */
export function oauthFormToConfig(
  form: OAuthFormValues,
): Record<string, unknown> | undefined {
  const params = Object.fromEntries(
    form.params
      .filter((row) => row.key.trim())
      .map((row) => [row.key.trim(), row.value]),
  );
  const oauth = Object.fromEntries(
    Object.entries({
      clientId: form.clientId.trim(),
      clientSecret: form.clientSecret.trim(),
      scope: form.scope.trim().replace(/\s+/g, " "),
      authorizationParams: Object.keys(params).length ? params : undefined,
    }).filter(([, value]) => value !== undefined && value !== ""),
  );
  return Object.keys(oauth).length ? oauth : undefined;
}

/** Adds Google's stay-signed-in parameters that aren't there yet. */
export function withStaySignedIn(rows: KeyValueRow[]): KeyValueRow[] {
  const keys = new Set(rows.map((row) => row.key.trim()));
  return [
    ...rows.filter((row) => row.key.trim() || row.value.trim()),
    ...STAY_SIGNED_IN_PARAMS.filter((row) => !keys.has(row.key)),
  ];
}

/** Other servers with a client ID: their client can be reused. */
export function reusableOAuthClients(
  servers: McpServerView[],
  current: { scope: McpScope; name: string },
): OAuthClientSource[] {
  return servers.flatMap((server) => {
    const isCurrent =
      server.scope === current.scope && server.name === current.name;
    const oauth = readOAuthForm(
      isRecord(server.config) ? server.config.oauth : undefined,
    );
    return isCurrent || !oauth.clientId
      ? []
      : [{ scope: server.scope, name: server.name, oauth }];
  });
}

/**
 * Copies the client (ID, secret, sign-in parameters). Scopes differ per
 * server (Docs vs Gmail), so the current ones stay unless there are none.
 */
export function reuseOAuthClient(
  current: OAuthFormValues,
  source: OAuthClientSource,
): OAuthFormValues {
  return {
    clientId: source.oauth.clientId,
    clientSecret: source.oauth.clientSecret,
    scope: current.scope.trim() ? current.scope : source.oauth.scope,
    params: source.oauth.params,
  };
}
