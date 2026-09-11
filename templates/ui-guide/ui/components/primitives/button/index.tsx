import {
  memo,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";

import { cn } from "@/ui/helpers/cn";

export type ButtonVariant =
  "primary" | "secondary" | "ghost" | "transparent" | "destructive";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: cn(
    "[--button-tracking-color:rgba(255,255,255,0.18)]",
    "relative overflow-hidden border border-white/12",
    "bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))]",
    "text-white shadow-[0_8px_18px_rgba(0,0,0,0.14),0_0_0_1px_rgba(255,255,255,0.05)]",
    "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_var(--button-radial-x,_50%)_var(--button-radial-y,_50%),rgba(255,255,255,0.16),transparent_62%)]",
    "before:opacity-[var(--button-radial-opacity,_0)] before:transition-[opacity,background-position] before:duration-[var(--transition-base)]",
    "before:translate-x-0 before:translate-y-0 hover:border-white/16 hover:shadow-[0_10px_20px_rgba(0,0,0,0.16),0_0_0_1px_rgba(255,255,255,0.07)]",
  ),
  secondary: cn(
    "border border-[var(--color-border-strong)]",
    "bg-[linear-gradient(180deg,var(--color-surface-2),var(--color-surface))]",
    "text-[var(--color-text)] shadow-[0_6px_14px_rgba(0,0,0,0.1)]",
    "hover:border-white/16 hover:bg-[linear-gradient(180deg,var(--color-surface-3),var(--color-surface-2))] hover:shadow-[0_8px_18px_rgba(0,0,0,0.12)]",
  ),
  ghost: cn(
    "border border-transparent bg-transparent text-[var(--color-text)]",
    "hover:border-white/8 hover:bg-white/[0.035]",
  ),
  transparent: cn(
    "border border-white/10 bg-white/[0.02] text-[var(--color-text)]",
    "backdrop-blur-xl hover:border-white/14 hover:bg-white/[0.045]",
  ),
  destructive: cn(
    "[--button-tracking-color:rgba(255,255,255,0.18)]",
    "border border-[rgba(255,255,255,0.22)] bg-[linear-gradient(135deg,var(--color-danger),var(--color-danger-hover))]",
    "text-white shadow-[0_8px_18px_var(--color-danger-glow)]",
    "hover:border-[rgba(255,255,255,0.34)] hover:bg-[linear-gradient(135deg,var(--color-danger),#a30000)] hover:shadow-[0_10px_22px_var(--color-danger-glow)]",
  ),
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
    onMouseMove,
    style,
    ...props
  }: ButtonProps) => {
    const isDisabled = useMemo(
      () => disabled || isLoading,
      [disabled, isLoading],
    );

    const handleMouseMove = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        const target = event.currentTarget;
        const rect = target.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        target.style.setProperty("--button-radial-x", `${x}%`);
        target.style.setProperty("--button-radial-y", `${y}%`);
        target.style.setProperty("--button-radial-opacity", "1");
        onMouseMove?.(event);
      },
      [onMouseMove],
    );

    return (
      <button
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        onMouseMove={handleMouseMove}
        style={style}
        className={cn(
          "group relative inline-flex min-h-11 items-center justify-center gap-2.5",
          "rounded-[var(--button-radius)] px-5 py-2.5",
          "text-sm font-medium tracking-[0.02em]",
          "transition-[transform,box-shadow,border-color,background-color,opacity]",
          "duration-[var(--transition-base)] ease-[var(--transition-base)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "active:translate-y-[1px] active:scale-[0.99]",
          "before:pointer-events-none before:absolute before:inset-[1px] before:rounded-[inherit] before:bg-[radial-gradient(circle_at_var(--button-radial-x,_50%)_var(--button-radial-y,_50%),var(--button-tracking-color,rgba(14,18,28,var(--button-radial-opacity,_0.34))),transparent_62%)] before:opacity-0 before:transition-[opacity,background-position] before:duration-[var(--transition-base)] hover:before:opacity-100",
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        <span className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/[0.06]" />

        {isLoading ? (
          <span
            aria-hidden="true"
            className="relative z-10 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
        ) : (
          leftIcon && (
            <span
              aria-hidden="true"
              className="relative z-10 inline-flex shrink-0 text-[1.05em]"
            >
              {leftIcon}
            </span>
          )
        )}

        <span className="relative z-10">{children}</span>

        {!isLoading && rightIcon && (
          <span
            aria-hidden="true"
            className="relative z-10 inline-flex shrink-0 text-[1.05em]"
          >
            {rightIcon}
          </span>
        )}
      </button>
    );
  },
);
