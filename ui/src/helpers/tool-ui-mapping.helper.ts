export type ToolUiMeta = {
  label: string;
  description: string;
};

export const TOOL_UI_MAPPING: Record<string, ToolUiMeta> = {
  "tool-list_folders": {
    label: "Listing files and folders...",
    description: "Checking the project's directory structure.",
  },
  "tool-create_file": {
    label: "Creating file...",
    description: "Creating a new file in the project.",
  },
  "tool-edit_file": {
    label: "Editing file...",
    description: "Replacing a specific block of content in an existing file.",
  },
  "tool-overwrite_file": {
    label: "Overwriting file...",
    description: "Replacing the entire content of an existing file.",
  },
  "tool-delete_file": {
    label: "Deleting file...",
    description: "Removing a file from the project.",
  },
  "tool-rename_file_or_folder": {
    label: "Renaming item...",
    description: "Changing the name of an existing file or folder.",
  },
  "tool-move_file_or_folder": {
    label: "Moving item...",
    description: "Moving a file or folder to another path.",
  },
  "tool-read_file": {
    label: "Reading file content...",
    description: "Opening the requested file to analyze its content.",
  },
  "tool-get_lint_errors": {
    label: "Checking lint errors...",
    description: "Analyzing the code for style and quality issues.",
  },
  "tool-regex_search_files_content": {
    label: "Searching files for a pattern...",
    description: "Looking for matches of a regex pattern across multiple files.",
  },
  "tool-search_content_in_file": {
    label: "Searching file content...",
    description: "Looking for a regex pattern inside a specific file.",
  },
  "tool-search_web": {
    label: "Searching the web...",
    description: "Checking external sources for relevant information.",
  },
  "tool-check_typescript": {
    label: "Checking TypeScript...",
    description: "Checking the code's types and consistency.",
  },
  "tool-create_commit": {
    label: "Creating commit...",
    description: "Recording the changes in the Git history.",
  },
  "tool-get_recent_commits": {
    label: "Fetching recent commits...",
    description: "Reading the repository's latest commits.",
  },
  "tool-search_commits": {
    label: "Searching commits...",
    description: "Looking for commits that match the given criteria.",
  },
  "tool-get_uncommitted_changes": {
    label: "Checking uncommitted changes...",
    description: "Analyzing the changed files in the repository.",
  },
  "tool-review_commit": {
    label: "Reviewing commit...",
    description: "Inspecting the details of the requested commit.",
  },
  "tool-created_projects": {
    label: "Listing created projects...",
    description: "Checking the projects available in the main directory.",
  },
  "tool-check_typescript_projects": {
    label: "Checking TypeScript across projects...",
    description: "Checking TypeScript consistency in the projects found.",
  },
  "tool-create_component_blueprint": {
    label: "Generating component blueprint...",
    description: "Building the base structure of a new React component.",
  },
  "tool-install_depency": {
    label: "Installing dependency...",
    description: "Adding a new dependency to the project.",
  },
};

export function getToolUiMeta(toolType: string): ToolUiMeta {
  return (
    TOOL_UI_MAPPING[toolType] ?? {
      label: "Running tool...",
      description: "Processing a requested operation.",
    }
  );
}

export function isToolPartType(partType: string | undefined): boolean {
  return typeof partType === "string" && partType.startsWith("tool-");
}
