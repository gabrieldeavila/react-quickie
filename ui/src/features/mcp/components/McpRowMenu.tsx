import { FiMoreHorizontal } from "react-icons/fi";
import { usePopoverPanel } from "@/components/primitives/usePopoverPanel";
import { useRowMenuPlacement } from "../hooks/useRowMenuPlacement";

export type McpRowAction = {
  key: string;
  label: string;
  onSelect: () => void;
  disabled?: boolean;
};

type Props = { serverName: string; actions: McpRowAction[] };

/** The row's "⋯" menu. */
export function McpRowMenu({ serverName, actions }: Props) {
  const { isOpen, toggle, closeAndRestoreFocus, containerRef, panelRef } =
    usePopoverPanel();
  const placement = useRowMenuPlacement(isOpen, containerRef, panelRef);

  return (
    <div className="chat-mode-popover" ref={containerRef}>
      <button
        type="button"
        className="chat-button chat-button--ghost mcp-row-menu__trigger"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Actions for ${serverName}`}
      >
        <FiMoreHorizontal aria-hidden="true" />
      </button>
      {isOpen ? (
        <div
          ref={panelRef}
          className="chat-mode-popover__panel mcp-row-menu__panel"
          style={placement ?? { visibility: "hidden" }}
          role="menu"
          aria-label={`Actions for ${serverName}`}
        >
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              role="menuitem"
              className="chat-mode-popover__option"
              disabled={action.disabled}
              onClick={() => {
                closeAndRestoreFocus();
                action.onSelect();
              }}
            >
              <span className="chat-mode-popover__option-label">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
