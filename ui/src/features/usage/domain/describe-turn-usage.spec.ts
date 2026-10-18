import { describe, expect, it } from "vitest";
import { describeTurnUsage } from "./describe-turn-usage";
import { turnTokenTotals } from "./turn-token-totals";

const usage = (input: number, output: number) => ({
  inputTokens: input,
  outputTokens: output,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
  reasoningTokens: 0,
});

const turn = {
  model: "a:b",
  usage: usage(1000, 100),
  costUsd: 0.5,
  extraUsage: [
    {
      source: "subagent" as const,
      model: "c:d",
      usage: usage(2000, 200),
      costUsd: 0.2,
    },
    { source: "compaction" as const, model: "e:f", usage: usage(500, 50) },
  ],
};

describe("turnTokenTotals", () => {
  it("adds the extras to the main model's tokens", () => {
    expect(turnTokenTotals(turn)).toEqual({
      inputTokens: 3500,
      outputTokens: 350,
    });
  });

  it("is zero without usage", () => {
    expect(turnTokenTotals({ model: "a:b" })).toEqual({
      inputTokens: 0,
      outputTokens: 0,
    });
  });
});

describe("describeTurnUsage", () => {
  it("is just the model without extras", () => {
    expect(describeTurnUsage({ model: "a:b", usage: usage(1, 1) })).toBe(
      "a:b",
    );
  });

  it("lists each call with its share of the cost", () => {
    expect(describeTurnUsage(turn).split("\n")).toEqual([
      "a:b — 1.0k in · 100 out · $0.30",
      "Subagente (c:d) — 2.0k in · 200 out · $0.20",
      "Resumo do contexto (e:f) — 500 in · 50 out",
    ]);
  });
});
