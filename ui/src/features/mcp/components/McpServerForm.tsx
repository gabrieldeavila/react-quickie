import type { McpServerFormValues } from "../domain/mcp-server-form";
import type { McpScope, McpTransport } from "../domain/mcp-server.types";
import type { McpServerEditor } from "../hooks/useMcpServerEditor";
import { ArgsEditor } from "./ArgsEditor";
import { KeyValueEditor } from "./KeyValueEditor";
import { OAuthFields } from "./OAuthFields";

type Props = { editor: McpServerEditor };

function FieldError({ message }: { message?: string }) {
  return message ? <span className="chat-modal__error">{message}</span> : null;
}

/** Add / edit one server: name, scope, transport and its fields, or raw JSON. */
export function McpServerForm({ editor }: Props) {
  const { draft, errors, change } = editor;
  if (!draft) return null;
  const { values, isNew, json } = draft;
  const set = <K extends keyof McpServerFormValues>(
    key: K,
    value: McpServerFormValues[K],
  ) => change(key, value);

  return (
    <div className="chat-modal__fields mcp-form">
      <div className="mcp-form__row">
        <label className="chat-control">
          <span className="chat-control__label">Name</span>
          <input
            className="chat-input chat-input--modal mcp-form__input"
            value={values.name}
            onChange={(event) => set("name", event.target.value)}
            readOnly={!isNew}
            placeholder="github"
            autoFocus={isNew}
          />
          <FieldError message={errors.name} />
        </label>
        <label className="chat-control">
          <span className="chat-control__label">Scope</span>
          <select
            className="chat-input chat-input--modal mcp-form__input"
            value={values.scope}
            onChange={(event) => set("scope", event.target.value as McpScope)}
            disabled={!isNew}
          >
            <option value="global">Global (every project)</option>
            <option value="project">Project (.doty/mcp.json)</option>
          </select>
        </label>
      </div>

      <div className="mcp-form__json-toggle">
        <button
          type="button"
          className="chat-button chat-button--ghost"
          onClick={editor.toggleJson}
          aria-pressed={json !== null}
        >
          {json === null ? "Edit JSON" : "Back to the form"}
        </button>
      </div>

      {json !== null ? (
        <label className="chat-control chat-control--full">
          <span className="chat-control__label">Server JSON</span>
          <textarea
            className="chat-input chat-input--modal mcp-form__json"
            value={json}
            onChange={(event) => editor.setJson(event.target.value)}
            spellCheck={false}
            aria-label="Server JSON"
          />
        </label>
      ) : (
        <>
          <label className="chat-control chat-control--full">
            <span className="chat-control__label">Transport</span>
            <select
              className="chat-input chat-input--modal mcp-form__input"
              value={values.transport}
              onChange={(event) =>
                set("transport", event.target.value as McpTransport)
              }
            >
              <option value="stdio">stdio (runs a command)</option>
              <option value="http">HTTP</option>
              <option value="sse">SSE</option>
            </select>
          </label>

          {values.transport === "stdio" ? (
            <>
              <label className="chat-control chat-control--full">
                <span className="chat-control__label">Command</span>
                <input
                  className="chat-input chat-input--modal mcp-form__input"
                  value={values.command}
                  onChange={(event) => set("command", event.target.value)}
                  placeholder="npx"
                />
                <FieldError message={errors.command} />
              </label>
              <ArgsEditor
                args={values.args}
                onChange={(args) => set("args", args)}
              />
              <KeyValueEditor
                label="Environment"
                rows={values.env}
                keyPlaceholder="NAME"
                onChange={(rows) => set("env", rows)}
                error={errors.env}
              />
            </>
          ) : (
            <>
              <label className="chat-control chat-control--full">
                <span className="chat-control__label">URL</span>
                <input
                  className="chat-input chat-input--modal mcp-form__input"
                  value={values.url}
                  onChange={(event) => set("url", event.target.value)}
                  placeholder="https://example.com/mcp"
                />
                <FieldError message={errors.url} />
              </label>
              <KeyValueEditor
                label="Headers"
                rows={values.headers}
                keyPlaceholder="Authorization"
                onChange={(rows) => set("headers", rows)}
                error={errors.headers}
              />
              <OAuthFields
                oauth={values.oauth}
                clients={editor.oauthClients}
                error={errors.oauth}
                onChange={(oauth) => set("oauth", oauth)}
                onReuse={editor.reuseOAuth}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
