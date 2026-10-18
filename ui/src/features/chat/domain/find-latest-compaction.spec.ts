import { describe, expect, it } from "vitest";
import { findLatestCompaction } from "./find-latest-compaction";

const compactionPart = (summary: string, upToMessageId: string) => ({
  type: "data-compaction",
  data: { summary, upToMessageId },
});

describe("findLatestCompaction", () => {
  it("returns the newest compaction part", () => {
    expect(
      findLatestCompaction([
        { parts: [compactionPart("old", "a1")] },
        { parts: [{ type: "text" }] },
        { parts: [compactionPart("new", "a3"), { type: "text" }] },
      ]),
    ).toEqual({ summary: "new", upToMessageId: "a3" });
  });

  it("ignores malformed parts and messages without parts", () => {
    expect(
      findLatestCompaction([
        {},
        { parts: [{ type: "data-compaction", data: { summary: "" } }] },
      ]),
    ).toBeUndefined();
  });
});
