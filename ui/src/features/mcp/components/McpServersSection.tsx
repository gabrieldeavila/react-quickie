import { needsProjectTrust } from "../domain/describe-server-status";
import type { McpConfigFileView } from "../domain/mcp-server.types";
import { useMcpServers } from "../hooks/useMcpServers";
import { McpServerRow } from "./McpServerRow";
import { McpTrustNotice } from "./McpTrustNotice";

type Props = { root: string };

function ConfigFileHint({
  label,
  file,
}: {
  label: string;
  file: McpConfigFileView;
}) {
  return (
    <li>
      {label}: <code>{file.path}</code>
      {file.exists ? "" : " (doesn't exist)"}
      {file.error ? (
        <span className="mcp-tone--error"> · {file.error}</span>
      ) : null}
    </li>
  );
}

export function McpServersSection({ root }: Props) {
  const { data, error, busy, refresh, trust, reconnect } = useMcpServers(root);

  return (
    <section className="mcp-section" aria-labelledby="mcp-section-title">
      <div className="mcp-section__header">
        <h3 id="mcp-section-title">MCP servers</h3>
        <button
          type="button"
          className="chat-button chat-button--ghost"
          onClick={refresh}
        >
          Refresh
        </button>
      </div>

      {error ? <p className="chat-modal__error">{error}</p> : null}
      {!data && !error ? (
        <p className="mcp-section__empty">Loading…</p>
      ) : null}

      {data ? (
        <>
          {needsProjectTrust(data.projectConfig) ? (
            <McpTrustNotice
              path={data.projectConfig.path}
              isBusy={busy === "trust"}
              onTrust={trust}
            />
          ) : null}

          {data.servers.length === 0 ? (
            <p className="mcp-section__empty">No servers configured.</p>
          ) : (
            <ul className="mcp-server-list">
              {data.servers.map((server) => (
                <McpServerRow
                  key={`${server.source}:${server.name}`}
                  server={server}
                  isBusy={busy === server.name}
                  onReconnect={reconnect}
                />
              ))}
            </ul>
          )}

          <ul className="mcp-section__files">
            <ConfigFileHint label="Global" file={data.globalConfig} />
            <ConfigFileHint label="Project" file={data.projectConfig} />
          </ul>
        </>
      ) : null}
    </section>
  );
}
