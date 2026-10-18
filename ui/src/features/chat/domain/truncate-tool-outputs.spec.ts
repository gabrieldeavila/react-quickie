import { describe, expect, it } from "vitest";
import type { RequestMessage } from "./build-request-messages";
import { truncateToolOutputs } from "./truncate-tool-outputs";

const tool = (output: unknown, state = "output-available") => ({
  type: "tool-read_file",
  toolCallId: "c",
  state,
  input: {},
  output,
});
const user = (id: string): RequestMessage => ({
  id,
  role: "user",
  parts: [{ type: "text", text: "q" }],
});
const assistant = (id: string, ...parts: RequestMessage["parts"]) => ({
  id,
  role: "assistant",
  parts,
});

describe("truncateToolOutputs", () => {
  const big = "x".repeat(50);

  it("replaces large outputs in older turns with a preview", () => {
    const [, old] = truncateToolOutputs(
      [user("u1"), assistant("a1", tool(big)), user("u2")],
      10,
    );

    expect(old.parts[0].output).toEqual({
      truncated: true,
      preview: "x".repeat(10),
      originalSize: 50,
    });
  });

  it("measures object outputs by their JSON size", () => {
    const [, old] = truncateToolOutputs(
      [user("u1"), assistant("a1", tool({ data: big })), user("u2")],
      10,
    );

    expect(old.parts[0].output).toMatchObject({
      truncated: true,
      originalSize: JSON.stringify({ data: big }).length,
    });
  });

  it("sends the latest turn in full, including an assistant continuing after approval", () => {
    const messages = [
      user("u1"),
      assistant("a1", tool(big)),
      user("u2"),
      assistant("a2", tool(big)),
    ];

    const result = truncateToolOutputs(messages, 10);

    expect(result[1].parts[0].output).toMatchObject({ truncated: true });
    expect(result[3]).toBe(messages[3]);
  });

  it("leaves small outputs, unfinished calls and non-tool parts alone", () => {
    const small = tool("ok");
    const pending = tool(undefined, "approval-requested");
    const text = { type: "text", text: big };
    const messages = [user("u1"), assistant("a1", small, pending, text), user("u2")];

    expect(truncateToolOutputs(messages, 10)[1].parts).toEqual([
      small,
      pending,
      text,
    ]);
  });
});
