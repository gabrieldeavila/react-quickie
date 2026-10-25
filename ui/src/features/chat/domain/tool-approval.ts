export type PendingApproval = {
  approvalId: string;
  toolName: string;
  input: unknown;
};

type ToolPartLike = {
  type: string;
  state?: unknown;
  toolName?: unknown;
  input?: unknown;
  approval?: { id?: unknown; reason?: unknown; approved?: unknown };
};

export function getToolName(part: { type: string; toolName?: unknown }) {
  if (part.type === "dynamic-tool") {
    return typeof part.toolName === "string" ? part.toolName : "tool";
  }
  return part.type.replace(/^tool-/, "");
}

/** A tool call waiting for the user's decision, or null. */
export function getPendingApproval(part: ToolPartLike): PendingApproval | null {
  if (part.state !== "approval-requested") return null;
  const approvalId = part.approval?.id;
  if (typeof approvalId !== "string") return null;

  return { approvalId, toolName: getToolName(part), input: part.input };
}

/**
 * A denied call. Besides `output-denied`, the SDK leaves policy denials
 * (`isAutomatic`) and user denials of the current turn as
 * `approval-responded` with `approved: false`.
 */
export function isDeniedToolPart(part: ToolPartLike): boolean {
  return (
    part.state === "output-denied" ||
    (part.state === "approval-responded" && part.approval?.approved === false)
  );
}

/** The reason shown on a denied call (user denial or policy block). */
export function getDeniedReason(part: ToolPartLike): string | undefined {
  if (!isDeniedToolPart(part)) return undefined;
  const reason = part.approval?.reason;
  return typeof reason === "string" && reason.trim() ? reason : undefined;
}

/** Why auto mode's intent check ran a call: only those approvals carry a reason. */
export function getAutoApprovedReason(part: ToolPartLike): string | undefined {
  if (part.approval?.approved !== true) return undefined;
  const reason = part.approval.reason;
  return typeof reason === "string" && reason.trim() ? reason : undefined;
}

const BASH_TOOL = "run_bash_command";
const SUBAGENT_TOOL = "run_subagent";

type KnownInput = { command?: unknown; agent?: unknown; task?: unknown };

/** Bash shows the command, a subagent its task; any other tool its raw input. */
export function describeApprovalInput(approval: PendingApproval): string {
  const input = approval.input as KnownInput | undefined;
  if (typeof input?.command === "string") return input.command;
  if (approval.toolName === SUBAGENT_TOOL && typeof input?.task === "string") {
    return input.task;
  }
  return JSON.stringify(approval.input ?? {}, null, 2);
}

/** The card heading; `toolLabel` names tools without a special case (e.g. MCP). */
export function describeApprovalTitle(
  approval: PendingApproval,
  toolLabel: string,
): string {
  if (approval.toolName === BASH_TOOL) {
    return "The agent needs permission to run:";
  }
  const agent = (approval.input as KnownInput | undefined)?.agent;
  if (approval.toolName === SUBAGENT_TOOL && typeof agent === "string") {
    return `The ${agent} sub-agent wants to make changes:`;
  }
  return `The agent needs permission to use ${toolLabel}:`;
}

/** Denial reason that tells the model what the user wants instead. */
export function buildAlternativeReason(alternative: string): string {
  return `User suggests running instead: ${alternative.trim()}`;
}
