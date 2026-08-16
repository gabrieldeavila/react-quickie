import type { IconType } from "react-icons";

export type PopoverOption<T> = { value: T; label: string; icon: IconType };

export type PopoverProps<T extends string | number> = {
  value: T;
  onChange: (value: T) => void;
  options: PopoverOption<T>[];
  ariaLabel: string;
  title: string;
  defaultIcon?: IconType;
};
