import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChatConversation } from "~types/interface/chat-db.interface";
import {
  readLastInstructions,
  writeLastInstructions,
} from "../api/last-instructions.storage";
import { saveConversationInstructions } from "../api/save-conversation-instructions";
import type { InstructionSummary } from "../domain/instruction.types";
import { pickConversationInstructions } from "../domain/pick-conversation-instructions";
import { resolveSelection } from "../domain/resolve-selection";
import { toggleInstruction } from "../domain/toggle-instruction";

type UseInstructionSelectionInput = {
  root: string;
  conversation: ChatConversation | undefined;
  available: InstructionSummary[];
  reloadConversations: () => Promise<void>;
};

/**
 * The instructions of the active conversation. A new conversation starts with
 * the last selection used in the project and then keeps its own.
 */
export function useInstructionSelection({
  root,
  conversation,
  available,
  reloadConversations,
}: UseInstructionSelectionInput) {
  const [lastUsed, setLastUsed] = useState<{ root: string; ids: string[] }>(
    () => ({ root, ids: readLastInstructions(root) }),
  );
  // Re-read when the project changes (render-time update, no effect needed).
  if (lastUsed.root !== root) {
    setLastUsed({ root, ids: readLastInstructions(root) });
  }

  const selectedIds = useMemo(
    () =>
      pickConversationInstructions({
        stored: conversation?.instructionIds,
        lastUsed: lastUsed.ids,
      }),
    [conversation?.instructionIds, lastUsed.ids],
  );

  const selected = useMemo(
    () => resolveSelection(available, selectedIds),
    [available, selectedIds],
  );

  const conversationId = conversation?.id;

  const persist = useCallback(
    async (id: string, ids: string[]) => {
      await saveConversationInstructions(id, ids);
      await reloadConversations();
    },
    [reloadConversations],
  );

  const setSelection = useCallback(
    (ids: string[]) => {
      setLastUsed({ root, ids });
      writeLastInstructions(root, ids);
      if (conversationId) void persist(conversationId, ids);
    },
    [conversationId, persist, root],
  );

  const toggle = useCallback(
    (id: string) => setSelection(toggleInstruction(selectedIds, id)),
    [selectedIds, setSelection],
  );

  // A conversation without a selection (new, or saved before instructions)
  // adopts the current one, so later changes elsewhere don't move it.
  const hasStoredSelection = conversation?.instructionIds !== undefined;
  useEffect(() => {
    if (!conversationId || hasStoredSelection) return;
    void persist(conversationId, selectedIds);
  }, [conversationId, hasStoredSelection, persist, selectedIds]);

  return useMemo(
    () => ({ selectedIds, selected, toggle, setSelection }),
    [selected, selectedIds, setSelection, toggle],
  );
}

export type InstructionSelection = ReturnType<typeof useInstructionSelection>;
