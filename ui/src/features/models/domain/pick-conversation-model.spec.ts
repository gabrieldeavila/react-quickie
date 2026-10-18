import { describe, expect, it } from "vitest";
import { pickConversationModel } from "./pick-conversation-model";
import type { ModelCatalog } from "./model-catalog.types";

const caps = { supportsTools: true, supportsImages: true, supportsReasoning: true };

const catalog: ModelCatalog = {
  default: "anthropic:claude-sonnet-5-5",
  providers: [
    {
      id: "anthropic",
      label: "Anthropic",
      models: [
        { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5", ...caps },
        { id: "claude-haiku-5-5", label: "Claude Haiku 5.5", ...caps },
      ],
    },
    {
      id: "openai-compatible",
      label: "OpenAI-compatible",
      models: [{ id: "llama3.3:70b", label: "llama3.3:70b", ...caps }],
    },
  ],
};

describe("pickConversationModel", () => {
  it("keeps the conversation's stored model", () => {
    expect(
      pickConversationModel({
        catalog,
        stored: "anthropic:claude-haiku-5-5",
        lastUsed: "openai-compatible:llama3.3:70b",
      }),
    ).toEqual({ ref: "anthropic:claude-haiku-5-5" });
  });

  it("falls back to the default and reports a stored model that lost its key", () => {
    expect(
      pickConversationModel({
        catalog,
        stored: "openai:gpt-6.1-sol",
        lastUsed: "anthropic:claude-haiku-5-5",
      }),
    ).toEqual({
      ref: "anthropic:claude-sonnet-5-5",
      unavailable: "openai:gpt-6.1-sol",
    });
  });

  it("uses the last-used model for a conversation without one", () => {
    expect(
      pickConversationModel({ catalog, lastUsed: "openai-compatible:llama3.3:70b" }),
    ).toEqual({ ref: "openai-compatible:llama3.3:70b" });
  });

  it("ignores an unavailable last-used model without a notice", () => {
    expect(
      pickConversationModel({ catalog, lastUsed: "deepseek:deepseek-v4-pro" }),
    ).toEqual({ ref: "anthropic:claude-sonnet-5-5" });
  });

  it("returns null when nothing is configured", () => {
    const empty: ModelCatalog = { default: null, providers: [] };
    expect(pickConversationModel({ catalog: empty })).toEqual({ ref: null });
    expect(
      pickConversationModel({ catalog: empty, stored: "openai:gpt-6.1-sol" }),
    ).toEqual({ ref: null, unavailable: "openai:gpt-6.1-sol" });
  });
});
