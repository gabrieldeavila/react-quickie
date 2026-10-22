import { SECRET_MASK } from "../domain/looks-like-token";
import {
  withStaySignedIn,
  type OAuthClientSource,
  type OAuthFormValues,
} from "../domain/oauth-form";
import { KeyValueEditor } from "./KeyValueEditor";

type Props = {
  oauth: OAuthFormValues;
  clients: OAuthClientSource[];
  error?: string;
  onChange: (oauth: OAuthFormValues) => void;
  onReuse: (source: OAuthClientSource) => void;
};

const sourceKey = (source: OAuthClientSource) =>
  `${source.scope}:${source.name}`;

/**
 * The sign-in client of an http/sse server. Only providers that don't
 * register apps on their own (e.g. Google) need it; collapsed otherwise.
 */
export function OAuthFields({
  oauth,
  clients,
  error,
  onChange,
  onReuse,
}: Props) {
  const set = <K extends keyof OAuthFormValues>(
    key: K,
    value: OAuthFormValues[K],
  ) => onChange({ ...oauth, [key]: value });
  const hasValues = !!(oauth.clientId || oauth.clientSecret || oauth.scope);

  return (
    <details className="mcp-oauth" open={hasValues || !!error}>
      <summary className="chat-control__label">Sign-in (OAuth)</summary>
      <p className="mcp-oauth__hint">
        Most servers need nothing here: Doty signs in on its own. Fill this in
        only for providers that require your own OAuth client, such as Google.
      </p>

      {clients.length ? (
        <label className="chat-control chat-control--full">
          <span className="chat-control__label">Reuse the client of</span>
          <select
            className="chat-input chat-input--modal mcp-form__input"
            value=""
            onChange={(event) => {
              const source = clients.find(
                (item) => sourceKey(item) === event.target.value,
              );
              if (source) onReuse(source);
            }}
          >
            <option value="">Choose a server…</option>
            {clients.map((source) => (
              <option key={sourceKey(source)} value={sourceKey(source)}>
                {source.name} ({source.scope})
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="chat-control chat-control--full">
        <span className="chat-control__label">Client ID</span>
        <input
          className="chat-input chat-input--modal mcp-form__input"
          value={oauth.clientId}
          onChange={(event) => set("clientId", event.target.value)}
          placeholder="123….apps.googleusercontent.com"
          spellCheck={false}
        />
      </label>
      <label className="chat-control chat-control--full">
        <span className="chat-control__label">Client secret</span>
        <input
          className="chat-input chat-input--modal mcp-form__input"
          type="password"
          value={oauth.clientSecret}
          onChange={(event) => set("clientSecret", event.target.value)}
          placeholder="Optional; ${VAR} reads it from the API's environment"
          autoComplete="off"
          spellCheck={false}
        />
        {oauth.clientSecret === SECRET_MASK ? (
          <small className="mcp-oauth__hint">
            The saved secret is kept. Type a new one to replace it.
          </small>
        ) : null}
      </label>
      <label className="chat-control chat-control--full">
        <span className="chat-control__label">Scopes</span>
        <textarea
          className="chat-input chat-input--modal mcp-form__input mcp-oauth__scopes"
          value={oauth.scope}
          onChange={(event) => set("scope", event.target.value)}
          placeholder="https://www.googleapis.com/auth/documents …"
          spellCheck={false}
          rows={2}
        />
      </label>
      <KeyValueEditor
        label="Extra sign-in parameters"
        rows={oauth.params}
        keyPlaceholder="access_type"
        onChange={(rows) => set("params", rows)}
      />
      <button
        type="button"
        className="chat-button chat-button--ghost mcp-oauth__preset"
        onClick={() => set("params", withStaySignedIn(oauth.params))}
      >
        Stay signed in (Google)
      </button>
      {error ? <span className="chat-modal__error">{error}</span> : null}
    </details>
  );
}
