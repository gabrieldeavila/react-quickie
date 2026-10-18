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
        Este projeto tem uma configuração MCP própria. Ela pode executar
        comandos na sua máquina, então fica desativada até você revisar o
        arquivo e confiar nele:
      </p>
      <code>{path}</code>
      <button
        type="button"
        className="chat-button"
        disabled={isBusy}
        onClick={onTrust}
      >
        {isBusy ? "Confiando…" : "Revisei, confiar nesta configuração"}
      </button>
    </div>
  );
}
