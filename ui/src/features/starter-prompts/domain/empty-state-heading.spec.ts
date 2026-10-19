import { describe, expect, it } from "vitest";
import { AgentFocusEnum, type CombinedAgentEnum } from "~types/enum/agent.enum";
import { AgentFocusPluginEnum } from "~types/plugin/specialty.plugin";
import { emptyStateHeading } from "./empty-state-heading";

describe("emptyStateHeading", () => {
  it("asks what to build in the frontend and backend modes", () => {
    expect(emptyStateHeading(AgentFocusEnum.FRONTEND)).toBe(
      "What do you want to build?",
    );
    expect(emptyStateHeading(AgentFocusEnum.BACKEND)).toBe(
      "What do you want to build?",
    );
  });

  it("has its own heading for Git and Agent Builder", () => {
    expect(emptyStateHeading(AgentFocusEnum.GIT)).toBe(
      "What do you want to do with Git?",
    );
    expect(emptyStateHeading(AgentFocusPluginEnum.AGENT_BUILDER)).toBe(
      "What agent do you want to build?",
    );
  });

  it("falls back to the default heading for an unknown mode", () => {
    expect(emptyStateHeading("unknown" as CombinedAgentEnum)).toBe(
      "What do you want to build?",
    );
  });
});
