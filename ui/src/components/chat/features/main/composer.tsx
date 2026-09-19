import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { FiPause, FiSend } from "react-icons/fi";
import {
  useChatBaseContext,
  useChatServicesContext,
} from "../../context/context";
import useSendMessage from "../../hooks/events/useSendMessage";

export function ChatComposer() {
  const { input, hasInput, status, setInput, stop } = useChatBaseContext();
  const { isChatPending } = useChatServicesContext();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const onSend = useSendMessage();

  const isPaused = isChatPending;
  const isSendDisabled = useMemo(
    () => !hasInput || status !== "ready",
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

  return (
    <div className="chat-input-section">
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
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
  );
}
