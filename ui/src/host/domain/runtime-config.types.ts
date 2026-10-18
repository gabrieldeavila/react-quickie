export type HostKind = "vscode" | "browser";

/** How the UI reaches the API and which editor (if any) hosts it. */
export type RuntimeConfig = {
  apiUrl: string;
  token: string | null;
  /** Workspace folders the host opened; empty in the browser. */
  roots: string[];
  host: HostKind;
};
