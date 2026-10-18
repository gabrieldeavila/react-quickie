import { describe, expect, it } from "vitest";
import { parseFileReference } from "./parse-file-reference";

describe("parseFileReference", () => {
  it("reads relative and absolute file paths", () => {
    expect(parseFileReference("src/app.ts")).toEqual({ path: "src/app.ts" });
    expect(parseFileReference("./README.md")).toEqual({ path: "README.md" });
    expect(parseFileReference("/work/api/src/main.ts")).toEqual({
      path: "/work/api/src/main.ts",
    });
  });

  it("reads a line in :line, :line:col and #Lline forms", () => {
    expect(parseFileReference("src/app.ts:42")).toEqual({
      path: "src/app.ts",
      line: 42,
    });
    expect(parseFileReference("src/app.ts:42:7")).toEqual({
      path: "src/app.ts",
      line: 42,
    });
    expect(parseFileReference("ui/App.tsx#L9")).toEqual({
      path: "ui/App.tsx",
      line: 9,
    });
  });

  it("ignores URLs, prose and code that only looks dotted", () => {
    expect(parseFileReference("https://example.com/a.ts")).toBeNull();
    expect(parseFileReference("console.log")).toBeNull();
    expect(parseFileReference("v1.2.3")).toBeNull();
    expect(parseFileReference("npm run build")).toBeNull();
    expect(parseFileReference("src/components")).toBeNull();
    expect(parseFileReference("")).toBeNull();
  });

  it("drops a :0 line", () => {
    expect(parseFileReference("src/app.ts:0")).toEqual({ path: "src/app.ts" });
  });
});
