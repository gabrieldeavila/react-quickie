import { describe, expect, it } from "vitest";
import { getToolFilePath } from "./get-tool-file-path";

describe("getToolFilePath", () => {
  it("reads the path field of each file tool", () => {
    expect(
      getToolFilePath({ type: "tool-read_file", input: { path: "src/a.ts" } }),
    ).toBe("src/a.ts");
    expect(
      getToolFilePath({ type: "tool-edit_file", input: { name: "src/b.ts" } }),
    ).toBe("src/b.ts");
    expect(
      getToolFilePath({
        type: "tool-move_file_or_folder",
        input: { sourcePath: "a.ts", destinationPath: "lib/a.ts" },
      }),
    ).toBe("lib/a.ts");
  });

  it("returns null for folder tools, missing input or blank paths", () => {
    expect(
      getToolFilePath({
        type: "tool-list_folders",
        input: { parentPath: "." },
      }),
    ).toBeNull();
    expect(getToolFilePath({ type: "tool-read_file" })).toBeNull();
    expect(
      getToolFilePath({ type: "tool-read_file", input: { path: "  " } }),
    ).toBeNull();
  });
});
