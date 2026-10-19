import { memo } from "react";
import type { IconType } from "react-icons";

const Button = memo<
  React.ComponentProps<"button"> & {
    icon: IconType;
  }
>(({ title, icon: Icon, ...props }) => {
  return (
    <button
      type="button"
      className="chat-button chat-button--ghost chat-header__action-button"
      aria-label={title}
      title={title}
      {...props}
    >
      <span
        className="chat-button__icon-wrap chat-header__action-icon-wrap"
        aria-hidden="true"
      >
        <Icon className="chat-button__icon chat-header__action-icon" />
      </span>
    </button>
  );
});

export default Button;
