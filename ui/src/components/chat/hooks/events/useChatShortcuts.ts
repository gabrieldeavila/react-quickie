import { useEffect, useRef } from "react";
import {
  isMacPlatform,
  matchChatShortcut,
  type ChatShortcut,
} from "@/features/keyboard-shortcuts/domain/match-chat-shortcut";
import { getHostFeatures } from "@/host/domain/host-features";
import { getRuntimeConfig } from "@/host/runtime-config";
import { useChatBaseContext, useChatServicesContext } from "../../context/context";

const { hasEditorKeybindings } = getHostFeatures(getRuntimeConfig().host);
const isMac = isMacPlatform(navigator.userAgent);

/** Keys pressed inside a dialog (settings, new project) belong to it. */
function isInsideModal(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('[aria-modal="true"]') !== null;
}

/** Page-wide shortcuts: ⌘/Ctrl+N starts a new chat, Escape stops the response. */
export function useChatShortcuts(): void {
  const { stop } = useChatBaseContext();
  const { isChatPending, handleCreateConversation } = useChatServicesContext();
  const latest = useRef({ isChatPending, stop, handleCreateConversation });

  useEffect(() => {
    latest.current = { isChatPending, stop, handleCreateConversation };
  }, [isChatPending, stop, handleCreateConversation]);

  useEffect(() => {
    const actions: Record<ChatShortcut, () => void> = {
      newChat: () => void latest.current.handleCreateConversation(),
      stopResponse: () => latest.current.stop(),
    };

    // Window listener: runs after popovers' document listeners, which mark a handled Escape.
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isInsideModal(event.target)) return;
      const shortcut = matchChatShortcut(event, {
        isMac,
        isResponding: latest.current.isChatPending,
        editorOwnsNewChat: hasEditorKeybindings,
      });
      if (!shortcut) return;
      event.preventDefault();
      actions[shortcut]();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
