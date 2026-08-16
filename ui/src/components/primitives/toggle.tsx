import { memo, useState } from "react";

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  className?: string;
  disabled?: boolean;
};

const Toggle = memo(function Toggle({
  checked,
  onChange,
  label,
  description,
  className = "",
  disabled = false,
}: ToggleProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div className={`chat-toggle-card ${className}`.trim()}>
      <div className="chat-toggle-card__copy">
        <span className="chat-control__label">{label}</span>
        {description ? (
          <p className="chat-toggle-card__description">{description}</p>
        ) : null}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`chat-toggle-switch ${checked ? "chat-toggle-switch--on" : "chat-toggle-switch--off"} ${isPressed ? "chat-toggle-switch--pressed" : ""}`.trim()}
        onPointerDown={() => setIsPressed(true)}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        onBlur={() => setIsPressed(false)}
        onClick={() => onChange(!checked)}
        disabled={disabled}
      >
        <span className="chat-toggle-switch__track" aria-hidden="true" />
        <span className="chat-toggle-switch__thumb" aria-hidden="true" />
      </button>
    </div>
  );
});

export default Toggle;
