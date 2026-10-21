import { describe, expect, it } from "vitest";
import { getHostFeatures } from "./host-features";

describe("getHostFeatures", () => {
  it("enables everything in the browser and keeps the in-page header", () => {
    expect(getHostFeatures("browser")).toEqual({
      canCreateProjects: true,
      canTypeRoot: true,
      hasViewTitleActions: false,
      hasEditorKeybindings: false,
    });
  });

  it("disables source-tree features in VSCode and uses title-bar actions", () => {
    expect(getHostFeatures("vscode")).toEqual({
      canCreateProjects: false,
      canTypeRoot: false,
      hasViewTitleActions: true,
      hasEditorKeybindings: true,
    });
  });
});
