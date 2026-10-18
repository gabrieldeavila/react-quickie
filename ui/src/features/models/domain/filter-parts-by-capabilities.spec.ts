import { describe, expect, it } from "vitest";
import type { RequestMessage } from "@/features/chat/domain/build-request-messages";
import {
  filterPartsByCapabilities,
  type ModelTarget,
} from "./filter-parts-by-capabilities";

const all = { supportsTools: true, supportsImages: true, supportsReasoning: true };

const target = (
  providerId: string,
  capabilities: Partial<ModelTarget["capabilities"]> = {},
): ModelTarget => ({ providerId, capabilities: { ...all, ...capabilities } });

const text = { type: "text", text: "hi" };
const image = { type: "file", mediaType: "image/png", url: "data:x" };
const anthropicReasoning = {
  type: "reasoning",
  text: "",
  providerMetadata: { anthropic: { signature: "sig" } },
};
const openaiReasoning = {
  type: "reasoning",
  text: "",
  providerMetadata: { openai: { itemId: "rs_1" } },
};
const plainReasoning = { type: "reasoning", text: "thinking" };
const toolPart = {
  type: "tool-read_file",
  toolCallId: "call_1",
  state: "output-available",
  callProviderMetadata: { openai: { itemId: "fc_1" } },
};

const conversation: RequestMessage[] = [
  { id: "u1", role: "user", parts: [text, image] },
  {
    id: "a1",
    role: "assistant",
    parts: [anthropicReasoning, openaiReasoning, plainReasoning, toolPart, text],
  },
];

const partsOf = (messages: RequestMessage[], id: string) =>
  messages.find((message) => message.id === id)?.parts;

describe("filterPartsByCapabilities", () => {
  it("keeps everything the model supports and its own reasoning", () => {
    const result = filterPartsByCapabilities(conversation, target("anthropic"));
    expect(partsOf(result, "u1")).toEqual([text, image]);
    expect(partsOf(result, "a1")).toEqual([
      anthropicReasoning,
      plainReasoning,
      toolPart,
      text,
    ]);
  });

  it("drops reasoning signed by another provider after a switch", () => {
    const result = filterPartsByCapabilities(conversation, target("openai"));
    expect(partsOf(result, "a1")).toEqual([openaiReasoning, plainReasoning, toolPart, text]);
  });

  it("keeps tool calls with another provider's metadata", () => {
    const result = filterPartsByCapabilities(conversation, target("deepseek"));
    expect(partsOf(result, "a1")).toContain(toolPart);
  });

  it("drops all reasoning for a model without reasoning", () => {
    const result = filterPartsByCapabilities(
      conversation,
      target("openai-compatible", { supportsReasoning: false }),
    );
    expect(partsOf(result, "a1")).toEqual([toolPart, text]);
  });

  it("drops images for a model without image input", () => {
    const result = filterPartsByCapabilities(
      conversation,
      target("deepseek", { supportsImages: false }),
    );
    expect(partsOf(result, "u1")).toEqual([text]);
  });

  it("drops a message left empty", () => {
    const imageOnly: RequestMessage[] = [{ id: "u1", role: "user", parts: [image] }];
    expect(
      filterPartsByCapabilities(imageOnly, target("deepseek", { supportsImages: false })),
    ).toEqual([]);
  });
});
