import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { FiPause, FiSend, FiX } from "react-icons/fi";
import {
  useChatBaseContext,
  useChatServicesContext,
} from "../../context/context";
import useSendMessage from "../../hooks/events/useSendMessage";

export function ChatComposer() {
  const {
    input,
    hasInput,
    status,
    setInput,
    stop,
    pastedImages,
    addPastedImages,
    removePastedImage,
    attachmentError,
  } = useChatBaseContext();
  const { isChatPending } = useChatServicesContext();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const onSend = useSendMessage();

  const isPaused = isChatPending;
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
      void addPastedImages(files);
    },
    [addPastedImages],
  );

  return (
    <div className="chat-input-section">
      <div className="chat-composer">
        {pastedImages.length > 0 ? (
          <div className="chat-pasted-images" aria-label="Imagens para enviar">
            {pastedImages.map((image) => (
              <div className="chat-pasted-image" key={image.id}>
                <img src={image.url} alt={image.filename ?? "Imagem colada"} />
                <button
                  type="button"
                  className="chat-pasted-image__remove"
                  onClick={() => removePastedImage(image.id)}
                  aria-label={`Remover ${image.filename ?? "imagem"}`}
                  title="Remover imagem"
                >
                  <FiX aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {attachmentError ? (
          <p className="chat-attachment-error" role="alert">
            {attachmentError}
          </p>
        ) : null}
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder="Digite sua mensagem ou cole uma imagem..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            rows={1}
          />

          <button
            className={`send-button ${isPaused ? "send-button--pause" : ""}`}
            onClick={isPaused ? stop : onSend}
            disabled={isPaused ? false : isSendDisabled}
            title={isPaused ? "Pausar resposta" : "Enviar mensagem"}
            aria-label={isPaused ? "Pausar resposta" : "Enviar mensagem"}
            type="button"
          >
            {isPaused ? (
              <FiPause aria-hidden="true" />
            ) : (
              <FiSend aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
