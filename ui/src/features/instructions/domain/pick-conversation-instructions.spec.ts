import { describe, expect, it } from "vitest";
import { pickConversationInstructions } from "./pick-conversation-instructions";

describe("pickConversationInstructions", () => {
  it("uses the conversation's own selection, even when empty", () => {
    expect(
      pickConversationInstructions({ stored: ["forms"], lastUsed: ["api"] }),
    ).toEqual(["forms"]);
    expect(
      pickConversationInstructions({ stored: [], lastUsed: ["api"] }),
    ).toEqual([]);
  });

  it("starts a new conversation with the project's last selection", () => {
    expect(pickConversationInstructions({ lastUsed: ["api"] })).toEqual([
      "api",
    ]);
  });
});
