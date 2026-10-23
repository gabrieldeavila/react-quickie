import { getApprovalsApiUrl } from "~types/consts/project.const";
import { authFetch } from "@/host/api/auth-fetch";
import type { ApprovalRuleScope } from "../domain/always-allow.types";
import { readApiError } from "./read-api-error";

type RuleBody = { scope: ApprovalRuleScope; tool: string; command?: string };

/** `POST /approvals/rules`: the rule applies from the next tool call on. */
export async function saveApprovalRule(
  root: string,
  rule: RuleBody,
): Promise<void> {
  const response = await authFetch(`${getApprovalsApiUrl()}/rules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ root, ...rule }),
  });
  if (!response.ok) throw new Error(await readApiError(response));
}
