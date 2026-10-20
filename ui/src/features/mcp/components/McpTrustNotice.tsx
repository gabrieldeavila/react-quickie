import { describeServerLaunch } from "../domain/describe-server-summary";
import type { McpServerView } from "../domain/mcp-server.types";

type Props = {
  path: string;
  servers: McpServerView[];
  isBusy: boolean;
  onTrust: () => void;
};

/** A project mcp.json can start any command, so it stays off until trusted. */
export function McpTrustNotice({ path, servers, isBusy, onTrust }: Props) {
  return (
    <div className="mcp-trust-notice" role="alert">
      <p>
        This project has its own MCP configuration. It can run commands on
        your machine, so it stays off until you review it and trust it:
      </p>
      <code>{path}</code>
      {servers.length ? (
        <ul className="mcp-trust-notice__servers" aria-label="What it would run">
          {servers.map((server) => (
            <li key={server.name}>
              <strong>{server.name}</strong>{" "}
              <code>{describeServerLaunch(server)}</code>
            </li>
          ))}
        </ul>
      ) : null}
      <button
        type="button"
        className="chat-button"
        disabled={isBusy}
        onClick={onTrust}
      >
        {isBusy ? "Trusting…" : "I've reviewed it, trust this configuration"}
      </button>
    </div>
  );
}
