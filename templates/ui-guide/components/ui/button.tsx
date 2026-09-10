import {
  memo,
  type ButtonHTMLAttributes,
  type ReactNode,
  useMemo,
} from "react";

import { cn } from "@/app/helpers/cn";

export type ButtonVariant =
  "primary" | "secondary" | "ghost" | "transparent" | "destructive";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)] hover:bg-[var(--color-primary-hover)]",
  secondary:
    "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)]",
  ghost: "bg-transparent text-[var(--color-text)] hover:bg-white/5",
  transparent:
    "bg-transparent text-[var(--color-text)] hover:bg-white/5 border border-[var(--color-border)]",
  destructive:
    "bg-[var(--color-danger)] text-white shadow-[var(--shadow-sm)] hover:opacity-90",
};

export const Button = memo(
  ({
    variant = "primary",
    isLoading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    className,
    children,
    type = "button",
    ...props
  }: ButtonProps) => {
    const isDisabled = useMemo(
      () => disabled || isLoading,
      [disabled, isLoading],
    );

    return (
      <button
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2",
          "rounded-[5px] px-4 py-2.5",
          "text-sm font-medium",
          "transition-[background-color,border-color,opacity,transform]",
          "duration-[var(--transition-base)] ease-[var(--transition-base)]",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-[var(--color-primary)]",
          "focus-visible:ring-offset-2",
          "focus-visible:ring-offset-[var(--color-bg)]",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "active:translate-y-px",
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
        ) : (
          leftIcon && (
            <span aria-hidden="true" className="inline-flex">
              {leftIcon}
            </span>
          )
        )}

        <span>{children}</span>

        {!isLoading && rightIcon && (
          <span aria-hidden="true" className="inline-flex">
            {rightIcon}
          </span>
        )}
      </button>
    );
  },
);
