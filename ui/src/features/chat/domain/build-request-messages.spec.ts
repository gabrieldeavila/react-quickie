import { describe, expect, it } from "vitest";
import { buildRequestMessages } from "./build-request-messages";

const toolPart = {
  type: "tool-read_file",
  toolCallId: "call-1",
  state: "output-available",
  input: { path: "a.ts" },
  output: "export const a = 1;",
};

describe("buildRequestMessages", () => {
  it("keeps text, images, tool calls, dynamic tools and reasoning", () => {
    const image = { type: "file", mediaType: "image/png", url: "data:x" };
    const dynamic = { type: "dynamic-tool", toolName: "mcp__x__y", toolCallId: "c2" };
    const reasoning = { type: "reasoning", text: "thinking" };

    const [user, assistant] = buildRequestMessages([
      { id: "u1", role: "user", parts: [{ type: "text", text: "hi" }, image] },
      {
        id: "a1",
        role: "assistant",
        parts: [reasoning, toolPart, dynamic, { type: "text", text: "done" }],
      },
    ]);

    expect(user.parts).toEqual([{ type: "text", text: "hi" }, image]);
    expect(assistant.parts).toEqual([
      reasoning,
      toolPart,
      dynamic,
      { type: "text", text: "done" },
    ]);
  });

  it("drops UI-only parts and non-image files", () => {
    const [message] = buildRequestMessages([
      {
        id: "a1",
        role: "assistant",
        parts: [
          { type: "step-start" },
          { type: "data-subagent", data: {} },
          { type: "file", mediaType: "application/pdf", url: "x" },
          { type: "text", text: "ok" },
        ],
      },
    ]);

    expect(message.parts).toEqual([{ type: "text", text: "ok" }]);
  });

  it("drops empty assistant placeholders", () => {
    expect(
      buildRequestMessages([
        { id: "a1", role: "assistant", parts: [] },
        { id: "a2", role: "assistant", parts: [{ type: "step-start" }] },
      ]),
    ).toEqual([]);
  });

  it("falls back to content when a stored message has no parts, and fills ids", () => {
    expect(buildRequestMessages([{ role: "user", content: "hello" }])).toEqual([
      { id: "request-0", role: "user", parts: [{ type: "text", text: "hello" }] },
    ]);
  });

  describe("conversations from the old approval flow", () => {
    it("drops the fake [bash-approval-control] user messages", () => {
      const result = buildRequestMessages([
        { id: "u1", role: "user", parts: [{ type: "text", text: "run tests" }] },
        {
          id: "u2",
          role: "user",
          parts: [
            { type: "text", text: "[bash-approval-control] O resultado é..." },
          ],
        },
      ]);

      expect(result.map((message) => message.id)).toEqual(["u1"]);
    });

    it("drops hand-made tool parts that have approvalId but no toolCallId", () => {
      const synthetic = {
        type: "tool-run_bash_command",
        state: "output-available",
        input: { command: "npm test" },
        output: { success: true },
        approvalId: "ap-1",
      };

      const [message] = buildRequestMessages([
        {
          id: "a1",
          role: "assistant",
          parts: [synthetic, toolPart, { type: "text", text: "done" }],
        },
      ]);

      expect(message.parts).toEqual([toolPart, { type: "text", text: "done" }]);
    });
  });
});
