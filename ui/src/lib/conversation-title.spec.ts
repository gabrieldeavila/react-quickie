import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONVERSATION_TITLE,
  getConversationTitle,
  getMigratedConversationTitle,
  isDefaultConversationTitle,
} from "./conversation-title";

describe("conversation-title", () => {
  it("uses the default title for an empty message", () => {
    expect(getConversationTitle("   ")).toBe("New conversation");
  });

  it("normalizes whitespace and truncates long messages", () => {
    expect(getConversationTitle("  hello \n world ")).toBe("hello world");
    const title = getConversationTitle("a".repeat(60));
    expect(title).toBe(`${"a".repeat(42)}…`);
  });

  it("treats empty, current and legacy defaults as default titles", () => {
    expect(isDefaultConversationTitle("")).toBe(true);
    expect(isDefaultConversationTitle(DEFAULT_CONVERSATION_TITLE)).toBe(true);
    expect(isDefaultConversationTitle("Nova conversa")).toBe(true);
    expect(isDefaultConversationTitle("Build a login form")).toBe(false);
  });

  it("migrates a legacy default title", () => {
    expect(getMigratedConversationTitle("Nova conversa")).toBe(
      "New conversation",
    );
    expect(getMigratedConversationTitle("Nova conversa", "Fix the header")).toBe(
      "Fix the header",
    );
  });

  it("keeps custom titles", () => {
    expect(getMigratedConversationTitle("My chat", "Fix the header")).toBe(
      "My chat",
    );
  });
});
