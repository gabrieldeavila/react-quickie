import { describe, expect, it } from "vitest";
import { describeSignInRequest } from "./describe-sign-in-request";

describe("describeSignInRequest", () => {
  it("asks to sign in for an OAuth server", () => {
    expect(
      describeSignInRequest({ id: "1", serverName: "linear", source: "oauth" }),
    ).toEqual({
      title: "linear needs you to sign in",
      detail: "Opens the server's sign-in page in your browser.",
    });
  });

  it("shows the server's message and the site for an elicitation", () => {
    expect(
      describeSignInRequest({
        id: "2",
        serverName: "drive",
        source: "elicitation",
        host: "accounts.google.com",
        message: "Connect your Google account.",
      }).detail,
    ).toBe("Connect your Google account. Opens accounts.google.com.");
  });

  it("names the site and warns for a printed link", () => {
    const text = describeSignInRequest({
      id: "3",
      serverName: "drive",
      source: "server-output",
      host: "accounts.google.com",
    });
    expect(text.title).toBe("drive printed a sign-in link");
    expect(text.detail).toMatch(/^Opens accounts\.google\.com\. Continue only/);
  });
});
