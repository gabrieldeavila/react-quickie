import { describe, expect, it } from "vitest";
import type { McpServerView } from "./mcp-server.types";
import { serverActions } from "./server-actions";

const server = (overrides: Partial<McpServerView>): McpServerView => ({
  name: "gh",
  source: "global",
  scope: "global",
  transport: "http",
  status: "connected",
  disabled: false,
  ...overrides,
});

describe("serverActions", () => {
  it("offers everything for an editable, connected server", () => {
    expect(serverActions(server({}), { canEdit: true, canOpenFile: true })).toEqual([
      "edit",
      "disable",
      "reconnect",
      "tools",
      "remove",
      "openFile",
    ]);
  });

  it("offers enable (no tools, no reconnect) for a disabled server", () => {
    expect(
      serverActions(server({ status: "disabled", disabled: true }), {
        canEdit: true,
        canOpenFile: false,
      }),
    ).toEqual(["edit", "enable", "remove"]);
  });

  it("only lets you open the file of an untrusted project server", () => {
    expect(
      serverActions(server({ scope: "project", status: "untrusted" }), {
        canEdit: false,
        canOpenFile: true,
      }),
    ).toEqual(["openFile"]);
  });
});
