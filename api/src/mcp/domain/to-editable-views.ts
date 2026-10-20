import { maskMcpSecrets } from './mask-mcp-secrets';
import type { McpConfigSource, McpServerView } from './mcp-server.types';

export type EditableMcpServerView = McpServerView & {
  /** The file the entry lives in (same as `source`). */
  scope: McpConfigSource;
  disabled: boolean;
  /** The entry as written, with literal secrets masked. */
  config?: unknown;
};

/** Adds what the edit dialog needs to each listed server. */
export function toEditableViews(
  views: McpServerView[],
  raw: Record<McpConfigSource, Record<string, unknown>>,
): EditableMcpServerView[] {
  return views.map((view) => ({
    ...view,
    scope: view.source,
    disabled: view.status === 'disabled',
    config: maskMcpSecrets(raw[view.source][view.name]),
  }));
}
