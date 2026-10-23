import { describe, expect, it } from "vitest";
import { pickAutoApprove } from "./pick-auto-approve";

describe("pickAutoApprove", () => {
  it("uses the conversation's stored value", () => {
    expect(
      pickAutoApprove({ conversationId: "c1", stored: true, draft: false }),
    ).toBe(true);
    expect(
      pickAutoApprove({ conversationId: "c1", stored: false, draft: true }),
    ).toBe(false);
  });

  it("is off for a conversation that never turned it on", () => {
    expect(pickAutoApprove({ conversationId: "c1", draft: true })).toBe(false);
  });

  it("uses the draft before the conversation exists", () => {
    expect(pickAutoApprove({ conversationId: null, draft: true })).toBe(true);
    expect(pickAutoApprove({ conversationId: undefined, draft: false })).toBe(
      false,
    );
  });
});
