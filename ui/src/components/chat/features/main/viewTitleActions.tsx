import { memo, useMemo } from "react";
import { useChatBaseContext, useChatServicesContext } from "../../context/context";
import { ConversationSwitcherPanel } from "@/features/conversations/components/ConversationSwitcherPanel";
import { useConversationSwitcher } from "@/features/conversations/hooks/useConversationSwitcher";
import { useHostCommands } from "@/host/hooks/useHostCommands";
import { useHostTitle } from "@/host/hooks/useHostTitle";
import { DEFAULT_CONVERSATION_TITLE } from "@/lib/conversation-title";
import { useOpenSettings } from "../../hooks/events/useOpenSettings";

/**
 * Stands in for the header in VSCode: new chat, history and settings are view
 * title-bar buttons. Only the history panel renders here, under the title bar.
 */
const ViewTitleActions = memo(() => {
  const { history } = useChatBaseContext();
  const { handleCreateConversation } = useChatServicesContext();
  const openSettings = useOpenSettings();
  const switcher = useConversationSwitcher({
    conversations: history.conversations,
    onSelect: history.setActiveConversationId,
  });

  useHostTitle(history.activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE);

  const handlers = useMemo(
    () => ({
      newChat: () => void handleCreateConversation(),
      showHistory: switcher.toggleOpen,
      openSettings,
    }),
    [handleCreateConversation, switcher.toggleOpen, openSettings],
  );
  useHostCommands(handlers);

  return (
    <div className="chat-view-history" ref={switcher.containerRef}>
      {switcher.isOpen ? (
        <ConversationSwitcherPanel
          switcher={switcher}
          activeConversationId={history.activeConversationId}
          isLoading={!history.isHydrated}
          onDelete={history.deleteConversation}
        />
      ) : null}
    </div>
  );
});

export default ViewTitleActions;
