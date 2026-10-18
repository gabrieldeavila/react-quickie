import { createHash } from 'crypto';

/** OpenAI and Anthropic both require `^[a-zA-Z0-9_-]{1,64}$`. */
export const MAX_TOOL_NAME_LENGTH = 64;
const SUFFIX_LENGTH = 6;

export type McpToolRef = { server: string; tool: string };

function sanitize(part: string): string {
  return part.replace(/[^A-Za-z0-9_-]/g, '_');
}

function shortHash({ server, tool }: McpToolRef): string {
  return createHash('sha256')
    .update(`${server}\u0000${tool}`)
    .digest('hex')
    .slice(0, SUFFIX_LENGTH);
}

/** `mcp__<server>__<tool>`, sanitized and cut to the provider limit. */
export function buildMcpToolName({ server, tool }: McpToolRef): string {
  return `mcp__${sanitize(server)}__${sanitize(tool)}`.slice(
    0,
    MAX_TOOL_NAME_LENGTH,
  );
}

function withSuffix(ref: McpToolRef): string {
  const base = buildMcpToolName(ref).slice(
    0,
    MAX_TOOL_NAME_LENGTH - SUFFIX_LENGTH - 1,
  );
  return `${base}_${shortHash(ref)}`;
}

/**
 * Names for every tool, unique across servers. When sanitizing or truncating
 * makes two names equal, each of them gets a short hash of its original
 * server + tool, so the suffix is stable across requests.
 */
export function assignMcpToolNames(refs: McpToolRef[]): string[] {
  const baseNames = refs.map(buildMcpToolName);
  const counts = new Map<string, number>();
  for (const name of baseNames) counts.set(name, (counts.get(name) ?? 0) + 1);

  return refs.map((ref, index) =>
    counts.get(baseNames[index])! > 1 ? withSuffix(ref) : baseNames[index],
  );
}
