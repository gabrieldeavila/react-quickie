import { FiPlus, FiX } from "react-icons/fi";
import { looksLikeToken, SECRET_MASK } from "../domain/looks-like-token";
import type { KeyValueRow } from "../domain/mcp-server-form";

type Props = {
  label: string;
  rows: KeyValueRow[];
  keyPlaceholder: string;
  onChange: (rows: KeyValueRow[]) => void;
  error?: string;
};

/** Name/value rows for `env` and `headers`; values may be secrets. */
export function KeyValueEditor({
  label,
  rows,
  keyPlaceholder,
  onChange,
  error,
}: Props) {
  const update = (index: number, patch: Partial<KeyValueRow>) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  return (
    <fieldset className="mcp-rows">
      <legend className="chat-control__label">{label}</legend>
      {rows.map((row, index) => (
        <div className="mcp-rows__row" key={index}>
          <input
            className="chat-input chat-input--modal mcp-rows__input"
            value={row.key}
            onChange={(event) => update(index, { key: event.target.value })}
            placeholder={keyPlaceholder}
            aria-label={`${label} name ${index + 1}`}
          />
          <input
            className="chat-input chat-input--modal mcp-rows__input"
            value={row.value}
            onChange={(event) => update(index, { value: event.target.value })}
            placeholder="${ENV_VAR} or value"
            aria-label={`${label} value ${index + 1}`}
          />
          <button
            type="button"
            className="chat-button chat-button--ghost mcp-rows__remove"
            onClick={() => onChange(rows.filter((_, i) => i !== index))}
            aria-label={`Remove ${row.key || `row ${index + 1}`}`}
          >
            <FiX aria-hidden="true" />
          </button>
          {row.value === SECRET_MASK ? (
            <small className="mcp-rows__hint">
              Stored value kept. Type a new one to replace it.
            </small>
          ) : looksLikeToken(row.value) ? (
            <small className="mcp-rows__hint mcp-tone--warning">
              Looks like a token: consider <code>{"${ENV_VAR}"}</code> so it
              stays out of the file.
            </small>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        className="chat-button chat-button--ghost mcp-rows__add"
        onClick={() => onChange([...rows, { key: "", value: "" }])}
      >
        <FiPlus aria-hidden="true" /> Add
      </button>
      {error ? <span className="chat-modal__error">{error}</span> : null}
    </fieldset>
  );
}
