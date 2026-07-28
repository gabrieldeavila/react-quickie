import { ChatModeEnum } from "../../enum/chat.enum";

type ChatModeSelectorProps = {
  value: ChatModeEnum;
  onChange: (value: ChatModeEnum) => void;
};

const options: { label: string; value: ChatModeEnum }[] = [
  {
    label: "Landing Pages",
    value: ChatModeEnum.LANDING_PAGES,
  },
  {
    label: "Forms",
    value: ChatModeEnum.FORMS,
  },
  {
    label: "Backend Developer",
    value: ChatModeEnum.BACKEND_DEVELOPER,
  },
  {
    label: "Frontend Developer",
    value: ChatModeEnum.FRONTEND_DEVELOPER,
  },
];

export function ChatModeSelector({ value, onChange }: ChatModeSelectorProps) {
  return (
    <label className="chat-control">
      <span className="chat-control__label">Modo</span>
      <select
        className="chat-select chat-select--modal"
        value={value}
        onChange={(event) => onChange(parseInt(event.target.value))}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
