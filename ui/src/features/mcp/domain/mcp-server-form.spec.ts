import { describe, expect, it } from "vitest";
import {
  emptyServerForm,
  formFromServer,
  formToConfig,
} from "./mcp-server-form";
import type { McpServerView } from "./mcp-server.types";

const view = (config: unknown, extra: Partial<McpServerView> = {}): McpServerView => ({
  name: "db",
  source: "project",
  scope: "project",
  transport: "stdio",
  status: "idle",
  disabled: false,
  config,
  ...extra,
});

describe("formFromServer / formToConfig", () => {
  it("round-trips a stdio server and keeps fields the form doesn't edit", () => {
    const config = {
      command: "npx",
      args: ["-y", "server-postgres"],
      env: { TOKEN: "••••", MODE: "${MODE}" },
      approval: { query: "never" },
      disabled: true,
      timeout: 30,
    };
    const form = formFromServer(view(config));

    expect(form).toMatchObject({
      name: "db",
      scope: "project",
      transport: "stdio",
      command: "npx",
      args: ["-y", "server-postgres"],
      env: [
        { key: "TOKEN", value: "••••" },
        { key: "MODE", value: "${MODE}" },
      ],
      extra: { approval: { query: "never" }, disabled: true, timeout: 30 },
    });
    expect(formToConfig(form)).toEqual(config);
  });

  it("round-trips an http server", () => {
    const config = {
      type: "http",
      url: "https://api.example.com/mcp",
      headers: { Authorization: "Bearer ${TOKEN}" },
    };

    expect(formToConfig(formFromServer(view(config)))).toEqual(config);
    expect(formFromServer(view(config)).transport).toBe("http");
  });

  it("drops empty args, keyless rows and empty maps", () => {
    expect(
      formToConfig({
        ...emptyServerForm(),
        name: "x",
        command: " run ",
        args: ["", " --flag "],
        env: [{ key: " ", value: "orphan" }],
      }),
    ).toEqual({ command: "run", args: ["--flag"] });
  });

  it("writes only the fields of the chosen transport", () => {
    const form = {
      ...emptyServerForm(),
      transport: "sse" as const,
      command: "left over",
      url: "https://x/sse",
    };

    expect(formToConfig(form)).toEqual({ type: "sse", url: "https://x/sse" });
  });

  it("starts empty for a server without a readable config", () => {
    expect(formFromServer(view(undefined))).toMatchObject({
      command: "",
      args: [],
      env: [],
      extra: {},
    });
  });
});
