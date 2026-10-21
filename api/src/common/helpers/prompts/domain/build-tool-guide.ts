import type { SystemModelMessage } from 'ai';

type ToolGroup = {
  title: string;
  matches: (toolName: string) => boolean;
  guidance: string[];
};

const named =
  (...names: string[]) =>
  (toolName: string) =>
    names.includes(toolName);

const TOOL_GROUPS: ToolGroup[] = [
  {
    title: 'Files',
    matches: named(
      'read_file',
      'edit_file',
      'overwrite_file',
      'create_file',
      'delete_file',
      'move_file_or_folder',
      'rename_file_or_folder',
    ),
    guidance: [
      'Read a file before you edit it, and re-read it if it may have changed since.',
      'Prefer `edit_file` (a targeted replacement) over `overwrite_file`; rewrite a whole file only when most of it changes.',
      'Paths are relative to the active workspace root.',
    ],
  },
  {
    title: 'Search',
    matches: named(
      'list_folders',
      'regex_search_files_content',
      'search_content_in_file',
    ),
    guidance: [
      'Search or list folders before guessing a path or a symbol name.',
      'Start narrow (a folder, a file pattern) and widen only when nothing turns up.',
    ],
  },
  {
    title: 'Shell',
    matches: named(
      'run_bash_command',
      'install_dependency',
      'check_typescript',
      'get_lint_errors',
    ),
    guidance: [
      'Run non-interactive commands only (no prompts, editors or watch modes); pass flags such as `--yes` or `CI=1` when a tool would ask.',
      "Check the exit code and output before saying a command worked; don't hide failures.",
      "Use the project's own scripts and package manager (see `package.json` and lock files) for type-check, lint and tests.",
    ],
  },
  {
    title: 'Git',
    matches: named(
      'get_uncommitted_changes',
      'get_recent_commits',
      'search_commits',
      'review_commit',
      'create_commit',
    ),
    guidance: [
      'Inspect the state (uncommitted changes, recent commits) before committing or describing history.',
      'Commit only when the user asks. Before `create_commit`, summarize the changes, point out anything unfinished (debug logs, commented-out code), and propose the message.',
      'Write Conventional Commits: `<type>(<scope>): <imperative description>`, with type one of feat, fix, chore, refactor, docs, style, test, perf.',
      "Summarize diffs and logs for the user (`[<short-hash>] <message> - <author> (<date>)`); don't paste raw JSON or whole patches. Report git errors as they are.",
    ],
  },
  {
    title: 'Project memory',
    matches: named('save_project_memory'),
    guidance: [
      'Save only durable facts about the project that will help later conversations, not details of the current task.',
    ],
  },
  {
    title: 'Instructions',
    matches: named('list_instructions', 'read_instruction', 'save_instruction'),
    guidance: [
      'Instructions are reusable Markdown guidance the user attaches to conversations. When asked to save something as an instruction, write focused, imperative guidance (not a transcript), with a short name and a one-line description of when to use it.',
      'To change an existing instruction, read it first and save it with `replace: true`. Never overwrite one the user did not ask you to change.',
    ],
  },
  {
    title: 'Subagents',
    matches: named('run_subagent'),
    guidance: [
      'Delegate only self-contained work. Subagents do not see this conversation, so give each one a complete task with the context it needs.',
      'Launch independent subagents in the same step so they run in parallel.',
    ],
  },
  {
    title: 'MCP servers',
    matches: (toolName) => toolName.startsWith('mcp__'),
    guidance: [
      'Tools named `mcp__<server>__<tool>` act on external systems configured by the user. Mind their side effects: they may change data outside the workspace.',
    ],
  },
];

function formatGroup({ title, guidance }: ToolGroup): string {
  return [`${title}:`, ...guidance.map((line) => `- ${line}`)].join('\n');
}

/**
 * How to use the tools of this request. A group is listed only when one of
 * its tools is in the toolset, so the prompt never promises a missing tool.
 */
export function buildToolGuide(toolNames: string[]): SystemModelMessage[] {
  const groups = TOOL_GROUPS.filter((group) => toolNames.some(group.matches));
  if (!groups.length) return [];

  return [
    {
      role: 'system',
      content: ['Tool guide', ...groups.map(formatGroup)].join('\n\n'),
    },
  ];
}
