import { describe, expect, it } from "vitest";
import { canEditScope } from "./can-edit-scope";

const project = (exists: boolean, trusted: boolean) => ({
  projectConfig: { path: "/w/.doty/mcp.json", exists, trusted },
});

describe("canEditScope", () => {
  it("always allows the global file", () => {
    expect(canEditScope("global", project(true, false))).toBe(true);
  });

  it("allows the project file when it's trusted or doesn't exist yet", () => {
    expect(canEditScope("project", project(true, true))).toBe(true);
    expect(canEditScope("project", project(false, false))).toBe(true);
    expect(canEditScope("project", project(true, false))).toBe(false);
  });
});
