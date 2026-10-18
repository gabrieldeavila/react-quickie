type Props = {
  path: string;
  isBusy: boolean;
  onTrust: () => void;
};

/** A project mcp.json can start any command, so it stays off until trusted. */
export function McpTrustNotice({ path, isBusy, onTrust }: Props) {
  return (
    <div className="mcp-trust-notice" role="alert">
      <p>
        This project has its own MCP configuration. It can run commands on
        your machine, so it stays off until you review the file and trust it:
      </p>
      <code>{path}</code>
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
