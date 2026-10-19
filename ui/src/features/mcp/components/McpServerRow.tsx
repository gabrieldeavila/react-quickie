import { describeServerStatus } from "../domain/describe-server-status";
import type { McpServerView } from "../domain/mcp-server.types";

type Props = {
  server: McpServerView;
  isBusy: boolean;
  onReconnect: (name: string) => void;
};

const SOURCE_LABEL = { global: "global", project: "project" } as const;

export function McpServerRow({ server, isBusy, onReconnect }: Props) {
  const status = describeServerStatus(server);

  return (
    <li className="mcp-server-row">
      <div className="mcp-server-row__main">
        <strong>{server.name}</strong>
        <span className="mcp-server-row__meta">
          {SOURCE_LABEL[server.source]} · {server.transport}
        </span>
        <span className={`mcp-server-row__status mcp-tone--${status.tone}`}>
          {status.label}
        </span>
        {server.error ? (
          <small className="mcp-server-row__error">{server.error}</small>
        ) : null}
      </div>
      {status.canReconnect ? (
        <button
          type="button"
          className="chat-button chat-button--ghost mcp-server-row__action"
          disabled={isBusy}
          onClick={() => onReconnect(server.name)}
        >
          {isBusy ? "Connecting…" : "Reconnect"}
        </button>
      ) : null}
    </li>
  );
}
