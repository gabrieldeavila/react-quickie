import { describe, expect, it } from "vitest";
import { AgentFocusEnum, type CombinedAgentEnum } from "~types/enum/agent.enum";
import { AgentFocusPluginEnum } from "~types/plugin/specialty.plugin";
import { starterPromptsFor } from "./starter-prompts";

const ALL_MODES: CombinedAgentEnum[] = [
  ...Object.values(AgentFocusEnum),
  ...Object.values(AgentFocusPluginEnum),
];

describe("starterPromptsFor", () => {
  it.each(ALL_MODES)("gives 3 or 4 prompts for %s", (mode) => {
    const prompts = starterPromptsFor(mode);

    expect(prompts.length).toBeGreaterThanOrEqual(3);
    expect(prompts.length).toBeLessThanOrEqual(4);
  });

  it.each(ALL_MODES)("gives %s prompts with unique labels and text", (mode) => {
    const prompts = starterPromptsFor(mode);
    const labels = new Set(prompts.map((prompt) => prompt.label));

    expect(labels.size).toBe(prompts.length);
    for (const prompt of prompts) {
      expect(prompt.label.trim()).not.toBe("");
      expect(prompt.text.trim()).not.toBe("");
    }
  });

  it("gives frontend prompts for the frontend mode", () => {
    expect(starterPromptsFor(AgentFocusEnum.FRONTEND)[0].label).toBe(
      "Landing page",
    );
  });

  it("falls back to the agnostic prompts for an unknown mode", () => {
    expect(starterPromptsFor("unknown" as CombinedAgentEnum)).toEqual(
      starterPromptsFor(AgentFocusEnum.AGNOSTIC),
    );
  });
});
