import type {
  PopoverOption,
  PopoverProps,
} from "../../../types/interface/primitive-popover.interface";
import { useMemo } from "react";
import type { IconType } from "react-icons";
import { FiMinusCircle } from "react-icons/fi";
import { PopoverTrigger } from "./popover-trigger";
import { usePopoverPanel } from "./usePopoverPanel";

export function Popover<T extends string | number>({
  value,
  onChange,
  options,
  ariaLabel,
  title,
  defaultIcon: DefaultIcon,
  triggerLabel,
  placement = "down",
}: PopoverProps<T>) {
  const { isOpen, toggle, close, openDirection, containerRef, panelRef } =
    usePopoverPanel();

  const currentOption: PopoverOption<T> | undefined = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const TriggerIcon: IconType =
    currentOption?.icon ?? DefaultIcon ?? FiMinusCircle;

  return (
    <div className="chat-mode-popover" ref={containerRef}>
      <PopoverTrigger
        icon={TriggerIcon}
        label={triggerLabel}
        isOpen={isOpen}
        onClick={toggle}
        ariaLabel={ariaLabel}
        title={triggerLabel ? `${title}: ${triggerLabel}` : title}
        hasPopup="listbox"
      />

      {isOpen ? (
        <div
          ref={panelRef}
          className={`chat-mode-popover__panel chat-mode-popover__panel--${openDirection} chat-mode-popover__panel--${placement}`}
          role="listbox"
          aria-label={ariaLabel}
        >
          <div className="chat-mode-popover__title">{title}</div>
          {options.map((option) => {
            const isSelected: boolean = option.value === value;
            const OptionIcon: IconType = option.icon;
            return (
              <button
                key={String(option.value)}
                type="button"
                className={`chat-mode-popover__option ${isSelected ? "chat-mode-popover__option--selected" : ""}`}
                onClick={() => {
                  onChange(option.value);
                  close();
                }}
                role="option"
                aria-selected={isSelected}
              >
                <span
                  className="chat-mode-popover__option-icon"
                  aria-hidden="true"
                >
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
