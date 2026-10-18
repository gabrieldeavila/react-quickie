export { createProjectTools } from './project.tools';
export { createStorageTools } from './storage.tools';
export { createMemoryTools } from './memory.tools';

export type ToolUiMetadata = {
  uiLabel: string;
  uiDescription: string;
};

export const TOOL_UI_MAPPING: Record<string, ToolUiMetadata> = {
  list_folders: {
    uiLabel: 'Listing files and folders...',
    uiDescription: 'Looking at the requested folder structure.',
  },
  create_file: {
    uiLabel: 'Creating file...',
    uiDescription: 'Creating a new file in the project.',
  },
  edit_file: {
    uiLabel: 'Editing file...',
    uiDescription: 'Replacing a specific part of the file.',
  },
  overwrite_file: {
    uiLabel: 'Overwriting file...',
    uiDescription: 'Replacing the whole file content.',
  },
  delete_file: {
    uiLabel: 'Deleting file...',
    uiDescription: 'Deleting an existing file.',
  },
  rename_file_or_folder: {
    uiLabel: 'Renaming item...',
    uiDescription: 'Renaming a file or folder.',
  },
  move_file_or_folder: {
    uiLabel: 'Moving item...',
    uiDescription: 'Moving a file or folder to another location.',
  },
  read_file: {
    uiLabel: 'Reading file...',
    uiDescription: 'Opening the file to read its content.',
  },
  get_lint_errors: {
    uiLabel: 'Checking lint errors...',
    uiDescription: 'Looking for code quality issues.',
  },
  regex_search_files_content: {
    uiLabel: 'Searching the project...',
    uiDescription: 'Searching for the pattern across files.',
  },
  search_content_in_file: {
    uiLabel: 'Searching in file...',
    uiDescription: 'Finding specific parts of a file.',
  },
  created_projects: {
    uiLabel: 'Listing projects...',
    uiDescription: 'Finding the projects in the main folder.',
  },
  check_typescript: {
    uiLabel: 'Checking TypeScript...',
    uiDescription: 'Checking the project for type errors.',
  },
  install_depency: {
    uiLabel: 'Installing dependency...',
    uiDescription: 'Adding a new dependency to the project.',
  },
  read_project_memory: {
    uiLabel: 'Reading project memory...',
    uiDescription: 'Loading the memory of the current project.',
  },
  save_project_memory: {
    uiLabel: 'Saving project memory...',
    uiDescription: 'Saving the project memory by topic.',
  },
  get_recent_commits: {
    uiLabel: 'Reading recent commits...',
    uiDescription: 'Reading the recent Git history.',
  },
  create_commit: {
    uiLabel: 'Creating commit...',
    uiDescription: 'Staging and recording a new commit.',
  },
  search_commits: {
    uiLabel: 'Searching commits...',
    uiDescription: 'Filtering commits by author, date or count.',
  },
  get_uncommitted_changes: {
    uiLabel: 'Reviewing uncommitted changes...',
    uiDescription: 'Checking changed files and the code diff.',
  },
  review_commit: {
    uiLabel: 'Reviewing commit...',
    uiDescription: 'Inspecting the files and diff of a commit.',
  },
};

export function enrichToolPart(part: Record<string, unknown>) {
  const rawType = part?.type;
  const type = typeof rawType === 'string' ? rawType : '';
  if (!type.startsWith('tool-')) return part;

  const toolName = type.replace(/^tool-/, '');
  const metadata = TOOL_UI_MAPPING[toolName];
  const output = (part as { output?: unknown }).output;

  return {
    ...part,
    uiLabel: metadata?.uiLabel ?? 'Running tool...',
    uiDescription: metadata?.uiDescription ?? 'The tool is running.',
    uiStatus: output ? 'success' : 'loading',
  };
}
