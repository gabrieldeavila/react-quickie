type ChatComposerProps = {
  input: string;
  isDisabled: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

export function ChatComposer({ input, isDisabled, onInputChange, onSend, onKeyDown }: ChatComposerProps) {
  return (
    <div className="chat-input-section">
      <div className="input-wrapper">
        <textarea
          className="chat-input"
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
        />

        <button className="send-button" onClick={onSend} disabled={isDisabled} title="Enviar mensagem" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
