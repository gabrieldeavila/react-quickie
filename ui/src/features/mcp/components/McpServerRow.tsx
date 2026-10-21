import { describeServerStatus } from "../domain/describe-server-status";
import { describeServerSummary } from "../domain/describe-server-summary";
import type { McpServerView } from "../domain/mcp-server.types";
import { McpRowMenu, type McpRowAction } from "./McpRowMenu";

type Props = {
  server: McpServerView;
  isBusy: boolean;
  actions: McpRowAction[];
  /** Shown as a button next to the menu when the server needs a sign-in. */
  onSignIn?: () => void;
};

const DOT: Record<McpServerView["status"], string> = {
  connected: "●",
  connecting: "●",
  idle: "●",
  error: "●",
  "needs-auth": "⚠",
  disabled: "○",
  untrusted: "⚠",
};

/** One server: status dot, name, "http · global · 12 tools", status, actions. */
export function McpServerRow({ server, isBusy, actions, onSignIn }: Props) {
  const status = describeServerStatus(server);

  return (
    <li className="mcp-server-row">
      <span
        className={`mcp-server-row__dot mcp-tone--${status.tone}`}
        aria-hidden="true"
      >
        {DOT[server.status]}
      </span>
      <div className="mcp-server-row__main">
        <strong>{server.name}</strong>
        <span className="mcp-server-row__meta">
          {describeServerSummary(server)}
        </span>
        <span className={`mcp-server-row__status mcp-tone--${status.tone}`}>
          {isBusy ? "Working…" : status.label}
        </span>
        {server.error ? (
          <small className="mcp-server-row__error">{server.error}</small>
        ) : null}
      </div>
      {onSignIn ? (
        <button
          type="button"
          className="chat-button mcp-server-row__action"
          disabled={isBusy}
          onClick={onSignIn}
        >
          Sign in
        </button>
      ) : null}
      {actions.length ? (
        <McpRowMenu serverName={server.name} actions={actions} />
      ) : null}
    </li>
  );
}
