import { describe, expect, it } from "vitest";
import { filterModeOptions, getHostFeatures } from "./host-features";

const options = [{ value: "frontend" }, { value: "agent_builder" }];

describe("getHostFeatures", () => {
  it("enables everything in the browser and keeps the in-page header", () => {
    expect(getHostFeatures("browser")).toEqual({
      canCreateProjects: true,
      canBuildAgents: true,
      canTypeRoot: true,
      hasViewTitleActions: false,
    });
  });

  it("disables source-tree features in VSCode and uses title-bar actions", () => {
    expect(getHostFeatures("vscode")).toEqual({
      canCreateProjects: false,
      canBuildAgents: false,
      canTypeRoot: false,
      hasViewTitleActions: true,
    });
  });
});

describe("filterModeOptions", () => {
  it("keeps Agent Builder only when the host supports it", () => {
    expect(filterModeOptions(options, getHostFeatures("browser"))).toEqual(
      options,
    );
    expect(filterModeOptions(options, getHostFeatures("vscode"))).toEqual([
      { value: "frontend" },
    ]);
  });
});
