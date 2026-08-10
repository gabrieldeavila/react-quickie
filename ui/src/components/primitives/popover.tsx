import type {
  PopoverOption,
  PopoverProps,
} from "@/types/interface/primitive-popover.interface";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FiMinusCircle } from "react-icons/fi";

export function Popover<T extends string | number>({
  value,
  onChange,
  options,
  ariaLabel,
  title,
  defaultIcon: DefaultIcon,
}: PopoverProps<T>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openDirection, setOpenDirection] = useState<"left" | "right">("right");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const currentOption: PopoverOption<T> | undefined = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const TriggerIcon: IconType =
    currentOption?.icon ?? DefaultIcon ?? FiMinusCircle;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent): void => {
      if (!containerRef.current?.contains(event.target as Node))
        setIsOpen(false);
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

  useLayoutEffect(() => {
    if (!isOpen) return;
    const updateDirection = (): void => {
      const container = containerRef.current;
      const panel = panelRef.current;
      if (!container || !panel) return;
      const containerRect = container.getBoundingClientRect();
      const panelWidth = panel.offsetWidth || 220;
      const spaceRight = window.innerWidth - containerRect.left;
      const spaceLeft = containerRect.right;
      setOpenDirection(
        spaceRight < panelWidth + 16 && spaceLeft >= panelWidth
          ? "left"
          : "right",
      );
    };
    updateDirection();
    window.addEventListener("resize", updateDirection);
    window.addEventListener("scroll", updateDirection, true);
    return () => {
      window.removeEventListener("resize", updateDirection);
      window.removeEventListener("scroll", updateDirection, true);
    };
  }, [isOpen]);

  return (
    <div className="chat-mode-popover" ref={containerRef}>
      <button
        type="button"
        className="chat-mode-popover__trigger"
        onClick={() => setIsOpen((current: boolean) => !current)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        title={title}
      >
        <span className="chat-mode-popover__icon" aria-hidden="true">
          <TriggerIcon className="chat-mode-popover__icon-svg" />
        </span>
      </button>

      {isOpen ? (
        <div
          ref={panelRef}
          className={`chat-mode-popover__panel chat-mode-popover__panel--${openDirection}`}
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
                  setIsOpen(false);
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
