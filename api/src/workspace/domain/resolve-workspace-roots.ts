import * as path from 'path';

export type WorkspaceRootsSource =
  | 'DOTY_WORKSPACE_ROOTS'
  | 'BASE_CODE_PATH'
  | 'docker-workspace'
  | 'repo-parent';

export type WorkspaceRoots = {
  roots: string[];
  source: WorkspaceRootsSource;
};

type WorkspaceRootsInput = {
  env: Record<string, string | undefined>;
  dockerWorkspaceExists: boolean;
  repoParentDir: string;
};

export const DOCKER_WORKSPACE_DIR = '/workspace';

function parseRootList(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => path.resolve(entry));
}

/**
 * Order: DOTY_WORKSPACE_ROOTS → BASE_CODE_PATH → /workspace (Docker) →
 * parent folder of this repo. Never falls back to the home folder.
 */
export function resolveWorkspaceRoots({
  env,
  dockerWorkspaceExists,
  repoParentDir,
}: WorkspaceRootsInput): WorkspaceRoots {
  const configured = parseRootList(env.DOTY_WORKSPACE_ROOTS ?? '');
  if (configured.length) {
    return { roots: configured, source: 'DOTY_WORKSPACE_ROOTS' };
  }

  const baseCodePath = env.BASE_CODE_PATH?.trim();
  if (baseCodePath) {
    return { roots: [path.resolve(baseCodePath)], source: 'BASE_CODE_PATH' };
  }

  if (dockerWorkspaceExists) {
    return { roots: [DOCKER_WORKSPACE_DIR], source: 'docker-workspace' };
  }

  return { roots: [path.resolve(repoParentDir)], source: 'repo-parent' };
}
