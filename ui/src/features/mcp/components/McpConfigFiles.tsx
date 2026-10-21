import type {
  McpConfigFileView,
  McpScope,
  McpServersResponse,
} from "../domain/mcp-server.types";

type Props = {
  data: McpServersResponse;
  /** VSCode opens the file; the browser only shows the path. */
  canOpen: boolean;
  onOpen: (scope: McpScope) => void;
};

function FileLine({
  label,
  scope,
  file,
  canOpen,
  onOpen,
}: {
  label: string;
  scope: McpScope;
  file: McpConfigFileView;
  canOpen: boolean;
  onOpen: (scope: McpScope) => void;
}) {
  return (
    <li>
      {label}:{" "}
      {canOpen && file.exists ? (
        <button
          type="button"
          className="mcp-config-files__link"
          onClick={() => onOpen(scope)}
        >
          <code>{file.path}</code>
        </button>
      ) : (
        <code>{file.path}</code>
      )}
      {file.exists ? "" : " (doesn't exist yet)"}
      {file.error ? (
        <span className="mcp-tone--error"> · {file.error}</span>
      ) : null}
    </li>
  );
}

/** Where the two config files are, opening them in VSCode. */
export function McpConfigFiles({ data, canOpen, onOpen }: Props) {
  return (
    <ul className="mcp-section__files">
      <FileLine
        label="Global"
        scope="global"
        file={data.globalConfig}
        canOpen={canOpen}
        onOpen={onOpen}
      />
      <FileLine
        label="Project"
        scope="project"
        file={data.projectConfig}
        canOpen={canOpen}
        onOpen={onOpen}
      />
    </ul>
  );
}
