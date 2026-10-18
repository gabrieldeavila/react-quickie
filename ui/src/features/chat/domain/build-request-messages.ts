import { compactSubagentOutput } from "./compact-subagent-output";
import {
  isLegacyApprovalControlMessage,
  isLegacySyntheticToolPart,
} from "./legacy-approval";
import { migrateLegacySubagentPart } from "./legacy-subagent";

export type RequestPart = { type: string; [key: string]: unknown };

export type RequestMessage = {
  id: string;
  role: string;
  parts: RequestPart[];
  /** Usage of earlier turns: the API sizes the context from it. */
  metadata?: unknown;
};

export type SourceMessage = {
  id?: string;
  role: string;
  content?: string;
  parts?: RequestPart[];
  metadata?: unknown;
};

function isImageFile(part: RequestPart): boolean {
  return (
    part.type === "file" &&
    typeof part.mediaType === "string" &&
    part.mediaType.startsWith("image/")
  );
}

/**
 * What the model needs to see from earlier turns: text, images, tool calls
 * with their results, and reasoning (Anthropic needs it next to tool calls).
 * `step-start` and `data-*` parts are UI-only.
 */
export function isRequestPart(part: RequestPart): boolean {
  if (isLegacySyntheticToolPart(part)) return false;

  return (
    part.type === "text" ||
    part.type === "reasoning" ||
    part.type === "dynamic-tool" ||
    part.type.startsWith("tool-") ||
    isImageFile(part)
  );
}

function toRequestPart(part: RequestPart): RequestPart {
  return compactSubagentOutput(migrateLegacySubagentPart(part));
}

function sourceParts(message: SourceMessage): RequestPart[] {
  if (message.parts?.length) return message.parts;
  return message.content ? [{ type: "text", text: message.content }] : [];
}

/** UI messages → the `messages` body sent to `POST /chat`. */
export function buildRequestMessages(
  messages: SourceMessage[],
): RequestMessage[] {
  return messages.flatMap((message, index) => {
    if (isLegacyApprovalControlMessage(message)) return [];

    const parts = sourceParts(message).filter(isRequestPart).map(toRequestPart);
    // useChat can keep empty assistant placeholders after interrupted/failed
    // turns. They are UI state, not conversation content.
    if (parts.length === 0) return [];

    const request: RequestMessage = {
      id: message.id ?? `request-${index}`,
      role: message.role,
      parts,
    };
    if (message.metadata !== undefined) request.metadata = message.metadata;
    return [request];
  });
}
