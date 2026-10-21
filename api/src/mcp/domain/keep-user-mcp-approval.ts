function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * The agent may write a server entry but never its `approval` setting:
 * otherwise it could exempt its own MCP tools from asking the user. The
 * stored entry's setting is kept (none for a new server, so every tool asks).
 */
export function keepUserMcpApproval(config: unknown, stored: unknown): unknown {
  if (!isPlainObject(config)) return config;
  const rest = { ...config };
  delete rest.approval;
  const approval = isPlainObject(stored) ? stored.approval : undefined;
  return approval === undefined ? rest : { ...rest, approval };
}
