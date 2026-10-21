export type DotySettings = {
  defaultModel?: string;
  openaiCompatibleBaseUrl?: string;
  openaiCompatibleModels?: string;
};

export type ApiEnvInput = {
  /** The extension host env (keeps PATH, HOME… for the bash tool). */
  baseEnv: Record<string, string | undefined>;
  port: number;
  token: string;
  workspaceRoots: string[];
  dataDir: string;
  apiBaseDir: string;
  /** Env var name → key, from SecretStorage. */
  providerKeys: Record<string, string | undefined>;
  settings: DotySettings;
};

function definedEntries(values: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values).filter((entry): entry is [string, string] => !!entry[1]?.trim()),
  );
}

/** Env for the spawned API: runs on VSCode's Node, sandboxed to the workspace. */
export function buildApiEnv(input: ApiEnvInput): Record<string, string> {
  return {
    ...definedEntries(input.baseEnv),
    ...definedEntries(input.providerKeys),
    ...definedEntries({
      DOTY_DEFAULT_MODEL: input.settings.defaultModel,
      OPENAI_COMPATIBLE_BASE_URL: input.settings.openaiCompatibleBaseUrl,
      OPENAI_COMPATIBLE_MODELS: input.settings.openaiCompatibleModels,
    }),
    ELECTRON_RUN_AS_NODE: '1',
    NODE_ENV: 'production',
    PORT: String(input.port),
    DOTY_HOST: '127.0.0.1',
    DOTY_AUTH_TOKEN: input.token,
    DOTY_WORKSPACE_ROOTS: input.workspaceRoots.join(','),
    DOTY_DATA_DIR: input.dataDir,
    DOTY_API_BASE_DIR: input.apiBaseDir,
    // Tells the agent prompt it runs inside VS Code (default: web).
    DOTY_CLIENT: 'vscode',
  };
}
