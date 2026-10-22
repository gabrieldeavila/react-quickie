import type { KeyValueRow, McpServerFormValues } from "./mcp-server-form";

export type McpServerFormErrors = Partial<
  Record<"name" | "command" | "url" | "env" | "headers" | "oauth", string>
>;

/** Same rule as the API. */
const SERVER_NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;

function rowsError(rows: KeyValueRow[]): string | undefined {
  const keys = rows.map((row) => row.key.trim());
  if (rows.some((row, index) => !keys[index] && row.value.trim())) {
    return "Every value needs a name.";
  }
  const named = keys.filter(Boolean);
  if (new Set(named).size !== named.length) return "Names must be unique.";
  return undefined;
}

/** A URL, or one built from `${VAR}`s (checked by the API after interpolation). */
function isUrlLike(value: string): boolean {
  return value.includes("${") || URL.canParse(value);
}

/** A secret belongs to a client ID; sign-in parameters need names. */
function oauthError({ oauth }: McpServerFormValues): string | undefined {
  if (oauth.clientSecret.trim() && !oauth.clientId.trim()) {
    return "Enter the client ID that goes with this secret.";
  }
  return rowsError(oauth.params);
}

/** Mirrors the API's server schema, so most mistakes show before saving. */
export function validateMcpServerForm(
  values: McpServerFormValues,
): McpServerFormErrors {
  const errors: McpServerFormErrors = {};
  if (!SERVER_NAME.test(values.name)) {
    errors.name = 'Use letters, digits, ".", "_" and "-" (up to 64).';
  }
  if (values.transport === "stdio") {
    if (!values.command.trim()) errors.command = "Enter the command to run.";
    const env = rowsError(values.env);
    if (env) errors.env = env;
  } else {
    const url = values.url.trim();
    if (!url) errors.url = "Enter the server URL.";
    else if (!isUrlLike(url)) errors.url = "That isn't a valid URL.";
    const headers = rowsError(values.headers);
    if (headers) errors.headers = headers;
    const oauth = oauthError(values);
    if (oauth) errors.oauth = oauth;
  }
  return errors;
}
