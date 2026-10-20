import { FiPlus, FiX } from "react-icons/fi";

type Props = {
  args: string[];
  onChange: (args: string[]) => void;
};

/** One argument per row, so values with spaces need no quoting. */
export function ArgsEditor({ args, onChange }: Props) {
  return (
    <fieldset className="mcp-rows">
      <legend className="chat-control__label">Arguments</legend>
      {args.map((arg, index) => (
        <div className="mcp-rows__row mcp-rows__row--single" key={index}>
          <input
            className="chat-input chat-input--modal mcp-rows__input"
            value={arg}
            onChange={(event) =>
              onChange(
                args.map((item, i) => (i === index ? event.target.value : item)),
              )
            }
            aria-label={`Argument ${index + 1}`}
          />
          <button
            type="button"
            className="chat-button chat-button--ghost mcp-rows__remove"
            onClick={() => onChange(args.filter((_, i) => i !== index))}
            aria-label={`Remove argument ${index + 1}`}
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="chat-button chat-button--ghost mcp-rows__add"
        onClick={() => onChange([...args, ""])}
      >
        <FiPlus aria-hidden="true" /> Add argument
      </button>
    </fieldset>
  );
}
