import { memo } from "react";
import type { IconType } from "react-icons";

const Button = memo<
  React.ComponentProps<"button"> & {
    icon: IconType;
    highlight?: boolean;
  }
>(({ title, highlight, icon: Icon, ...props }) => {
  return (
    <button
      type="button"
      className={`chat-button ${highlight ? "chat-button--primary" : "chat-button--ghost"} chat-header__action-button`}
      aria-label={title}
      title={title}
      {...props}
    >
      <span
        className={`chat-button__icon-wrap ${highlight ? "" : "chat-header__action-icon-wrap"}`}
        aria-hidden="true"
      >
        <Icon
          className={`chat-button__icon ${highlight ? "" : "chat-header__action-icon"}`}
        />
      </span>
    </button>
  );
});

export default Button;
