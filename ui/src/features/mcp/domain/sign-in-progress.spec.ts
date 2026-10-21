import { describe, expect, it } from "vitest";
import type { McpServerView } from "./mcp-server.types";
import {
  hasSignInTimedOut,
  isSignInDone,
  SIGN_IN_WAIT_MS,
} from "./sign-in-progress";

const server = (overrides: Partial<McpServerView>): McpServerView => ({
  name: "drive",
  source: "global",
  scope: "global",
  transport: "http",
  status: "needs-auth",
  disabled: false,
  ...overrides,
});

describe("sign-in progress", () => {
  it("is done once the server holds tokens and stops asking", () => {
    expect(isSignInDone(server({ signedIn: true, status: "idle" }))).toBe(true);
    expect(isSignInDone(server({ signedIn: true }))).toBe(false);
    expect(isSignInDone(server({ status: "idle" }))).toBe(false);
    expect(isSignInDone(undefined)).toBe(false);
  });

  it("times out after the wait limit", () => {
    const pending = {
      serverName: "drive",
      authorizationUrl: "https://accounts.example.com/auth",
      startedAt: 1000,
    };
    expect(hasSignInTimedOut(pending, 1000 + SIGN_IN_WAIT_MS - 1)).toBe(false);
    expect(hasSignInTimedOut(pending, 1000 + SIGN_IN_WAIT_MS)).toBe(true);
  });
});
