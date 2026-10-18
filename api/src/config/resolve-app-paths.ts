import * as path from 'path';

export type AppPaths = {
  /** Folder of the running code: `api/src` (ts-node/jest) or `api/dist`. */
  baseDir: string;
  apiDir: string;
  apiSourceDir: string;
  uiDir: string;
  /** Parent folder of this repo; last-resort workspace root. */
  repoParentDir: string;
  skillsDir: string;
  pluginSkillsDir: string;
  /** Built-in subagent definitions (`*.md`). */
  agentDefinitionsDir: string;
  storageDir: string;
  memoryDir: string;
  legacyMemoryDir: string;
  templatesDir: string;
};

type AppPathsInput = {
  env: Record<string, string | undefined>;
  baseDir: string;
  homeDir: string;
};

/**
 * `DOTY_API_BASE_DIR` overrides the code folder when `__dirname` is not
 * meaningful (the VSCode extension bundles the API into one file).
 */
export function resolveAppPaths({
  env,
  baseDir: codeDir,
  homeDir,
}: AppPathsInput): AppPaths {
  const baseDir = path.resolve(env.DOTY_API_BASE_DIR || codeDir);
  const apiDir = path.resolve(baseDir, '..');
  const repoDir = path.resolve(apiDir, '..');
  const storageDir = path.resolve(
    env.DOTY_DATA_DIR || path.join(homeDir, '.doty'),
  );

  return {
    baseDir,
    apiDir,
    apiSourceDir: path.join(apiDir, 'src'),
    uiDir: path.join(repoDir, 'ui'),
    repoParentDir: path.resolve(repoDir, '..'),
    skillsDir: path.join(baseDir, 'common', 'agents', 'skills'),
    pluginSkillsDir: path.join(baseDir, 'common', 'agents', 'plugin', 'skills'),
    agentDefinitionsDir: path.join(baseDir, 'subagents', 'definitions'),
    storageDir,
    memoryDir: path.join(storageDir, 'memory'),
    legacyMemoryDir: path.join(apiDir, 'storage', 'memory'),
    templatesDir: path.resolve(
      env.DOTY_TEMPLATES_DIR || path.join(repoDir, 'templates'),
    ),
  };
}
