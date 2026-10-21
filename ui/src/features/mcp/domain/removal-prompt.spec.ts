import { describe, expect, it } from "vitest";
import { removalPrompt } from "./removal-prompt";

describe("removalPrompt", () => {
  it("names the server and its file", () => {
    expect(removalPrompt({ name: "github", scope: "project" })).toEqual({
      message: 'Remove "github" from the project mcp.json?',
      confirmLabel: "Remove",
    });
  });
});
