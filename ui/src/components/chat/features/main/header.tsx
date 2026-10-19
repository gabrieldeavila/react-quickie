import { memo, useMemo } from "react";
import {
  useChatBaseContext,
  useChatServicesContext,
} from "../../context/context";
import Button from "@/components/primitives/button";
import { FiPlus } from "react-icons/fi";
import { HeaderOverflowMenu } from "@/features/header-menu/components/HeaderOverflowMenu";
import { DEFAULT_CONVERSATION_TITLE } from "@/lib/conversation-title";
import { useHeaderMenuItems } from "../../hooks/events/useHeaderMenuItems";
import { ConversationSwitcher } from "@/features/conversations/components/ConversationSwitcher";

/** Slim header: conversation switcher, new chat and the "⋯" menu. Pickers live in the message box. */
const ChatHeader = memo(() => {
  const { history, status } = useChatBaseContext();
  const { chatStatusLabel, handleCreateConversation } =
    useChatServicesContext();
  const menuItems = useHeaderMenuItems();

  const activeConversationTitle: string = useMemo(
    () => history.activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE,
    [history.activeConversation],
  );

  return (
    <header className="chat-header">
      <div className="chat-header__top">
        <div className="chat-header__title-wrap">
          <ConversationSwitcher
            title={activeConversationTitle}
            conversations={history.conversations}
            activeConversationId={history.activeConversationId}
            isLoading={!history.isHydrated}
            onSelect={history.setActiveConversationId}
            onDelete={history.deleteConversation}
          />
        </div>

        <div className="chat-header__actions">
          {status === "error" ? (
            <span className="chat-status-pill">{chatStatusLabel}</span>
          ) : null}
          <Button
            icon={FiPlus}
            onClick={handleCreateConversation}
            title="New conversation"
          />
          <HeaderOverflowMenu items={menuItems} />
        </div>
      </div>
    </header>
  );
});

export default ChatHeader;
