type ChatMode = "Landing Pages" | "Forms";

type ChatModeSelectorProps = {
  value: ChatMode;
  onChange: (value: ChatMode) => void;
};

const options: ChatMode[] = ["Landing Pages", "Forms"];

export function ChatModeSelector({ value, onChange }: ChatModeSelectorProps) {
  return (
    <label className="chat-control">
      <span className="chat-control__label">Modo</span>
      <select
        className="chat-select chat-select--modal"
        value={value}
        onChange={(event) => onChange(event.target.value as ChatMode)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
