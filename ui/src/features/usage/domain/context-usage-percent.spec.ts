import { describe, expect, it } from "vitest";
import { contextUsagePercent } from "./context-usage-percent";

const usage = (input: number, output: number) => ({
  inputTokens: input,
  outputTokens: output,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
  reasoningTokens: 0,
});

const assistant = (metadata?: unknown) => ({ role: "assistant", metadata });
const user = { role: "user", metadata: { model: "x", usage: usage(9, 9) } };

describe("contextUsagePercent", () => {
  const messages = [
    assistant({ model: "a", contextTokens: 100 }),
    assistant({ model: "a", contextTokens: 640 }),
    user,
  ];

  it("uses the latest measured turn", () => {
    expect(contextUsagePercent(messages, 1000)).toBe(64);
  });

  it("is undefined without a window or a measured turn", () => {
    expect(contextUsagePercent(messages, undefined)).toBeUndefined();
    expect(contextUsagePercent([user], 1000)).toBeUndefined();
  });

  it("caps at 100", () => {
    expect(
      contextUsagePercent(
        [assistant({ model: "a", contextTokens: 5000 })],
        1000,
      ),
    ).toBe(100);
  });
});
