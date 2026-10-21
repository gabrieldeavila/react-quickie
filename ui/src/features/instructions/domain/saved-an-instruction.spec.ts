import type { UIMessage } from "ai";
import { describe, expect, it } from "vitest";
import { savedAnInstruction } from "./saved-an-instruction";

const messageWith = (...parts: unknown[]) =>
  ({ id: "m1", role: "assistant", parts }) as UIMessage;

const savePart = (state: string, output?: unknown) => ({
  type: "tool-save_instruction",
  toolCallId: "c1",
  input: {},
  state,
  output,
});

describe("savedAnInstruction", () => {
  it("is true after a successful save", () => {
    const message = messageWith(
      { type: "text", text: "Done." },
      savePart("output-available", { success: true }),
    );
    expect(savedAnInstruction(message)).toBe(true);
  });

  it("is false while the save waits for approval or failed", () => {
    expect(
      savedAnInstruction(messageWith(savePart("approval-requested"))),
    ).toBe(false);
    expect(
      savedAnInstruction(
        messageWith(savePart("output-available", { success: false })),
      ),
    ).toBe(false);
  });

  it("ignores other tools", () => {
    const message = messageWith({
      type: "tool-read_instruction",
      state: "output-available",
      output: { success: true },
    });
    expect(savedAnInstruction(message)).toBe(false);
  });
});
