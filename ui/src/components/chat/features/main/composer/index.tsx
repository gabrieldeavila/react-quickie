import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import {
  useChatBaseContext,
  useChatServicesContext,
} from "../../../context/context";
import useSendMessage from "../../../hooks/events/useSendMessage";
import { ModelNotices } from "@/features/models/components/ModelNotices";
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
  } = useChatBaseContext();
  const imagesAllowed =
    conversationModel.resolved?.model.supportsImages ?? true;
  const { isChatPending } = useChatServicesContext();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const onSend = useSendMessage();

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
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        onSend();
      }
    },
    [onSend],
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
          <textarea
            ref={textareaRef}
            id={CHAT_INPUT_ID}
            className="chat-input"
            aria-label="Message"
            placeholder={
              imagesAllowed ? "Ask Doty… (paste images too)" : "Ask Doty…"
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
