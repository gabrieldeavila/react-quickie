import type { RequestMessage, RequestPart } from "./build-request-messages";

export const DEFAULT_MAX_TOOL_OUTPUT_CHARS = 4_000;

export type TruncatedToolOutput = {
  truncated: true;
  preview: string;
  originalSize: number;
};

function serialize(output: unknown): string {
  if (typeof output === "string") return output;
  try {
    return JSON.stringify(output) ?? "";
  } catch {
    return String(output);
  }
}

function truncatePart(part: RequestPart, maxChars: number): RequestPart {
  const isTool = part.type === "dynamic-tool" || part.type.startsWith("tool-");
  if (!isTool || part.state !== "output-available") return part;

  const text = serialize(part.output);
  if (text.length <= maxChars) return part;

  const output: TruncatedToolOutput = {
    truncated: true,
    preview: text.slice(0, maxChars),
    originalSize: text.length,
  };
  return { ...part, output };
}

/** Index of the last user message; everything from there on is the latest turn. */
function latestTurnStart(messages: RequestMessage[]): number {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === "user") return index;
  }
  return 0;
}

/**
 * Large tool outputs from older turns are replaced by a preview to keep the
 * request (and tokens) small. The latest turn, including an assistant message
 * still running tools after an approval, is sent in full. The full output
 * stays in IndexedDB for display.
 */
export function truncateToolOutputs(
  messages: RequestMessage[],
  maxChars: number = DEFAULT_MAX_TOOL_OUTPUT_CHARS,
): RequestMessage[] {
  const start = latestTurnStart(messages);

  return messages.map((message, index) =>
    index >= start
      ? message
      : {
          ...message,
          parts: message.parts.map((part) => truncatePart(part, maxChars)),
        },
  );
}
