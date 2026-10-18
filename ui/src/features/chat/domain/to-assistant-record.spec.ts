import type { UIMessage } from "ai";
import { describe, expect, it } from "vitest";
import {
  shouldPersistAssistantMessage,
  toAssistantRecord,
} from "./to-assistant-record";

const requested = {
  type: "tool-run_bash_command",
  toolCallId: "call-1",
  state: "approval-requested",
  input: { command: "npm test" },
  approval: { id: "ap-1" },
} as unknown as UIMessage["parts"][number];

const finished = {
  ...requested,
  state: "output-available",
  output: "ok",
  approval: { id: "ap-1", approved: true },
} as unknown as UIMessage["parts"][number];

const message = (...parts: UIMessage["parts"]): UIMessage => ({
  id: "msg-1",
  role: "assistant",
  parts,
});

describe("toAssistantRecord", () => {
  it("keys the record by the useChat message id", () => {
    const record = toAssistantRecord("c1", message(requested), undefined, 100);

    expect(record).toMatchObject({
      id: "msg-1",
      conversationId: "c1",
      role: "assistant",
      createdAt: 100,
      parts: [requested],
    });
  });

  it("replaces parts on the second onFinish instead of duplicating them", () => {
    const first = toAssistantRecord(
      "c1",
      message({ type: "text", text: "I will run the tests." }, requested),
      undefined,
      100,
    );
    const second = toAssistantRecord(
      "c1",
      message(
        { type: "text", text: "I will run the tests." },
        finished,
        { type: "text", text: " They passed." },
      ),
      first,
      200,
    );

    expect(second.parts).toHaveLength(3);
    expect(second.parts?.filter((part) => part.type.startsWith("tool-"))).toEqual(
      [finished],
    );
    expect(second.createdAt).toBe(100);
    expect(second.content).toBe("I will run the tests. They passed.");
  });

  it("keeps other stored fields of the existing record", () => {
    const existing = {
      ...toAssistantRecord("c1", message(requested), undefined, 100),
      metadata: { pinned: true },
    };

    expect(
      toAssistantRecord("c1", message(finished), existing, 200).metadata,
    ).toEqual({ pinned: true });
  });
});

describe("toAssistantRecord metadata", () => {
  it("stores the turn usage metadata over existing fields", () => {
    const existing = {
      ...toAssistantRecord("c1", message(requested), undefined, 100),
      metadata: { pinned: true, model: "old" },
    };
    const withUsage = {
      ...message(finished),
      metadata: { model: "a:b", costUsd: 0.01 },
    };

    expect(
      toAssistantRecord("c1", withUsage, existing, 200).metadata,
    ).toEqual({ pinned: true, model: "a:b", costUsd: 0.01 });
  });
});

describe("shouldPersistAssistantMessage", () => {
  it("skips empty placeholders and non-assistant messages", () => {
    expect(shouldPersistAssistantMessage(message())).toBe(false);
    expect(
      shouldPersistAssistantMessage({ ...message(finished), role: "user" }),
    ).toBe(false);
    expect(shouldPersistAssistantMessage(message(finished))).toBe(true);
  });
});
