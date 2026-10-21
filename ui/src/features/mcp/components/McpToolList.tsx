import type { McpApprovalMode, McpServerView } from "../domain/mcp-server.types";
import {
  approvalFor,
  readApprovalSetting,
  withToolApproval,
} from "../domain/tool-approval";
import type { McpServersState } from "../hooks/useMcpServers";

type Props = {
  server: McpServerView;
  state: McpServersState;
};

/** Per-tool approval of one server: ask (default) or never. */
export function McpToolList({ server, state }: Props) {
  const tools = server.toolNames ?? [];
  const setting = readApprovalSetting(server.config);
  const isBusy = state.busy === server.name;

  const change = (tool: string, mode: McpApprovalMode) =>
    void state.setToolApproval(
      server,
      withToolApproval(setting, tool, mode, tools),
    );

  if (tools.length === 0) {
    return (
      <p className="mcp-section__empty">
        The tool list appears once the server connects. Send a message or use
        Reconnect, then come back here.
      </p>
    );
  }

  return (
    <ul className="mcp-tool-list" aria-label={`Tools of ${server.name}`}>
      {tools.map((tool) => (
        <li key={tool} className="mcp-tool-list__row">
          <code className="mcp-tool-list__name">{tool}</code>
          <select
            className="chat-input mcp-tool-list__select"
            value={approvalFor(setting, tool)}
            onChange={(event) =>
              change(tool, event.target.value as McpApprovalMode)
            }
            disabled={isBusy}
            aria-label={`Approval for ${tool}`}
          >
            <option value="ask">Ask before running</option>
            <option value="never">Run without asking</option>
          </select>
        </li>
      ))}
    </ul>
  );
}
