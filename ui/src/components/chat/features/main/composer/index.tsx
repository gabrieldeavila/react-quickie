import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import {
  useChatBaseContext,
  useChatServicesContext,
} from "../../../context/context";
import useSendMessage from "../../../hooks/events/useSendMessage";
import { useSlashCommandActions } from "../../../hooks/events/useSlashCommandActions";
import { SlashCommandMenu } from "@/features/slash-commands/components/SlashCommandMenu";
import {
  SLASH_MENU_ID,
  slashOptionId,
} from "@/features/slash-commands/domain/slash-menu-ids";
import { useSlashCommands } from "@/features/slash-commands/hooks/useSlashCommands";
import { ModelNotices } from "@/features/models/components/ModelNotices";
import { AutoApproveBanner } from "@/features/approvals/components/AutoApproveBanner";
import { CHAT_INPUT_ID } from "./chat-input-id";
import { ComposerToolbar } from "./ComposerToolbar";
import { PastedImages } from "./PastedImages";
import { SendButton } from "./SendButton";

export function ChatComposer() {
  const {
    input,
    hasInput,
    status,
    setInput,
    stop,
    pastedImages,
    addPastedImages,
    attachmentError,
    rejectAttachments,
    conversationModel,
    autoApprove,
  } = useChatBaseContext();
  const imagesAllowed =
    conversationModel.resolved?.model.supportsImages ?? true;
  const { isChatPending } = useChatServicesContext();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const onSend = useSendMessage();
  const slashActions = useSlashCommandActions();
  const slash = useSlashCommands({
    input,
    commands: slashActions.commands,
    onRun: slashActions.run,
  });

  const isSendDisabled = useMemo(
    () => !hasInput || (status !== "ready" && status !== "error"),
    [hasInput, status],
  );

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, []);

  useLayoutEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      // The command menu takes arrows, Enter, Tab and Escape while it's open.
      if (slash.handleKeyDown(event)) return;
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        onSend();
      }
    },
    [onSend, slash],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const files = Array.from(event.clipboardData.items)
        .filter(
          (item) => item.kind === "file" && item.type.startsWith("image/"),
        )
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null);

      if (files.length === 0) return;
      event.preventDefault();
      if (!imagesAllowed) {
        rejectAttachments("The selected model doesn't accept images.");
        return;
      }
      void addPastedImages(files);
    },
    [addPastedImages, imagesAllowed, rejectAttachments],
  );

  return (
    <div className="chat-input-section">
      <div className="chat-composer">
        <PastedImages />
        {autoApprove.isOn ? (
          <AutoApproveBanner
            onTurnOff={() => void autoApprove.setAutoApprove(false)}
          />
        ) : null}
        <ModelNotices
          unavailableModel={conversationModel.unavailableModel}
          resolved={conversationModel.resolved}
          hasPastedImages={pastedImages.length > 0}
        />
        {attachmentError ? (
          <p className="chat-attachment-error" role="alert">
            {attachmentError}
          </p>
        ) : null}
        <div className="chat-composer__field">
          {slash.isOpen ? (
            <SlashCommandMenu
              matches={slash.matches}
              activeIndex={slash.activeIndex}
              onRun={slash.run}
            />
          ) : null}
          <textarea
            ref={textareaRef}
            id={CHAT_INPUT_ID}
            className="chat-input"
            aria-label="Message"
            aria-autocomplete="list"
            aria-expanded={slash.isOpen}
            aria-controls={slash.isOpen ? SLASH_MENU_ID : undefined}
            aria-activedescendant={
              slash.activeKey ? slashOptionId(slash.activeKey) : undefined
            }
            placeholder={
              imagesAllowed
                ? "Ask Doty… (/ for commands, paste images too)"
                : "Ask Doty… (/ for commands)"
            }
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            rows={1}
          />
          <ComposerToolbar>
            <SendButton
              isStoppable={isChatPending}
              isSendDisabled={isSendDisabled}
              onSend={onSend}
              onStop={stop}
            />
          </ComposerToolbar>
        </div>
      </div>
    </div>
  );
}
