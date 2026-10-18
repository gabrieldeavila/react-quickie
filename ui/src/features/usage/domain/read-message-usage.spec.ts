import { describe, expect, it } from "vitest";
import { readMessageUsage } from "./read-message-usage";

const usage = (input: number, output: number) => ({
  inputTokens: input,
  outputTokens: output,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
  reasoningTokens: 0,
});

const assistant = (metadata?: unknown) => ({ role: "assistant", metadata });
const user = { role: "user", metadata: { model: "x", usage: usage(9, 9) } };

describe("readMessageUsage", () => {
  it("reads valid assistant metadata", () => {
    expect(
      readMessageUsage(
        assistant({
          model: "a:b",
          usage: usage(1, 2),
          contextTokens: 3,
          costUsd: 0.1,
        }),
      ),
    ).toEqual({
      model: "a:b",
      usage: usage(1, 2),
      contextTokens: 3,
      costUsd: 0.1,
    });
  });

  it("ignores user messages, missing and malformed metadata", () => {
    expect(readMessageUsage(user)).toBeUndefined();
    expect(readMessageUsage(assistant())).toBeUndefined();
    expect(
      readMessageUsage(
        assistant({ model: "a:b", usage: { inputTokens: "1" }, costUsd: -1 }),
      ),
    ).toEqual({
      model: "a:b",
      usage: undefined,
      contextTokens: undefined,
      costUsd: undefined,
    });
  });
});
