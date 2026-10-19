import type { IconType } from "react-icons";
import { FiChevronDown } from "react-icons/fi";

type PopoverTriggerProps = {
  icon: IconType;
  /** When set, the trigger is a compact chip (icon + label + chevron). */
  label?: string;
  isOpen: boolean;
  onClick: () => void;
  ariaLabel: string;
  title: string;
  hasPopup: "listbox" | "menu";
};

export function PopoverTrigger({
  icon: Icon,
  label,
  isOpen,
  onClick,
  ariaLabel,
  title,
  hasPopup,
}: PopoverTriggerProps) {
  return (
    <button
      type="button"
      className={`chat-mode-popover__trigger ${label ? "chat-mode-popover__trigger--chip" : ""}`}
      onClick={onClick}
      aria-haspopup={hasPopup}
      aria-expanded={isOpen}
      aria-label={ariaLabel}
      title={title}
    >
      <span className="chat-mode-popover__icon" aria-hidden="true">
        <Icon className="chat-mode-popover__icon-svg" />
      </span>
      {label ? (
        <>
          <span className="chat-mode-popover__trigger-label">{label}</span>
          <FiChevronDown
            className="chat-mode-popover__chevron"
            aria-hidden="true"
          />
        </>
      ) : null}
    </button>
  );
}
