import { describe, expect, it } from "vitest";
import { sumConversationUsage } from "./sum-conversation-usage";

const usage = (input: number, output: number) => ({
  inputTokens: input,
  outputTokens: output,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
  reasoningTokens: 0,
});

const assistant = (metadata?: unknown) => ({ role: "assistant", metadata });
const user = { role: "user", metadata: { model: "x", usage: usage(9, 9) } };

describe("sumConversationUsage", () => {
  it("adds up assistant turns and their known costs", () => {
    expect(
      sumConversationUsage([
        user,
        assistant({ model: "a", usage: usage(100, 10), costUsd: 0.01 }),
        assistant({ model: "a", usage: usage(200, 20) }),
        assistant({ model: "a", usage: usage(300, 30), costUsd: 0.02 }),
        assistant({ model: "a" }),
      ]),
    ).toEqual({ inputTokens: 600, outputTokens: 60, costUsd: 0.03, turns: 3 });
  });

  it("has no cost when no turn had a price", () => {
    expect(
      sumConversationUsage([assistant({ model: "a", usage: usage(1, 1) })])
        .costUsd,
    ).toBeUndefined();
  });
});
