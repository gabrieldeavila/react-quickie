import { describe, expect, it } from "vitest";
import {
  DEFAULT_STARTER_PROMPTS,
  MAX_STARTER_PROMPTS,
  starterPromptsFor,
  toStarterPrompt,
} from "./starter-prompts";

describe("starterPromptsFor", () => {
  it("falls back to the default prompts without selected starters", () => {
    expect(starterPromptsFor([])).toBe(DEFAULT_STARTER_PROMPTS);
    expect(starterPromptsFor([{ starters: [] }])).toBe(DEFAULT_STARTER_PROMPTS);
  });

  it("uses the selected instructions' starters in order, deduplicated", () => {
    const prompts = starterPromptsFor([
      { starters: ["Build a form", "Add validation"] },
      { starters: ["Add validation", "Write an endpoint"] },
    ]);

    expect(prompts.map(({ text }) => text)).toEqual([
      "Build a form",
      "Add validation",
      "Write an endpoint",
    ]);
  });

  it("caps the number of prompts", () => {
    const starters = Array.from({ length: 9 }, (_, index) => `Prompt ${index}`);

    expect(starterPromptsFor([{ starters }])).toHaveLength(MAX_STARTER_PROMPTS);
  });

  it("has unique, non-empty default labels", () => {
    const labels = new Set(DEFAULT_STARTER_PROMPTS.map(({ label }) => label));

    expect(labels.size).toBe(DEFAULT_STARTER_PROMPTS.length);
    for (const prompt of DEFAULT_STARTER_PROMPTS) {
      expect(prompt.label.trim()).not.toBe("");
      expect(prompt.text.trim()).not.toBe("");
    }
  });
});

describe("toStarterPrompt", () => {
  it("keeps short text as its own label", () => {
    expect(toStarterPrompt("Build a form")).toEqual({
      label: "Build a form",
      text: "Build a form",
    });
  });

  it("shortens long labels but keeps the full text", () => {
    const text =
      "Build a landing page for a SaaS product with pricing and FAQ";
    const prompt = toStarterPrompt(text);

    expect(prompt.text).toBe(text);
    expect(prompt.label.endsWith("…")).toBe(true);
    expect(prompt.label.length).toBeLessThanOrEqual(40);
  });
});
