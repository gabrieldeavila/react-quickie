import type { IconType } from "react-icons";

export type PopoverOption<T> = { value: T; label: string; icon: IconType };

export type PopoverPlacement = "down" | "up";

export type PopoverProps<T extends string | number> = {
  value: T;
  onChange: (value: T) => void;
  options: PopoverOption<T>[];
  ariaLabel: string;
  title: string;
  defaultIcon?: IconType;
  /** Shows the trigger as a labelled chip instead of an icon-only button. */
  triggerLabel?: string;
  /** "up" opens the panel above the trigger (e.g. inside the message box). */
  placement?: PopoverPlacement;
};
