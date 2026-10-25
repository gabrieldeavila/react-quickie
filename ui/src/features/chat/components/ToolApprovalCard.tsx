import { useState } from "react";
import { useChatBaseContext } from "@/components/chat/context/context";
import { AlwaysAllowMenu } from "@/features/approvals/components/AlwaysAllowMenu";
import { useAlwaysAllow } from "@/features/approvals/hooks/useAlwaysAllow";
import {
  describeApprovalInput,
  describeApprovalTitle,
  type PendingApproval,
} from "../domain/tool-approval";
import { useToolApproval } from "../hooks/useToolApproval";
import { getMcpToolLabel } from "../domain/mcp-tool-label";

type Props = {
  approval: PendingApproval;
  /** False on older messages: the request was closed when the user moved on. */
  isAnswerable: boolean;
};

const BASH_TOOL = "run_bash_command";

export function ToolApprovalCard({ approval, isAnswerable }: Props) {
  const { approve, deny, suggestAlternative, isBusy } = useToolApproval(
    approval.approvalId,
  );
  const { projectContext } = useChatBaseContext();
  const alwaysAllow = useAlwaysAllow({
    root: projectContext.reference,
    toolName: approval.toolName,
    input: approval.input,
    approve,
  });
  const [alternative, setAlternative] = useState("");
  const isBash = approval.toolName === BASH_TOOL;
  const disabled = !isAnswerable || isBusy || alwaysAllow.isSaving;

  return (
    <div className="bash-approval-card" role="alert">
      <strong>
        {describeApprovalTitle(
          approval,
          getMcpToolLabel(approval.toolName) ?? approval.toolName,
        )}
      </strong>
      <pre>{describeApprovalInput(approval)}</pre>
      {!isAnswerable ? (
        <small>Request not answered.</small>
      ) : (
        <>
          <div className="bash-approval-actions">
            <button
              className="bash-approval-button bash-approval-button--approve"
              type="button"
              disabled={disabled}
              onClick={approve}
            >
              {alwaysAllow.options.length > 0 ? "Allow once" : "Allow"}
            </button>
            {alwaysAllow.options.length > 0 ? (
              <AlwaysAllowMenu
                options={alwaysAllow.options}
                disabled={disabled}
                onChoose={(option) => void alwaysAllow.choose(option)}
              />
            ) : null}
            <button
              className="bash-approval-button bash-approval-button--reject"
              type="button"
              disabled={disabled}
              onClick={deny}
            >
              Deny
            </button>
          </div>
          {alwaysAllow.error ? (
            <small className="bash-approval-error" role="status">
              Couldn't save the rule: {alwaysAllow.error}
            </small>
          ) : null}
          {isBash ? (
            <div className="bash-approval-revise">
              <input
                value={alternative}
                onChange={(event) => setAlternative(event.target.value)}
                placeholder="Or enter a different command"
                aria-label="Different Bash command"
              />
              <button
                className="bash-approval-button bash-approval-button--revise"
                type="button"
                disabled={disabled || !alternative.trim()}
                onClick={() => suggestAlternative(alternative)}
              >
                Send alternative
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
