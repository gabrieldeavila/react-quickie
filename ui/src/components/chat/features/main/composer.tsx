import { useCallback, useMemo } from "react";
import { useChatBaseContext } from "../../context/context";
import useSendMessage from "../../hooks/events/useSendMessage";

export function ChatComposer() {
  const { input, hasInput, status, setInput } = useChatBaseContext();

  const onSend = useSendMessage();

  const isDisabled = useMemo(
    () => !hasInput || status !== "ready",
    [hasInput, status],
  );

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
          className="chat-input"
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        <button
          className="send-button"
          onClick={onSend}
          disabled={isDisabled}
          title="Enviar mensagem"
          type="button"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
