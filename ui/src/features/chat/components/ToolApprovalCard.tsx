import { useState } from "react";
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
  const [alternative, setAlternative] = useState("");
  const isBash = approval.toolName === BASH_TOOL;
  const disabled = !isAnswerable || isBusy;

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
              Allow
            </button>
            <button
              className="bash-approval-button bash-approval-button--reject"
              type="button"
              disabled={disabled}
              onClick={deny}
            >
              Deny
            </button>
          </div>
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
