import { FiChevronDown } from "react-icons/fi";
import { usePopoverPanel } from "@/components/primitives/usePopoverPanel";
import type { AlwaysAllowOption } from "../domain/always-allow.types";

type Props = {
  options: AlwaysAllowOption[];
  disabled: boolean;
  onChoose: (option: AlwaysAllowOption) => void;
};

/** "Always allow ▾" on the approval card; each choice saves and approves. */
export function AlwaysAllowMenu({ options, disabled, onChoose }: Props) {
  const { isOpen, toggle, closeAndRestoreFocus, containerRef, panelRef } =
    usePopoverPanel();

  return (
    <div className="chat-mode-popover" ref={containerRef}>
      <button
        type="button"
        className="bash-approval-button bash-approval-button--always"
        disabled={disabled}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        Always allow <FiChevronDown aria-hidden="true" />
      </button>
      {isOpen ? (
        <div
          ref={panelRef}
          className="chat-mode-popover__panel chat-mode-popover__panel--left"
          role="menu"
          aria-label="Always allow"
        >
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              role="menuitem"
              className="chat-mode-popover__option"
              onClick={() => {
                closeAndRestoreFocus();
                onChoose(option);
              }}
            >
              <span className="chat-mode-popover__option-label">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
