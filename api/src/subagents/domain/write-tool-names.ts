export const SUBAGENT_TOOL_NAME = 'run_subagent';

/**
 * Built-in tools with side effects. A `writes: false` agent never gets them,
 * even when its allowlist names them. Bash is here because an approved
 * command can change files.
 */
export const WRITE_TOOL_NAMES: ReadonlySet<string> = new Set([
  'create_file',
  'edit_file',
  'overwrite_file',
  'delete_file',
  'rename_file_or_folder',
  'move_file_or_folder',
  'run_bash_command',
  'create_commit',
  'save_project_memory',
  'install_depency',
  'create_component_blueprint',
]);
