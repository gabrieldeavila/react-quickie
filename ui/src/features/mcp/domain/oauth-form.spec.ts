import { describe, expect, it } from "vitest";
import type { McpServerView } from "./mcp-server.types";
import {
  emptyOAuthForm,
  oauthFormToConfig,
  readOAuthForm,
  reusableOAuthClients,
  reuseOAuthClient,
  withStaySignedIn,
} from "./oauth-form";

const googleOAuth = {
  clientId: "id.apps.googleusercontent.com",
  clientSecret: "••••",
  scope: "https://www.googleapis.com/auth/documents",
  authorizationParams: { access_type: "offline", prompt: "consent" },
};

const server = (overrides: Partial<McpServerView>): McpServerView => ({
  name: "docs",
  source: "global",
  scope: "global",
  transport: "http",
  status: "connected",
  disabled: false,
  ...overrides,
});

describe("oauth form", () => {
  it("round-trips the oauth block", () => {
    expect(oauthFormToConfig(readOAuthForm(googleOAuth))).toEqual(googleOAuth);
  });

  it("stores nothing when every field is empty", () => {
    expect(oauthFormToConfig(emptyOAuthForm())).toBeUndefined();
    expect(
      oauthFormToConfig({
        ...emptyOAuthForm(),
        params: [{ key: " ", value: "" }],
      }),
    ).toBeUndefined();
  });

  it("normalizes scopes to single spaces", () => {
    expect(
      oauthFormToConfig({ ...emptyOAuthForm(), scope: " a \n b  c " }),
    ).toEqual({ scope: "a b c" });
  });

  it("adds the stay-signed-in parameters once", () => {
    const rows = withStaySignedIn([{ key: "prompt", value: "consent" }]);
    expect(rows).toEqual([
      { key: "prompt", value: "consent" },
      { key: "access_type", value: "offline" },
    ]);
    expect(withStaySignedIn(rows)).toEqual(rows);
  });
});

describe("reusing an OAuth client", () => {
  it("offers other servers that have a client ID", () => {
    const servers = [
      server({ name: "docs", config: { oauth: googleOAuth } }),
      server({ name: "drive", config: { oauth: googleOAuth } }),
      server({ name: "linear", config: { type: "http", url: "https://x" } }),
    ];
    expect(
      reusableOAuthClients(servers, { scope: "global", name: "drive" }).map(
        (source) => source.name,
      ),
    ).toEqual(["docs"]);
  });

  it("copies the client but keeps the scopes already typed", () => {
    const [source] = reusableOAuthClients(
      [server({ config: { oauth: googleOAuth } })],
      { scope: "global", name: "gmail" },
    );
    const typed = {
      ...emptyOAuthForm(),
      scope: "https://www.googleapis.com/auth/gmail.readonly",
    };

    expect(reuseOAuthClient(typed, source)).toEqual({
      clientId: "id.apps.googleusercontent.com",
      clientSecret: "••••",
      scope: "https://www.googleapis.com/auth/gmail.readonly",
      params: [
        { key: "access_type", value: "offline" },
        { key: "prompt", value: "consent" },
      ],
    });
    expect(reuseOAuthClient(emptyOAuthForm(), source).scope).toBe(
      googleOAuth.scope,
    );
  });
});
