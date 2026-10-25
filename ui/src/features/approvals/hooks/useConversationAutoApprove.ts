import { useCallback, useMemo, useState } from "react";
import { saveConversationAutoApprove } from "../api/save-conversation-auto-approve";
import { pickAutoApprove } from "../domain/pick-auto-approve";

type UseConversationAutoApproveInput = {
  conversationId: string | null;
  /** The active conversation's stored value. */
  stored: boolean | undefined;
  reloadConversations: () => Promise<void>;
};

/**
 * Auto mode of the active conversation. Before the first message there is
 * no conversation yet, so the toggle is kept as a draft that the new
 * conversation is created with (`draft`); any switch resets it.
 */
export function useConversationAutoApprove({
  conversationId,
  stored,
  reloadConversations,
}: UseConversationAutoApproveInput) {
  const [draft, setDraft] = useState({ conversationId, isOn: false });
  // Render-time reset when the conversation changes (no effect needed).
  if (draft.conversationId !== conversationId) {
    setDraft({ conversationId, isOn: false });
  }

  const isOn = pickAutoApprove({ conversationId, stored, draft: draft.isOn });

  const setAutoApprove = useCallback(
    async (next: boolean) => {
      if (!conversationId) {
        setDraft({ conversationId, isOn: next });
        return;
      }
      await saveConversationAutoApprove(conversationId, next);
      await reloadConversations();
    },
    [conversationId, reloadConversations],
  );

  const toggle = useCallback(
    () => void setAutoApprove(!isOn),
    [isOn, setAutoApprove],
  );

  return useMemo(
    () => ({ isOn, draft: draft.isOn, toggle, setAutoApprove }),
    [draft.isOn, isOn, setAutoApprove, toggle],
  );
}

export type ConversationAutoApprove = ReturnType<
  typeof useConversationAutoApprove
>;
