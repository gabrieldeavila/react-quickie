import { describe, expect, it } from "vitest";
import { emptyServerForm } from "./mcp-server-form";
import { validateMcpServerForm } from "./validate-mcp-server-form";

const stdio = { ...emptyServerForm(), name: "db", command: "db-mcp" };
const http = {
  ...emptyServerForm(),
  name: "gh",
  transport: "http" as const,
  url: "https://api.example.com/mcp",
};

describe("validateMcpServerForm", () => {
  it("accepts complete stdio and http servers", () => {
    expect(validateMcpServerForm(stdio)).toEqual({});
    expect(validateMcpServerForm(http)).toEqual({});
    expect(
      validateMcpServerForm({ ...http, url: "${MCP_URL}" }),
    ).toEqual({});
  });

  it("checks the name like the API", () => {
    expect(validateMcpServerForm({ ...stdio, name: "" }).name).toBeTruthy();
    expect(validateMcpServerForm({ ...stdio, name: "a b" }).name).toBeTruthy();
    expect(validateMcpServerForm({ ...stdio, name: "a.b_c-1" }).name).toBeUndefined();
  });

  it("needs a command for stdio and a valid URL for http", () => {
    expect(validateMcpServerForm({ ...stdio, command: " " }).command).toBeTruthy();
    expect(validateMcpServerForm({ ...http, url: "" }).url).toBeTruthy();
    expect(validateMcpServerForm({ ...http, url: "not a url" }).url).toMatch(
      /valid URL/,
    );
  });

  it("flags values without a name and duplicate names", () => {
    expect(
      validateMcpServerForm({ ...stdio, env: [{ key: "", value: "x" }] }).env,
    ).toMatch(/needs a name/);
    expect(
      validateMcpServerForm({
        ...http,
        headers: [
          { key: "A", value: "1" },
          { key: "A", value: "2" },
        ],
      }).headers,
    ).toMatch(/unique/);
  });

  it("ignores the other transport's fields", () => {
    expect(validateMcpServerForm({ ...http, command: "" })).toEqual({});
  });
});
