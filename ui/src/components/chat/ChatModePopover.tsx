import { useEffect, useMemo, useRef, useState } from "react";
import { ChatModeEnum } from "../../enum/chat.enum";

type ChatModePopoverProps = {
  value: ChatModeEnum;
  onChange: (value: ChatModeEnum) => void;
};

type ModeOption = {
  value: ChatModeEnum;
  label: string;
  icon: string;
};

const MODE_OPTIONS: ModeOption[] = [
  { value: ChatModeEnum.LANDING_PAGES, label: "Landing Pages", icon: "◫" },
  { value: ChatModeEnum.FORMS, label: "Forms", icon: "▦" },
  { value: ChatModeEnum.BACKEND_DEVELOPER, label: "Backend Developer", icon: "◌" },
  { value: ChatModeEnum.FRONTEND_DEVELOPER, label: "Frontend Developer", icon: "◈" },
];

const MODE_ICON_BY_VALUE: Record<ChatModeEnum, string> = MODE_OPTIONS.reduce(
  (accumulator: Record<ChatModeEnum, string>, option: ModeOption) => {
    accumulator[option.value] = option.icon;
    return accumulator;
  },
  {} as Record<ChatModeEnum, string>,
);

export function ChatModePopover({ value, onChange }: ChatModePopoverProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentOption: ModeOption = useMemo(
    () => MODE_OPTIONS.find((option: ModeOption) => option.value === value) ?? MODE_OPTIONS[0],
    [value],
  );

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent): void => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="chat-mode-popover" ref={containerRef}>
      <button
        type="button"
        className="chat-mode-popover__trigger"
        onClick={() => setIsOpen((current: boolean) => !current)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Modo atual: ${currentOption.label}`}
        title={currentOption.label}
      >
        <span className="chat-mode-popover__icon" aria-hidden="true">
          {MODE_ICON_BY_VALUE[value] ?? currentOption.icon}
        </span>
      </button>

      {isOpen ? (
        <div className="chat-mode-popover__panel" role="listbox" aria-label="Selecionar modo do projeto">
          {MODE_OPTIONS.map((option: ModeOption) => {
            const isSelected: boolean = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                className={`chat-mode-popover__option ${isSelected ? "chat-mode-popover__option--selected" : ""}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={isSelected}
              >
                <span className="chat-mode-popover__option-icon" aria-hidden="true">
                  {option.icon}
                </span>
                <span className="chat-mode-popover__option-label">{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
