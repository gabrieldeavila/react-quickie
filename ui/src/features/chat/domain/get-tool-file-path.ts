// Input field holding the file a tool acted on, per tool part type.
// Folder tools (list_folders) and delete_file are left out on purpose.
const FILE_PATH_FIELDS: Record<string, string> = {
  "tool-read_file": "path",
  "tool-create_file": "name",
  "tool-edit_file": "name",
  "tool-overwrite_file": "name",
  "tool-get_lint_errors": "path",
  "tool-search_content_in_file": "filePath",
  "tool-rename_file_or_folder": "newPath",
  "tool-move_file_or_folder": "destinationPath",
};

/** File path a tool card can open in the editor, if the tool has one. */
export function getToolFilePath(part: {
  type: string;
  input?: unknown;
}): string | null {
  const field = FILE_PATH_FIELDS[part.type];
  if (!field || !part.input || typeof part.input !== "object") return null;

  const value = (part.input as Record<string, unknown>)[field];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
