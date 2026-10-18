import { memo, useCallback, useMemo } from "react";
import {
  useChatBaseContext,
  useChatServicesContext,
} from "../../context/context";
import ChatModePopover from "./modePopover";
import ChatSpecialtyPopover from "./specialtyPopover";
import { ModelPicker } from "@/features/models/components/ModelPicker";
import { UsageHeaderBadges } from "@/features/usage/components/UsageHeaderBadges";
import Button from "@/components/primitives/button";
import { FiFolderPlus, FiMessageCircle, FiSettings } from "react-icons/fi";
import { getHostFeatures } from "@/host/domain/host-features";
import { getRuntimeConfig } from "@/host/runtime-config";
import { DEFAULT_CONVERSATION_TITLE } from "@/lib/conversation-title";

const { canCreateProjects } = getHostFeatures(getRuntimeConfig().host);

const ChatHeader = memo(() => {
  const {
    history,
    setIsCreateModalOpen,
    setDraftContext,
    projectContext,
    setIsRootModalOpen,
    conversationModel,
  } = useChatBaseContext();
  const {
    renderedMessages,
    chatStatusLabel,
    isFrontendMode,
    isBackendMode,
    isAgnosticMode,
    handleCreateConversation,
  } = useChatServicesContext();

  const activeConversationTitle: string = useMemo(
    () => history.activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE,
    [history.activeConversation],
  );

  const handleOpenRootModal = useCallback((): void => {
    setDraftContext(projectContext);
    setIsRootModalOpen(true);
  }, [projectContext, setDraftContext, setIsRootModalOpen]);

  return (
    <header className="chat-header">
      <div className="chat-header__top">
        <div>
          <div className="chat-header__eyebrow">AI Assistant</div>
          <h1 className="chat-title">{activeConversationTitle}</h1>
        </div>

        <div className="chat-header__actions flex items-center gap-3">
          <span className="chat-status-pill">{chatStatusLabel}</span>{" "}
          <UsageHeaderBadges
            messages={renderedMessages}
            contextWindow={conversationModel.resolved?.model.contextWindow}
          />
          <ModelPicker
            modelRef={conversationModel.modelRef}
            options={conversationModel.options}
            selectModel={conversationModel.selectModel}
          />
          <ChatModePopover />
          <ChatSpecialtyPopover />
          {canCreateProjects &&
          (isFrontendMode || isBackendMode || isAgnosticMode) ? (
            <Button
              title={
                isBackendMode
                  ? "New backend"
                  : isAgnosticMode
                    ? "New full-stack server"
                    : "New frontend"
              }
              icon={FiFolderPlus}
              onClick={() => setIsCreateModalOpen(true)}
            />
          ) : null}
          <Button
            icon={FiMessageCircle}
            highlight
            onClick={handleCreateConversation}
            title="New conversation"
          />
          <Button
            icon={FiSettings}
            highlight
            onClick={handleOpenRootModal}
            aria-label="Open project settings"
            title="Settings"
          />
        </div>
      </div>
    </header>
  );
});

export default ChatHeader;
