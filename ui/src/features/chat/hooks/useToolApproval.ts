import { useCallback } from "react";
import { useChatBaseContext } from "@/components/chat/context/context";
import { buildAlternativeReason } from "../domain/tool-approval";

/**
 * Answers a native tool approval. useChat resends automatically once every
 * pending approval in the last message has a response.
 */
export function useToolApproval(approvalId: string) {
  const { addToolApprovalResponse, status } = useChatBaseContext();
  const isBusy = status === "submitted" || status === "streaming";

  const approve = useCallback(() => {
    void addToolApprovalResponse({ id: approvalId, approved: true });
  }, [addToolApprovalResponse, approvalId]);

  const deny = useCallback(() => {
    void addToolApprovalResponse({
      id: approvalId,
      approved: false,
      reason: "User denied the tool call.",
    });
  }, [addToolApprovalResponse, approvalId]);

  const suggestAlternative = useCallback(
    (alternative: string) => {
      if (!alternative.trim()) return;
      void addToolApprovalResponse({
        id: approvalId,
        approved: false,
        reason: buildAlternativeReason(alternative),
      });
    },
    [addToolApprovalResponse, approvalId],
  );

  return { approve, deny, suggestAlternative, isBusy };
}
