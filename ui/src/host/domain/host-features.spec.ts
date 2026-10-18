import { describe, expect, it } from "vitest";
import { filterModeOptions, getHostFeatures } from "./host-features";

const options = [{ value: "frontend" }, { value: "agent_builder" }];

describe("getHostFeatures", () => {
  it("enables everything in the browser", () => {
    expect(getHostFeatures("browser")).toEqual({
      canCreateProjects: true,
      canBuildAgents: true,
      canTypeRoot: true,
    });
  });

  it("disables source-tree features in VSCode", () => {
    expect(getHostFeatures("vscode")).toEqual({
      canCreateProjects: false,
      canBuildAgents: false,
      canTypeRoot: false,
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
