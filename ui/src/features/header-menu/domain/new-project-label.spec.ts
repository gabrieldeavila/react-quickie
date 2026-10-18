import { describe, expect, it } from "vitest";
import { getHostFeatures } from "@/host/domain/host-features";
import { AgentFocusEnum } from "~types/enum/agent.enum";
import { AgentFocusPluginEnum } from "~types/plugin/specialty.plugin";
import { newProjectLabel } from "./new-project-label";

const browser = getHostFeatures("browser");

describe("newProjectLabel", () => {
  it("names the project after the mode", () => {
    expect(newProjectLabel(AgentFocusEnum.FRONTEND, browser)).toBe(
      "New frontend",
    );
    expect(newProjectLabel(AgentFocusEnum.BACKEND, browser)).toBe(
      "New backend",
    );
    expect(newProjectLabel(AgentFocusEnum.AGNOSTIC, browser)).toBe(
      "New full-stack server",
    );
  });

  it("is not offered for modes without templates", () => {
    expect(newProjectLabel(AgentFocusEnum.GIT, browser)).toBeNull();
    expect(
      newProjectLabel(AgentFocusPluginEnum.AGENT_BUILDER, browser),
    ).toBeNull();
  });

  it("is not offered when the host can't create projects", () => {
    expect(
      newProjectLabel(AgentFocusEnum.FRONTEND, getHostFeatures("vscode")),
    ).toBeNull();
  });
});
