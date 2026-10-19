import { FiArrowUp, FiSquare } from "react-icons/fi";

type SendButtonProps = {
  isStoppable: boolean;
  isSendDisabled: boolean;
  onSend: () => void;
  onStop: () => void;
};

/** The only filled (accent) button in the chat: send, or stop while responding. */
export function SendButton({
  isStoppable,
  isSendDisabled,
  onSend,
  onStop,
}: SendButtonProps) {
  const label = isStoppable ? "Stop response" : "Send message";

  return (
    <button
      className={`send-button ${isStoppable ? "send-button--pause" : ""}`}
      onClick={isStoppable ? onStop : onSend}
      disabled={isStoppable ? false : isSendDisabled}
      title={label}
      aria-label={label}
      type="button"
    >
      {isStoppable ? (
        <FiSquare aria-hidden="true" />
      ) : (
        <FiArrowUp aria-hidden="true" />
      )}
    </button>
  );
}
