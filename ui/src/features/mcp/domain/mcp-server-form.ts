import type {
  McpScope,
  McpServerView,
  McpTransport,
} from "./mcp-server.types";

export type KeyValueRow = { key: string; value: string };

export type McpServerFormValues = {
  name: string;
  scope: McpScope;
  transport: McpTransport;
  /** stdio */
  command: string;
  args: string[];
  env: KeyValueRow[];
  /** http / sse */
  url: string;
  headers: KeyValueRow[];
  /** Fields the form doesn't edit (approval, tool filters, disabled, unknown keys); kept on save. */
  extra: Record<string, unknown>;
};

const FORM_KEYS = new Set(["type", "command", "args", "env", "url", "headers"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function readRows(value: unknown): KeyValueRow[] {
  if (!isRecord(value)) return [];
  return Object.entries(value).map(([key, item]) => ({
    key,
    value: typeof item === "string" ? item : String(item),
  }));
}

function readStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function readTransport(config: Record<string, unknown>): McpTransport {
  if (config.type === "http" || config.type === "sse") return config.type;
  return "stdio";
}

export function emptyServerForm(
  scope: McpScope = "global",
): McpServerFormValues {
  return {
    name: "",
    scope,
    transport: "stdio",
    command: "",
    args: [],
    env: [],
    url: "",
    headers: [],
    extra: {},
  };
}

/** The form for an existing server, from its (masked) entry in the file. */
export function formFromServer(server: McpServerView): McpServerFormValues {
  const config = isRecord(server.config) ? server.config : {};
  return {
    name: server.name,
    scope: server.scope,
    transport: readTransport(config),
    command: typeof config.command === "string" ? config.command : "",
    args: readStrings(config.args),
    env: readRows(config.env),
    url: typeof config.url === "string" ? config.url : "",
    headers: readRows(config.headers),
    extra: Object.fromEntries(
      Object.entries(config).filter(([key]) => !FORM_KEYS.has(key)),
    ),
  };
}

/** Rows → object; rows without a key are skipped. Undefined when empty. */
function toRecord(rows: KeyValueRow[]): Record<string, string> | undefined {
  const entries = rows
    .filter((row) => row.key.trim())
    .map((row): [string, string] => [row.key.trim(), row.value]);
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function withoutUndefined(
  value: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  );
}

/** The config the API stores (`PUT /mcp/servers/:name`). */
export function formToConfig(
  values: McpServerFormValues,
): Record<string, unknown> {
  if (values.transport === "stdio") {
    const args = values.args.map((arg) => arg.trim()).filter(Boolean);
    return withoutUndefined({
      command: values.command.trim(),
      args: args.length ? args : undefined,
      env: toRecord(values.env),
      ...values.extra,
    });
  }
  return withoutUndefined({
    type: values.transport,
    url: values.url.trim(),
    headers: toRecord(values.headers),
    ...values.extra,
  });
}
