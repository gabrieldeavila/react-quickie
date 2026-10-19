import { memo } from "react";
import type { IconType } from "react-icons";
import { FiMoreHorizontal } from "react-icons/fi";
import { usePopoverPanel } from "@/components/primitives/usePopoverPanel";

export type HeaderMenuItem = {
  key: string;
  label: string;
  icon: IconType;
  onSelect: () => void;
};

type HeaderOverflowMenuProps = { items: HeaderMenuItem[] };

/** "⋯" button in the header holding the less frequent actions. */
export const HeaderOverflowMenu = memo(({ items }: HeaderOverflowMenuProps) => {
  const { isOpen, toggle, close, containerRef, panelRef } = usePopoverPanel();

  return (
    <div className="chat-mode-popover" ref={containerRef}>
      <button
        type="button"
        className="chat-mode-popover__trigger"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="More actions"
        title="More actions"
      >
        <FiMoreHorizontal
          className="chat-mode-popover__icon-svg"
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div
          ref={panelRef}
          className="chat-mode-popover__panel chat-mode-popover__panel--left chat-mode-popover__panel--down"
          role="menu"
          aria-label="More actions"
        >
          {items.map(({ key, label, icon: Icon, onSelect }) => (
            <button
              key={key}
              type="button"
              role="menuitem"
              className="chat-mode-popover__option"
              onClick={() => {
                close();
                onSelect();
              }}
            >
              <span
                className="chat-mode-popover__option-icon"
                aria-hidden="true"
              >
                <Icon className="chat-mode-popover__option-icon-svg" />
              </span>
              <span className="chat-mode-popover__option-label">{label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
});
