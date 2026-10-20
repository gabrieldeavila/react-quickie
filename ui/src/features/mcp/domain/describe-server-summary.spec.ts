import { describe, expect, it } from "vitest";
import {
  describeServerLaunch,
  describeServerSummary,
} from "./describe-server-summary";
import type { McpServerView } from "./mcp-server.types";

const server = (overrides: Partial<McpServerView>): McpServerView => ({
  name: "gh",
  source: "global",
  scope: "global",
  transport: "http",
  status: "connected",
  disabled: false,
  ...overrides,
});

describe("describeServerSummary", () => {
  it("lists transport, scope and tools", () => {
    expect(describeServerSummary(server({ toolCount: 12 }))).toBe(
      "http · global · 12 tools",
    );
    expect(describeServerSummary(server({ toolCount: 1 }))).toBe(
      "http · global · 1 tool",
    );
    expect(describeServerSummary(server({}))).toBe("http · global");
  });

  it("says disabled or not trusted instead of a tool count", () => {
    expect(
      describeServerSummary(
        server({ transport: "stdio", scope: "project", disabled: true, toolCount: 3 }),
      ),
    ).toBe("stdio · project · disabled");
    expect(
      describeServerSummary(
        server({ transport: "unknown", scope: "project", status: "untrusted" }),
      ),
    ).toBe("project · not trusted");
  });
});

describe("describeServerLaunch", () => {
  it("shows the command line or the URL", () => {
    expect(
      describeServerLaunch(server({ config: { command: "npx", args: ["-y", "pkg"] } })),
    ).toBe("npx -y pkg");
    expect(describeServerLaunch(server({ config: { url: "https://x/mcp" } }))).toBe(
      "https://x/mcp",
    );
    expect(describeServerLaunch(server({ config: 3 }))).toBe("(invalid entry)");
  });
});
