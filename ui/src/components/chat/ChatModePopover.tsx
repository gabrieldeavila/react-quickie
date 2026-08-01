import { useEffect, useMemo, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FiCode, FiLayout, FiPackage, FiTool } from "react-icons/fi";
import { ChatModeEnum } from "../../enum/chat.enum";

type ChatModePopoverProps = {
  value: ChatModeEnum;
  onChange: (value: ChatModeEnum) => void;
};

type ModeOption = {
  value: ChatModeEnum;
  label: string;
  icon: IconType;
};

const MODE_OPTIONS: ModeOption[] = [
  { value: ChatModeEnum.LANDING_PAGES, label: "Landing Pages", icon: FiLayout },
  { value: ChatModeEnum.FORMS, label: "Forms", icon: FiTool },
  {
    value: ChatModeEnum.BACKEND_DEVELOPER,
    label: "Backend Developer",
    icon: FiPackage,
  },
  {
    value: ChatModeEnum.FRONTEND_DEVELOPER,
    label: "Frontend Developer",
    icon: FiCode,
  },
];

export function ChatModePopover({ value, onChange }: ChatModePopoverProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentOption: ModeOption = useMemo(
    () =>
      MODE_OPTIONS.find((option: ModeOption) => option.value === value) ??
      MODE_OPTIONS[0],
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

  const CurrentIcon: IconType = currentOption.icon;

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
          <CurrentIcon className="chat-mode-popover__icon-svg" />
        </span>
      </button>

      {isOpen ? (
        <div
          className="chat-mode-popover__panel"
          role="listbox"
          aria-label="Selecionar modo do projeto"
        >
          {MODE_OPTIONS.map((option: ModeOption) => {
            const isSelected: boolean = option.value === value;
            const OptionIcon: IconType = option.icon;

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
                  <OptionIcon className="chat-mode-popover__option-icon-svg" />
                </span>
                <span className="chat-mode-popover__option-label">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
