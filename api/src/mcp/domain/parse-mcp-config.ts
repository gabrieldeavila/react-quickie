import { interpolateEnv } from './interpolate-env';
import {
  isStdioServer,
  mcpConfigFileSchema,
  mcpServerSchema,
} from './mcp-config.schema';
import type { McpConfigSource, ParsedMcpServer } from './mcp-server.types';

export type ParsedMcpConfig = {
  servers: ParsedMcpServer[];
  /** The whole file is unusable (bad JSON or no `mcpServers` object). */
  error?: string;
};

type ParseOptions = {
  source: McpConfigSource;
  env: Record<string, string | undefined>;
};

function parseJson(text: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}

function parseServer(
  name: string,
  raw: unknown,
  { source, env }: ParseOptions,
): ParsedMcpServer {
  const shape = mcpServerSchema.safeParse(raw);
  if (!shape.success) {
    return {
      name,
      source,
      error: `Configuração inválida: informe "command" (stdio) ou "type" + "url" (http/sse).`,
    };
  }

  const { value, missing } = interpolateEnv(shape.data, env);
  if (missing.length > 0) {
    return {
      name,
      source,
      error: `Variáveis de ambiente ausentes: ${missing.join(', ')}`,
    };
  }

  if (!isStdioServer(value) && !URL.canParse(value.url)) {
    return { name, source, error: `URL inválida: ${value.url}` };
  }
  return { name, source, config: value };
}

/**
 * Parses one `mcp.json` (Claude/Cursor format). An invalid server only
 * errors that server; the rest of the file still loads.
 */
export function parseMcpConfig(
  text: string,
  options: ParseOptions,
): ParsedMcpConfig {
  const json = parseJson(text);
  if (!json.ok) return { servers: [], error: 'JSON inválido.' };

  const file = mcpConfigFileSchema.safeParse(json.value);
  if (!file.success) {
    return {
      servers: [],
      error: 'O arquivo precisa de um objeto "mcpServers".',
    };
  }

  return {
    servers: Object.entries(file.data.mcpServers).map(([name, raw]) =>
      parseServer(name, raw, options),
    ),
  };
}
