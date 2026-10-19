import { useCallback, useMemo, useState } from "react";
import { usePopoverPanel } from "@/components/primitives/usePopoverPanel";
import type { ChatConversation } from "~types/interface/chat-db.interface";
import { filterConversations } from "../domain/filter-conversations";
import { useSwitcherKeyboard } from "./useSwitcherKeyboard";

type UseConversationSwitcherParams = {
  conversations: ChatConversation[];
  onSelect: (conversationId: string) => void;
  /** Where focus goes when the panel closes from the keyboard; defaults to the trigger. */
  getReturnFocusTarget?: () => HTMLElement | null;
};

export type ConversationSwitcherState = ReturnType<
  typeof useConversationSwitcher
>;

/** Open/close state and search query of the conversation dropdown. */
export function useConversationSwitcher({
  conversations,
  onSelect,
  getReturnFocusTarget,
}: UseConversationSwitcherParams) {
  const { isOpen, toggle, closeAndRestoreFocus, containerRef, panelRef } =
    usePopoverPanel({ getReturnFocusTarget });
  const handlePanelKeyDown = useSwitcherKeyboard(panelRef);
  const [query, setQuery] = useState<string>("");

  const visibleConversations = useMemo(
    () => filterConversations(conversations, query),
    [conversations, query],
  );

  // Every opening starts with an empty search, however the panel was closed.
  const toggleOpen = useCallback(() => {
    if (!isOpen) setQuery("");
    toggle();
  }, [isOpen, toggle]);

  const select = useCallback(
    (conversationId: string) => {
      onSelect(conversationId);
      closeAndRestoreFocus();
    },
    [onSelect, closeAndRestoreFocus],
  );

  const selectFirstMatch = useCallback(() => {
    const [first] = visibleConversations;
    if (first) select(first.id);
  }, [visibleConversations, select]);

  return {
    isOpen,
    toggleOpen,
    containerRef,
    panelRef,
    handlePanelKeyDown,
    query,
    setQuery,
    visibleConversations,
    select,
    selectFirstMatch,
  };
}
