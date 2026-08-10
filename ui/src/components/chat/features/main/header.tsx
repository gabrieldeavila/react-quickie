import { memo, useCallback, useMemo } from "react";
import {
  useChatBaseContext,
  useChatServicesContext,
} from "../../context/context";
import ChatModePopover from "./modePopover";
import ChatSpecialtyPopover from "./specialtyPopover";
import Button from "@/components/primitives/button";
import { FiFolderPlus, FiMessageCircle, FiSettings } from "react-icons/fi";

const ChatHeader = memo(() => {
  const {
    history,
    setIsCreateModalOpen,
    setDraftContext,
    projectContext,
    setIsRootModalOpen,
  } = useChatBaseContext();
  const { chatStatusLabel, isFrontendMode, handleCreateConversation } =
    useChatServicesContext();

  const activeConversationTitle: string = useMemo(
    () => history.activeConversation?.title ?? "Nova conversa",
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
          <ChatModePopover />
          <ChatSpecialtyPopover />
          {isFrontendMode ? (
            <Button
              title="Novo projeto"
              icon={FiFolderPlus}
              onClick={() => setIsCreateModalOpen(true)}
            />
          ) : null}
          <Button
            icon={FiMessageCircle}
            highlight
            onClick={handleCreateConversation}
            title="Nova conversa"
          />
          <Button
            icon={FiSettings}
            highlight
            onClick={handleOpenRootModal}
            aria-label="Abrir configurações do projeto"
            title="Configurações"
          />
        </div>
      </div>
    </header>
  );
});

export default ChatHeader;
