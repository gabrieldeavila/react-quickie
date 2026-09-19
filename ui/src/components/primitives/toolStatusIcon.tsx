import { memo } from "react";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { LuLoaderCircle } from "react-icons/lu";
import type { ToolStatusIconProps } from "~types/interface/chat.interface";

export const ToolStatusIcon = memo(function ToolStatusIcon({
  status,
}: ToolStatusIconProps) {
  const className = "tool-status-icon";

  if (status === "loading") {
    return (
      <LuLoaderCircle
        className={`${className} tool-status-icon--loading`}
        aria-hidden="true"
      />
    );
  }

  if (status === "success") {
    return (
      <FiCheckCircle
        className={`${className} tool-status-icon--success`}
        aria-hidden="true"
      />
    );
  }

  return (
    <FiAlertCircle
      className={`${className} tool-status-icon--error`}
      aria-hidden="true"
    />
  );
});
