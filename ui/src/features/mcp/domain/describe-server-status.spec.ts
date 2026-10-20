import { describe, expect, it } from "vitest";
import {
  describeServerStatus,
  needsProjectTrust,
} from "./describe-server-status";
import type { McpServerView } from "./mcp-server.types";

const server = (overrides: Partial<McpServerView>): McpServerView => ({
  name: "gh",
  source: "global",
  scope: "global",
  transport: "http",
  status: "idle",
  disabled: false,
  ...overrides,
});

describe("describeServerStatus", () => {
  it("shows the tool count when connected", () => {
    expect(
      describeServerStatus(server({ status: "connected", toolCount: 3 })),
    ).toEqual({
      label: "Connected · 3 tools",
      tone: "ok",
      canReconnect: true,
    });
    expect(
      describeServerStatus(server({ status: "connected", toolCount: 1 })).label,
    ).toBe("Connected · 1 tool");
  });

  it("does not offer reconnect for untrusted or connecting servers", () => {
    expect(
      describeServerStatus(server({ status: "untrusted" })).canReconnect,
    ).toBe(false);
    expect(
      describeServerStatus(server({ status: "connecting" })).canReconnect,
    ).toBe(false);
  });

  it("marks errors and lets the user retry", () => {
    expect(describeServerStatus(server({ status: "error" }))).toMatchObject({
      tone: "error",
      canReconnect: true,
    });
  });

  it("shows disabled servers as muted, without reconnect", () => {
    expect(describeServerStatus(server({ status: "disabled" }))).toEqual({
      label: "Disabled",
      tone: "muted",
      canReconnect: false,
    });
  });
});

describe("needsProjectTrust", () => {
  it("is true only for an existing, untrusted project config", () => {
    expect(needsProjectTrust({ exists: true, trusted: false, hash: "h" })).toBe(
      true,
    );
    expect(needsProjectTrust({ exists: true, trusted: true, hash: "h" })).toBe(
      false,
    );
    expect(needsProjectTrust({ exists: false, trusted: false })).toBe(false);
  });
});
