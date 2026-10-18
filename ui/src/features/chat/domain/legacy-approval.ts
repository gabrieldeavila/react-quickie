// Conversations saved before native tool approval contain artifacts of the old
// flow. They stay in IndexedDB (and on screen) but are never sent to the API.

export const LEGACY_APPROVAL_CONTROL_PREFIX = "[bash-approval-control]";

type MessageLike = {
  role: string;
  parts?: ReadonlyArray<{ type: string; text?: string }>;
  content?: string;
};

function firstText(message: MessageLike): string {
  const textPart = message.parts?.find((part) => part.type === "text");
  return textPart?.text ?? message.content ?? "";
}

/** The fake user message the old approval card sent to continue the turn. */
export function isLegacyApprovalControlMessage(message: MessageLike): boolean {
  return (
    message.role === "user" &&
    firstText(message).trimStart().startsWith(LEGACY_APPROVAL_CONTROL_PREFIX)
  );
}

/** The tool part the old card spliced in by hand: it has `approvalId` but no `toolCallId`. */
export function isLegacySyntheticToolPart(part: unknown): boolean {
  if (!part || typeof part !== "object") return false;
  const candidate = part as Record<string, unknown>;

  return (
    typeof candidate.type === "string" &&
    candidate.type.startsWith("tool-") &&
    typeof candidate.approvalId === "string" &&
    typeof candidate.toolCallId !== "string"
  );
}

/** A real tool result from the old flow that said "waiting for approval". */
export function isLegacyApprovalRequestOutput(output: unknown): boolean {
  return (
    !!output &&
    typeof output === "object" &&
    (output as { approvalRequired?: unknown }).approvalRequired === true
  );
}
