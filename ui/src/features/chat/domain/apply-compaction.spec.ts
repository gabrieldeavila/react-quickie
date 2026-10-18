import { describe, expect, it } from "vitest";
import { applyCompaction } from "./apply-compaction";

const text = (id: string) => ({ id, parts: [{ type: "text" }] });

describe("applyCompaction", () => {
  const compacted = {
    id: "a3",
    parts: [
      { type: "data-compaction", data: { summary: "S", upToMessageId: "a1" } },
      { type: "text" },
    ],
  };

  it("sends everything without a compaction", () => {
    const messages = [text("u1"), text("a1")];

    expect(applyCompaction(messages)).toEqual({ messages });
  });

  it("sends the summary and the messages after upToMessageId", () => {
    const result = applyCompaction([
      text("u1"),
      text("a1"),
      text("u2"),
      compacted,
      text("u3"),
    ]);

    expect(result.messages.map((message) => message.id)).toEqual([
      "u2",
      "a3",
      "u3",
    ]);
    expect(result.compaction).toEqual({ summary: "S", upToMessageId: "a1" });
  });

  it("sends everything when upToMessageId is missing", () => {
    const messages = [text("u2"), compacted];

    expect(applyCompaction(messages)).toEqual({ messages });
  });
});
