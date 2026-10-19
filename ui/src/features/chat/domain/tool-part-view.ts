import type { ToolStatus } from "~types/interface/chat.interface";
import { isLegacyApprovalRequestOutput } from "./legacy-approval";
import { getDeniedReason, isDeniedToolPart } from "./tool-approval";

type ToolOutput = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: unknown;
};

export type ToolPartView = {
  type: string;
  state?: string;
  output?: unknown;
  errorText?: string;
  approval?: { id?: unknown; reason?: unknown; approved?: unknown };
};

export const LEGACY_APPROVAL_TEXT =
  "Approval request from an earlier version. It can no longer be answered.";

function stringifyResult(output: unknown): string {
  if (output == null) return "";
  if (typeof output === "string") return output;

  const result = output as ToolOutput;
  if (result.success === false) {
    return result.error || result.message || "The tool failed.";
  }
  if (result.success === true) {
    const message = result.message || "The tool ran successfully.";
    if (result.data === undefined) return message;
    const data =
      typeof result.data === "string"
        ? result.data
        : JSON.stringify(result.data, null, 2);
    return `${message}\n\n${data}`;
  }

  try {
    return JSON.stringify(output, null, 2);
  } catch {
    return "Tool output unavailable.";
  }
}

export function getToolStatus(part: ToolPartView): ToolStatus {
  const output = part.output as ToolOutput | undefined;

  if (
    part.state === "output-error" ||
    isDeniedToolPart(part) ||
    output?.success === false
  ) {
    return "error";
  }
  if (part.state === "output-available") return "success";
  return "loading";
}

/** The text shown when a finished tool card is expanded. */
export function formatToolOutput(part: ToolPartView): string {
  if (isDeniedToolPart(part)) {
    const reason = getDeniedReason(part);
    return reason ? `Denied: ${reason}` : "Denied by the user.";
  }
  if (part.state === "output-error") return part.errorText ?? "";
  if (isLegacyApprovalRequestOutput(part.output)) return LEGACY_APPROVAL_TEXT;
  return stringifyResult(part.output);
}
