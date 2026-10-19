import type { SystemModelMessage } from 'ai';
import type { GitSummary } from './parse-git-status';
import type { DotyClient } from './resolve-doty-client';

export type EnvironmentFacts = {
  client: DotyClient;
  workspaceRoots: string[];
  activeRoot?: string;
  platform: string;
  osRelease: string;
  shell?: string;
  date: Date;
  /** Undefined when git couldn't be read (timeout, git missing). */
  git?: GitSummary;
  modelRef?: string;
  toolsAvailable: boolean;
  instructionNames: string[];
};

const CLIENT_LABELS: Record<DotyClient, string> = {
  vscode: 'VS Code extension',
  web: 'web app',
};

/** Local calendar date as YYYY-MM-DD. */
function formatDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatRoots({ workspaceRoots, activeRoot }: EnvironmentFacts): string {
  const roots = workspaceRoots.length ? workspaceRoots.join(', ') : 'none';
  return `- Workspace roots: ${roots} · active root: ${activeRoot ?? 'none'}`;
}

function formatPlatform({ platform, osRelease, shell }: EnvironmentFacts) {
  const system = `- Platform: ${platform} ${osRelease}`;
  return shell ? `${system} · shell: ${shell}` : system;
}

function formatGit(git: GitSummary | undefined): string | null {
  if (!git) return null;
  if (!git.isRepository) return '- Git: not a git repository';
  const branch = git.branch ? `branch ${git.branch}` : 'detached HEAD';
  const files = git.changedFiles === 1 ? 'file' : 'files';
  return `- Git: ${branch}, ${git.changedFiles} changed ${files}`;
}

function formatModel({ modelRef, toolsAvailable }: EnvironmentFacts): string {
  const tools = toolsAvailable ? 'available' : 'unavailable';
  return `- Model: ${modelRef ?? 'unknown'} · tools: ${tools}`;
}

function formatInstructions({ instructionNames }: EnvironmentFacts) {
  return instructionNames.length
    ? `- Instructions in use: ${instructionNames.join(', ')}`
    : null;
}

/**
 * Last system message of a request: facts that change per request, kept at
 * the end so the static prompt before it stays cacheable.
 */
export function buildEnvironmentBlock(
  facts: EnvironmentFacts,
): SystemModelMessage {
  const lines = [
    'Environment',
    `- Interface: ${CLIENT_LABELS[facts.client]}`,
    formatRoots(facts),
    formatPlatform(facts),
    `- Date: ${formatDate(facts.date)}`,
    formatGit(facts.git),
    formatModel(facts),
    formatInstructions(facts),
  ];

  return {
    role: 'system',
    content: lines.filter((line) => line !== null).join('\n'),
  };
}
